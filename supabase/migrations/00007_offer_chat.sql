-- Teklif sohbeti: ilk mesaj, görüldü, bildirim sohbet linki

create or replace function public.place_offer(
  p_listing_id uuid,
  p_amount numeric,
  p_message text,
  p_eta_text text default null,
  p_image_urls text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_listing public.listings%rowtype;
  v_wallet public.wallets%rowtype;
  v_fee numeric(12,2);
  v_base_fee numeric(12,2);
  v_promo public.seller_promos%rowtype;
  v_has_promo boolean := false;
  v_from_credit numeric(12,2);
  v_from_cash numeric(12,2);
  v_offer_id uuid;
  v_conv_id uuid;
  v_body text;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if v_profile.role = 'admin' then
    null;
  elsif v_profile.role <> 'seller' or v_profile.seller_status is distinct from 'approved' then
    raise exception 'Yalnızca onaylı satıcılar teklif verebilir';
  end if;

  select * into v_listing from public.listings where id = p_listing_id for share;
  if not found then
    raise exception 'İlan bulunamadı';
  end if;
  if v_listing.status <> 'open' then
    raise exception 'Bu ilan teklife kapalı';
  end if;
  if v_listing.user_id = v_uid then
    raise exception 'Kendi ilanınıza teklif veremezsiniz';
  end if;
  if exists (
    select 1 from public.offers
    where listing_id = p_listing_id and seller_id = v_uid and status in ('pending', 'accepted')
  ) then
    raise exception 'Bu ilana zaten bir teklifiniz var';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Geçerli bir teklif tutarı girin';
  end if;

  select bid_fee_amount into v_base_fee from public.platform_settings where id = 1;
  v_fee := v_base_fee;

  select * into v_promo
  from public.seller_promos
  where user_id = v_uid and remaining_discounted_offers > 0
  order by created_at asc
  limit 1
  for update;

  if found then
    v_has_promo := true;
    if v_promo.discount_percent > 0 then
      v_fee := round(v_base_fee * (1 - v_promo.discount_percent / 100.0), 2);
    end if;
  end if;

  v_wallet := public.ensure_wallet(v_uid);
  select * into v_wallet from public.wallets where user_id = v_uid for update;

  if (v_wallet.credit_balance + v_wallet.cash_balance) < v_fee then
    raise exception 'Yetersiz bakiye. Teklif ücreti: % TL', v_fee;
  end if;

  v_from_credit := least(v_wallet.credit_balance, v_fee);
  v_from_cash := v_fee - v_from_credit;

  update public.wallets
    set credit_balance = credit_balance - v_from_credit,
        cash_balance = cash_balance - v_from_cash
    where user_id = v_uid;

  if v_from_credit > 0 then
    insert into public.wallet_transactions (wallet_id, user_id, type, amount, balance_kind, listing_id, meta)
    values (v_wallet.id, v_uid, 'credit_spend', v_from_credit, 'credit', p_listing_id,
      jsonb_build_object('fee_total', v_fee, 'base_fee', v_base_fee));
  end if;
  if v_from_cash > 0 then
    insert into public.wallet_transactions (wallet_id, user_id, type, amount, balance_kind, listing_id, meta)
    values (v_wallet.id, v_uid, 'bid_fee', v_from_cash, 'cash', p_listing_id,
      jsonb_build_object('fee_total', v_fee, 'base_fee', v_base_fee));
  end if;

  if v_has_promo then
    update public.seller_promos
      set remaining_discounted_offers = remaining_discounted_offers - 1
      where id = v_promo.id;
  end if;

  insert into public.offers (listing_id, seller_id, amount, message, eta_text, image_urls, fee_charged)
  values (p_listing_id, v_uid, p_amount, p_message, p_eta_text, coalesce(p_image_urls, '{}'), v_fee)
  returning id into v_offer_id;

  insert into public.conversations (listing_id, buyer_id, seller_id)
  values (p_listing_id, v_listing.user_id, v_uid)
  on conflict (listing_id, seller_id) do update set updated_at = now()
  returning id into v_conv_id;

  v_body := trim(p_message);
  if p_eta_text is not null and length(trim(p_eta_text)) > 0 then
    v_body := v_body || E'\nSüre: ' || trim(p_eta_text);
  end if;

  insert into public.messages (conversation_id, sender_id, body)
  values (v_conv_id, v_uid, v_body);

  perform public.notify_user(
    v_listing.user_id,
    'offer',
    'Yeni teklif',
    coalesce(v_profile.display_name, 'Bir satıcı') || ' ilanınıza teklif verdi.',
    '/mesajlar/' || v_conv_id::text,
    jsonb_build_object('offer_id', v_offer_id, 'listing_id', p_listing_id, 'conversation_id', v_conv_id)
  );

  return v_offer_id;
end;
$$;

create or replace function public.mark_conversation_read(p_conversation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_conv public.conversations%rowtype;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;
  select * into v_conv from public.conversations where id = p_conversation_id;
  if not found then
    raise exception 'Sohbet bulunamadı';
  end if;
  if v_uid <> v_conv.buyer_id and v_uid <> v_conv.seller_id and not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;
  update public.messages
    set read_at = now()
  where conversation_id = p_conversation_id
    and sender_id <> v_uid
    and read_at is null;
end;
$$;

grant execute on function public.mark_conversation_read to authenticated;

insert into public.messages (conversation_id, sender_id, body)
select c.id, o.seller_id,
  trim(o.message) || case
    when o.eta_text is not null and length(trim(o.eta_text)) > 0 then E'\nSüre: ' || trim(o.eta_text)
    else ''
  end
from public.offers o
join public.conversations c
  on c.listing_id = o.listing_id and c.seller_id = o.seller_id
where not exists (
  select 1 from public.messages m where m.conversation_id = c.id
);

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;

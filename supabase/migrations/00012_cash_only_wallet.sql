-- Tek birim: nakit bakiye. Mevcut krediler nakite taşınır.

update public.wallets
set cash_balance = cash_balance + credit_balance,
    credit_balance = 0
where credit_balance > 0;

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'platform_settings'
      and column_name = 'new_seller_credit_amount'
  ) then
    alter table public.platform_settings
      rename column new_seller_credit_amount to new_seller_welcome_balance;
  end if;
end $$;

create or replace function public.apply_seller_benefits(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.platform_settings%rowtype;
  v_wallet public.wallets;
  v_campaign public.promo_campaigns%rowtype;
  v_bonus numeric(12,2);
  v_discount numeric(5,2);
  v_offers int;
  v_use_campaign boolean := false;
begin
  select * into v_settings from public.platform_settings where id = 1;
  v_wallet := public.ensure_wallet(p_user);

  v_bonus := v_settings.new_seller_welcome_balance;
  v_discount := v_settings.new_seller_discount_percent;
  v_offers := v_settings.new_seller_discounted_offer_count;
  v_use_campaign := v_discount > 0 or v_offers > 0;

  if v_use_campaign then
    select * into v_campaign
    from public.promo_campaigns
    where is_active = true
      and apply_on = 'seller_approval'
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
      and (max_redemptions is null or redeemed_count < max_redemptions)
    order by created_at asc
    limit 1;

    if found then
      v_bonus := v_bonus + v_campaign.credit_amount;
      if v_campaign.bid_fee_discount_percent > v_discount then
        v_discount := v_campaign.bid_fee_discount_percent;
      end if;
      if v_campaign.discounted_offer_count > v_offers then
        v_offers := v_campaign.discounted_offer_count;
      end if;
      update public.promo_campaigns
        set redeemed_count = redeemed_count + 1
        where id = v_campaign.id;
    end if;
  end if;

  if v_bonus > 0 then
    update public.wallets
      set cash_balance = cash_balance + v_bonus
      where user_id = p_user;
    insert into public.wallet_transactions (wallet_id, user_id, type, amount, balance_kind, note)
    values (v_wallet.id, p_user, 'adjustment', v_bonus, 'cash', 'Hoş geldin bakiyesi');
    perform public.notify_user(p_user, 'wallet', 'Bakiyeniz tanımlandı',
      v_bonus::text || ' TL cüzdanınıza eklendi.', '/satici/cuzdan', '{}'::jsonb);
  end if;

  if v_offers > 0 and v_discount > 0 then
    insert into public.seller_promos (user_id, campaign_id, remaining_discounted_offers, discount_percent, granted_credit)
    values (p_user, v_campaign.id, v_offers, v_discount, v_bonus);
  end if;
end;
$$;

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

  if v_wallet.cash_balance < v_fee then
    raise exception 'Yetersiz bakiye. Teklif ücreti: % TL', v_fee;
  end if;

  update public.wallets
    set cash_balance = cash_balance - v_fee
    where user_id = v_uid;

  insert into public.wallet_transactions (wallet_id, user_id, type, amount, balance_kind, listing_id, meta)
  values (v_wallet.id, v_uid, 'bid_fee', v_fee, 'cash', p_listing_id,
    jsonb_build_object('fee_total', v_fee, 'base_fee', v_base_fee));

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

create or replace function public.grant_balance(
  p_user_id uuid,
  p_amount numeric,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.wallets;
begin
  if not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Tutar pozitif olmalı';
  end if;

  v_wallet := public.ensure_wallet(p_user_id);
  update public.wallets set cash_balance = cash_balance + p_amount where user_id = p_user_id;

  insert into public.wallet_transactions (wallet_id, user_id, type, amount, balance_kind, note)
  values (v_wallet.id, p_user_id, 'topup', p_amount, 'cash', coalesce(p_note, 'Admin yüklemesi'));

  perform public.notify_user(p_user_id, 'wallet', 'Bakiyeniz güncellendi',
    p_amount::text || ' TL cüzdanınıza eklendi.', '/satici/cuzdan', '{}'::jsonb);
end;
$$;

drop function if exists public.update_platform_settings(numeric, numeric, numeric, integer);

create or replace function public.update_platform_settings(
  p_bid_fee numeric,
  p_welcome_balance numeric,
  p_discount numeric,
  p_offer_count int
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;
  update public.platform_settings
  set bid_fee_amount = p_bid_fee,
      new_seller_welcome_balance = p_welcome_balance,
      new_seller_discount_percent = p_discount,
      new_seller_discounted_offer_count = p_offer_count
  where id = 1;
end;
$$;

drop function if exists public.grant_balance(uuid, numeric, public.balance_kind, text);

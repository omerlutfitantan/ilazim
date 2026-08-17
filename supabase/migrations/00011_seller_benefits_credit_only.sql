-- Platform ayarlarında indirim/adet 0 iken kampanya bu alanları ezmesin.
-- Kredi-only model: yalnızca new_seller_credit_amount tanımlanır (ör. 150 TL ÷ 50 TL = 3 teklif).

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
  v_credit numeric(12,2);
  v_discount numeric(5,2);
  v_offers int;
  v_use_campaign boolean := false;
begin
  select * into v_settings from public.platform_settings where id = 1;
  v_wallet := public.ensure_wallet(p_user);

  v_credit := v_settings.new_seller_credit_amount;
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
      v_credit := v_credit + v_campaign.credit_amount;
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

  if v_credit > 0 then
    update public.wallets
      set credit_balance = credit_balance + v_credit
      where user_id = p_user;
    insert into public.wallet_transactions (wallet_id, user_id, type, amount, balance_kind, note)
    values (v_wallet.id, p_user, 'credit_grant', v_credit, 'credit', 'İlk üye / onay kredisi');
    perform public.notify_user(p_user, 'wallet', 'Krediniz tanımlandı',
      v_credit::text || ' TL teklif kredisi hesabınıza eklendi.', '/satici/cuzdan', '{}'::jsonb);
  end if;

  if v_offers > 0 and v_discount > 0 then
    insert into public.seller_promos (user_id, campaign_id, remaining_discounted_offers, discount_percent, granted_credit)
    values (p_user, v_campaign.id, v_offers, v_discount, v_credit);
  end if;
end;
$$;

-- Varsayılan seed kampanyası platform ayarlarını gölgelemesin.
update public.promo_campaigns
set is_active = false
where id = '40000000-0000-4000-a000-000000000001';

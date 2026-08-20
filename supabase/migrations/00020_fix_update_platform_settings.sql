-- update_platform_settings fonksiyonunu dogru kolon adiyla guncelle
-- (DB’de yeni satir kredisi alan adi: new_seller_welcome_balance)
create or replace function public.update_platform_settings(
  p_bid_fee numeric,
  p_new_credit numeric,
  p_discount numeric,
  p_offer_count int,
  p_topup_presets jsonb default null
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
      new_seller_welcome_balance = p_new_credit,
      new_seller_discount_percent = p_discount,
      new_seller_discounted_offer_count = p_offer_count,
      topup_presets = coalesce(p_topup_presets, topup_presets)
  where id = 1;
end;
$$;

notify pgrst, 'reload schema';


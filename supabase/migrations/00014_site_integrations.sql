-- Kampanya tablosunu kaldır; satıcı avantajı yalnızca platform ayarlarından gelsin.
-- Admin entegrasyonları (e-posta, ödeme, Google) ayrı ve gizli tabloda.

create or replace function public.apply_seller_benefits(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.platform_settings%rowtype;
  v_wallet public.wallets;
  v_bonus numeric(12,2);
  v_discount numeric(5,2);
  v_offers int;
begin
  select * into v_settings from public.platform_settings where id = 1;
  v_wallet := public.ensure_wallet(p_user);

  v_bonus := v_settings.new_seller_welcome_balance;
  v_discount := v_settings.new_seller_discount_percent;
  v_offers := v_settings.new_seller_discounted_offer_count;

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
    insert into public.seller_promos (user_id, remaining_discounted_offers, discount_percent, granted_credit)
    values (p_user, v_offers, v_discount, v_bonus);
  end if;
end;
$$;

alter table public.seller_promos drop constraint if exists seller_promos_campaign_id_fkey;
alter table public.seller_promos drop column if exists campaign_id;

drop table if exists public.promo_campaigns cascade;
drop type if exists public.promo_apply_on cascade;

create table if not exists public.site_integrations (
  id int primary key default 1 check (id = 1),
  email_from text,
  resend_api_key text,
  iyzico_api_key text,
  iyzico_secret_key text,
  iyzico_base_url text not null default 'https://api.iyzipay.com',
  ga_measurement_id text,
  gtm_container_id text,
  google_ads_id text,
  google_site_verification text,
  updated_at timestamptz not null default now()
);

insert into public.site_integrations (id) values (1)
on conflict (id) do nothing;

revoke all on table public.site_integrations from public, anon, authenticated;
grant select, update on public.site_integrations to authenticated;

alter table public.site_integrations enable row level security;

drop policy if exists integrations_admin_read on public.site_integrations;
drop policy if exists integrations_admin_write on public.site_integrations;

create policy integrations_admin_read on public.site_integrations
  for select using (public.is_admin());
create policy integrations_admin_write on public.site_integrations
  for update using (public.is_admin()) with check (public.is_admin());

create or replace function public.get_public_site_tags()
returns table (
  ga_measurement_id text,
  gtm_container_id text,
  google_ads_id text,
  google_site_verification text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    nullif(trim(ga_measurement_id), ''),
    nullif(trim(gtm_container_id), ''),
    nullif(trim(google_ads_id), ''),
    nullif(trim(google_site_verification), '')
  from public.site_integrations
  where id = 1;
$$;

create or replace function public.get_admin_integrations()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_row public.site_integrations%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;
  select * into v_row from public.site_integrations where id = 1;
  if not found then
    return '{}'::jsonb;
  end if;
  return jsonb_build_object(
    'email_from', v_row.email_from,
    'resend_api_key_set', coalesce(length(trim(v_row.resend_api_key)) > 0, false),
    'iyzico_api_key_set', coalesce(length(trim(v_row.iyzico_api_key)) > 0, false),
    'iyzico_secret_key_set', coalesce(length(trim(v_row.iyzico_secret_key)) > 0, false),
    'iyzico_base_url', v_row.iyzico_base_url,
    'ga_measurement_id', v_row.ga_measurement_id,
    'gtm_container_id', v_row.gtm_container_id,
    'google_ads_id', v_row.google_ads_id,
    'google_site_verification', v_row.google_site_verification
  );
end;
$$;

create or replace function public.update_site_integrations(
  p_email_from text default null,
  p_resend_api_key text default null,
  p_iyzico_api_key text default null,
  p_iyzico_secret_key text default null,
  p_iyzico_base_url text default null,
  p_ga_measurement_id text default null,
  p_gtm_container_id text default null,
  p_google_ads_id text default null,
  p_google_site_verification text default null
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
  insert into public.site_integrations (id) values (1) on conflict (id) do nothing;
  update public.site_integrations
  set email_from = nullif(trim(coalesce(p_email_from, '')), ''),
      resend_api_key = coalesce(nullif(trim(coalesce(p_resend_api_key, '')), ''), resend_api_key),
      iyzico_api_key = coalesce(nullif(trim(coalesce(p_iyzico_api_key, '')), ''), iyzico_api_key),
      iyzico_secret_key = coalesce(nullif(trim(coalesce(p_iyzico_secret_key, '')), ''), iyzico_secret_key),
      iyzico_base_url = coalesce(nullif(trim(coalesce(p_iyzico_base_url, '')), ''), iyzico_base_url, 'https://api.iyzipay.com'),
      ga_measurement_id = nullif(trim(coalesce(p_ga_measurement_id, '')), ''),
      gtm_container_id = nullif(trim(coalesce(p_gtm_container_id, '')), ''),
      google_ads_id = nullif(trim(coalesce(p_google_ads_id, '')), ''),
      google_site_verification = nullif(trim(coalesce(p_google_site_verification, '')), ''),
      updated_at = now()
  where id = 1;
end;
$$;

grant execute on function public.get_public_site_tags() to anon, authenticated;
grant execute on function public.get_admin_integrations() to authenticated;
grant execute on function public.update_site_integrations(text, text, text, text, text, text, text, text, text) to authenticated;

notify pgrst, 'reload schema';

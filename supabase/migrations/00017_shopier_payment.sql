-- Shopier tabanlı bakiye yükleme için ayar alanlarını ekler ve topup provider'ını günceller.

alter table public.site_integrations
  add column if not exists shopier_pat text,
  add column if not exists shopier_shop_slug text,
  add column if not exists shopier_osb_username text,
  add column if not exists shopier_osb_password text;

-- Eski webhook_token kolonu varsa koru (zarar vermez), ama artık kullanmıyoruz

-- Provider default'ını güncelle (opsiyonel ama tutarlı olsun)
alter table public.payments
  alter column provider set default 'shopier';

-- Admin entegrasyonları döndür
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

    'shopier_pat_set', coalesce(length(trim(v_row.shopier_pat)) > 0, false),
    'shopier_shop_slug_set', coalesce(length(trim(v_row.shopier_shop_slug)) > 0, false),
    'shopier_shop_slug', v_row.shopier_shop_slug,
    'shopier_osb_username_set', coalesce(length(trim(v_row.shopier_osb_username)) > 0, false),
    'shopier_osb_password_set', coalesce(length(trim(v_row.shopier_osb_password)) > 0, false),

    'ga_measurement_id', v_row.ga_measurement_id,
    'gtm_container_id', v_row.gtm_container_id,
    'google_ads_id', v_row.google_ads_id,
    'google_site_verification', v_row.google_site_verification
  );
end;
$$;

-- Shopier dahil yeni entegrasyon güncelleme fonksiyonu
drop function if exists public.update_site_integrations(
  p_email_from text,
  p_resend_api_key text,
  p_iyzico_api_key text,
  p_iyzico_secret_key text,
  p_iyzico_base_url text,
  p_ga_measurement_id text,
  p_gtm_container_id text,
  p_google_ads_id text,
  p_google_site_verification text
);

drop function if exists public.update_site_integrations(
  p_email_from text,
  p_resend_api_key text,
  p_shopier_pat text,
  p_shopier_shop_slug text,
  p_shopier_webhook_token text,
  p_ga_measurement_id text,
  p_gtm_container_id text,
  p_google_ads_id text,
  p_google_site_verification text
);

create or replace function public.update_site_integrations(
  p_email_from text default null,
  p_resend_api_key text default null,
  p_shopier_pat text default null,
  p_shopier_shop_slug text default null,
  p_shopier_osb_username text default null,
  p_shopier_osb_password text default null,
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

      shopier_pat = coalesce(nullif(trim(coalesce(p_shopier_pat, '')), ''), shopier_pat),
      shopier_shop_slug = coalesce(nullif(trim(coalesce(p_shopier_shop_slug, '')), ''), shopier_shop_slug),
      shopier_osb_username = coalesce(nullif(trim(coalesce(p_shopier_osb_username, '')), ''), shopier_osb_username),
      shopier_osb_password = coalesce(nullif(trim(coalesce(p_shopier_osb_password, '')), ''), shopier_osb_password),

      ga_measurement_id = nullif(trim(coalesce(p_ga_measurement_id, '')), ''),
      gtm_container_id = nullif(trim(coalesce(p_gtm_container_id, '')), ''),
      google_ads_id = nullif(trim(coalesce(p_google_ads_id, '')), ''),
      google_site_verification = nullif(trim(coalesce(p_google_site_verification, '')), ''),
      updated_at = now()
  where id = 1;
end;
$$;

grant execute on function public.get_admin_integrations() to authenticated;
grant execute on function public.update_site_integrations(
  text, text, text, text, text, text, text, text, text, text
) to authenticated;

notify pgrst, 'reload schema';

-- Topup ödeme oluşturma: Shopier provider'ını kullan
create or replace function public.create_topup_payment(p_amount numeric)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_role public.user_role;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;
  select role into v_role from public.profiles where id = v_uid;
  if v_role not in ('seller', 'admin') then
    raise exception 'Yalnızca satıcılar bakiye yükleyebilir';
  end if;
  if p_amount is null or p_amount < 50 then
    raise exception 'En az 50 TL yükleyebilirsiniz';
  end if;
  perform public.ensure_wallet(v_uid);

  insert into public.payments (user_id, amount, provider, status)
  values (v_uid, p_amount, 'shopier', 'pending')
  returning id into v_id;

  return v_id;
end;
$$;

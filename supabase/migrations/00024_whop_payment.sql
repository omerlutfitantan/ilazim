-- Whop ödeme entegrasyonu: Shopier alanlarını Whop ile değiştir
alter table public.site_integrations
  add column if not exists whop_api_key text,
  add column if not exists whop_company_id text,
  add column if not exists whop_webhook_secret text,
  add column if not exists whop_product_id text;

alter table public.payments
  alter column provider set default 'whop';

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
    'whop_api_key_set', coalesce(length(trim(v_row.whop_api_key)) > 0, false),
    'whop_company_id', v_row.whop_company_id,
    'whop_webhook_secret_set', coalesce(length(trim(v_row.whop_webhook_secret)) > 0, false),
    'whop_product_id', v_row.whop_product_id,
    'ga_measurement_id', v_row.ga_measurement_id,
    'gtm_container_id', v_row.gtm_container_id,
    'google_ads_id', v_row.google_ads_id,
    'google_site_verification', v_row.google_site_verification
  );
end;
$$;

drop function if exists public.update_site_integrations(
  text, text, text, text, text, text, text, text, text, text
);

create or replace function public.update_site_integrations(
  p_email_from text default null,
  p_resend_api_key text default null,
  p_whop_api_key text default null,
  p_whop_company_id text default null,
  p_whop_webhook_secret text default null,
  p_whop_product_id text default null,
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
      whop_api_key = coalesce(nullif(trim(coalesce(p_whop_api_key, '')), ''), whop_api_key),
      whop_company_id = nullif(trim(coalesce(p_whop_company_id, '')), ''),
      whop_webhook_secret = coalesce(nullif(trim(coalesce(p_whop_webhook_secret, '')), ''), whop_webhook_secret),
      whop_product_id = nullif(trim(coalesce(p_whop_product_id, '')), ''),
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

-- Topup: onaylı satıcı + whop provider (00023 kurallarını koru)
create or replace function public.create_topup_payment(p_amount numeric)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_profile public.profiles%rowtype;
  v_min numeric;
  v_min_int int;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;

  select * into v_profile from public.profiles where id = v_uid;

  if v_profile.role = 'admin' then
    null;
  elsif v_profile.role <> 'seller' or v_profile.seller_status is distinct from 'approved' then
    raise exception 'Bakiye yüklemek için satıcı hesabınızın onaylanması gerekir';
  end if;

  select min((value)::numeric)
  into v_min
  from public.platform_settings ps,
       jsonb_array_elements_text(ps.topup_presets) as t(value)
  where ps.id = 1;

  v_min_int := coalesce(round(v_min), 50)::int;

  if p_amount is null or p_amount < v_min_int then
    raise exception 'En az %s TL yükleyebilirsiniz', v_min_int;
  end if;

  perform public.ensure_wallet(v_uid);

  insert into public.payments (user_id, amount, provider, status)
  values (v_uid, p_amount, 'whop', 'pending')
  returning id into v_id;

  return v_id;
end;
$$;

notify pgrst, 'reload schema';

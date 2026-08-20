-- Bakiye yukleme yalnizca onayli satıcilar (veya admin) icin
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
  values (v_uid, p_amount, 'shopier', 'pending')
  returning id into v_id;

  return v_id;
end;
$$;

-- buyer -> seller gecisinde durum her zaman pending olsun (null kalmasin)
create or replace function public.upgrade_to_seller()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role public.user_role;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;

  select role into v_role from public.profiles where id = v_uid;

  if v_role = 'seller' or v_role = 'admin' then
    perform public.ensure_wallet(v_uid);
    return;
  end if;

  update public.profiles
  set
    role = 'seller'::public.user_role,
    seller_status = 'pending'::public.seller_status
  where id = v_uid;

  perform public.ensure_wallet(v_uid);
  insert into public.seller_stats (seller_id) values (v_uid)
  on conflict (seller_id) do nothing;
end;
$$;

notify pgrst, 'reload schema';

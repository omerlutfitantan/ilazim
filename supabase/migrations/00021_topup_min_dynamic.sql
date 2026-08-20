-- Topup minimum miktarini, platform_settings.topup_presets icindeki en dusuk degerden hesapla
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
  v_min numeric;
  v_min_int int;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;

  select role into v_role from public.profiles where id = v_uid;
  if v_role not in ('seller', 'admin') then
    raise exception 'Yalnızca satıcılar bakiye yükleyebilir';
  end if;

  -- platform_settings.topup_presets -> jsonb array -> min degeri
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


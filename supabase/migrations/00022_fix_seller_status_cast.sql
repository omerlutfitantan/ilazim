-- request_seller_role: CASE ifadesi text donuyor; enum kolonuna cast gerekli
create or replace function public.request_seller_role(
  p_seller_type public.seller_type,
  p_headline text,
  p_bio text,
  p_city_id uuid,
  p_district_id uuid default null,
  p_phone text default null,
  p_category_ids uuid[] default '{}'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;

  update public.profiles
  set
    role = case
      when role = 'admin' then role
      else 'seller'::public.user_role
    end,
    seller_type = p_seller_type,
    seller_headline = p_headline,
    bio = p_bio,
    city_id = p_city_id,
    district_id = p_district_id,
    phone = coalesce(p_phone, phone),
    seller_status = (
      case
        when role = 'admin' then 'approved'
        when seller_status = 'approved' then 'approved'
        else 'pending'
      end
    )::public.seller_status,
    onboarding_completed_at = now()
  where id = v_uid;

  perform public.ensure_wallet(v_uid);
  insert into public.seller_stats (seller_id) values (v_uid)
  on conflict (seller_id) do nothing;

  if p_seller_type in ('service', 'both') then
    perform public.set_seller_categories(p_category_ids);
  else
    delete from public.seller_categories where user_id = v_uid;
  end if;
end;
$$;

-- upgrade_to_seller: role + seller_status (pending) birlikte set edilsin
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
    seller_status = coalesce(seller_status, 'pending'::public.seller_status)
  where id = v_uid;

  perform public.ensure_wallet(v_uid);
  insert into public.seller_stats (seller_id) values (v_uid)
  on conflict (seller_id) do nothing;
end;
$$;

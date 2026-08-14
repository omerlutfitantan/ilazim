-- Verdiğin hizmet kategorisinde talep açılmaz; açık talebin olan kategori hizmetlerime eklenemez.

create or replace function public.publish_listing(
  p_category_id uuid,
  p_title text,
  p_description text,
  p_city_id uuid,
  p_district_id uuid default null,
  p_budget_min numeric default null,
  p_budget_max numeric default null,
  p_image_urls text[] default '{}',
  p_show_phone boolean default false,
  p_phone text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_kind public.listing_kind;
  v_id uuid;
  v_slug text;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;
  select kind into v_kind from public.categories where id = p_category_id;
  if not found then
    raise exception 'Kategori bulunamadı';
  end if;
  if v_kind = 'service' and exists (
    select 1 from public.seller_categories
    where user_id = v_uid and category_id = p_category_id
  ) then
    raise exception 'Bu alanda hizmet veriyorsunuz. Kendi hizmetinizde talep açamazsınız.';
  end if;
  if p_show_phone and (p_phone is null or length(trim(p_phone)) < 10) then
    select phone into p_phone from public.profiles where id = v_uid;
    if p_phone is null or length(trim(p_phone)) < 10 then
      raise exception 'Telefonun görünsün derseniz geçerli bir numara girin';
    end if;
  end if;
  if p_phone is not null and length(trim(p_phone)) >= 10 then
    update public.profiles set phone = trim(p_phone) where id = v_uid;
  end if;
  v_slug := public.unique_listing_slug(p_title);
  insert into public.listings (
    user_id, category_id, kind, title, slug, description,
    city_id, district_id, budget_min, budget_max, image_urls, status, published_at, show_phone
  ) values (
    v_uid, p_category_id, v_kind, p_title, v_slug, p_description,
    p_city_id, p_district_id, p_budget_min, p_budget_max, coalesce(p_image_urls, '{}'), 'open', now(), coalesce(p_show_phone, false)
  ) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.set_seller_categories(p_category_ids uuid[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_id uuid;
  v_name text;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = v_uid and role in ('seller', 'admin')
  ) then
    raise exception 'Yalnızca satıcılar hizmet alanı seçer';
  end if;

  foreach v_id in array coalesce(p_category_ids, '{}') loop
    if not exists (select 1 from public.categories where id = v_id and kind = 'service') then
      raise exception 'Yalnızca hizmet kategorisi seçilebilir';
    end if;
    if exists (
      select 1 from public.listings
      where user_id = v_uid and category_id = v_id and kind = 'service' and status = 'open'
    ) then
      select name into v_name from public.categories where id = v_id;
      raise exception 'Açık % talebiniz var. Bu alanı hizmetlerime ekleyemezsiniz.', coalesce(v_name, 'bu kategoride');
    end if;
  end loop;

  delete from public.seller_categories where user_id = v_uid;
  insert into public.seller_categories (user_id, category_id)
  select v_uid, unnest(coalesce(p_category_ids, '{}'))
  on conflict do nothing;
end;
$$;

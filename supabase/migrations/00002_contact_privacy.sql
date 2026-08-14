-- İletişim gizliliği, teklif sonrası numara, yorum zamanı, sahte yorum silme
alter table public.listings
  add column if not exists show_phone boolean not null default false;

create or replace function public.mask_person_name(p_name text)
returns text
language plpgsql
immutable
as $$
declare
  v_clean text;
  v_parts text[];
  v_first text;
  v_last text;
begin
  v_clean := trim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  if v_clean = '' then
    return 'Kullanıcı';
  end if;
  v_parts := regexp_split_to_array(v_clean, ' ');
  v_first := v_parts[1];
  if array_length(v_parts, 1) = 1 then
    return v_first;
  end if;
  v_last := left(v_parts[array_length(v_parts, 1)], 1);
  return v_first || ' ' || upper(v_last) || '.';
end;
$$;

create or replace function public.reveal_listing_phone(p_listing_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_listing public.listings%rowtype;
  v_phone text;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;

  select * into v_listing from public.listings where id = p_listing_id;
  if not found then
    raise exception 'İlan bulunamadı';
  end if;

  if v_listing.user_id = v_uid or public.is_admin() then
    select phone into v_phone from public.profiles where id = v_listing.user_id;
    return v_phone;
  end if;

  if not exists (
    select 1 from public.offers
    where listing_id = p_listing_id
      and seller_id = v_uid
      and status in ('pending', 'accepted')
  ) then
    raise exception 'Numara yalnızca teklif ücreti ödendikten sonra açılır';
  end if;

  if v_listing.show_phone is not true then
    raise exception 'İlan sahibi telefon paylaşımını kapalı tuttu';
  end if;

  select phone into v_phone from public.profiles where id = v_listing.user_id;
  if v_phone is null or length(trim(v_phone)) < 10 then
    raise exception 'İlan sahibinin kayıtlı telefonu yok';
  end if;

  return trim(v_phone);
end;
$$;

create or replace function public.buyer_display_name(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select public.mask_person_name(coalesce(full_name, display_name, 'Alıcı'))
  from public.profiles
  where id = p_user_id;
$$;

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

create or replace function public.submit_review(
  p_listing_id uuid,
  p_rating int,
  p_comment text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_listing public.listings%rowtype;
  v_seller uuid;
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;
  if p_rating < 1 or p_rating > 5 then
    raise exception 'Puan 1-5 arasında olmalı';
  end if;

  select * into v_listing from public.listings where id = p_listing_id;
  if v_listing.user_id <> v_uid then
    raise exception 'Yalnızca ilan sahibi puan verebilir';
  end if;
  if v_listing.status not in ('awarded', 'completed') then
    raise exception 'Yorum, teklif seçildikten sonra yapılabilir';
  end if;

  select seller_id into v_seller from public.offers where id = v_listing.awarded_offer_id;
  if v_seller is null then
    raise exception 'Kazanmış teklif yok';
  end if;
  if exists (select 1 from public.reviews where listing_id = p_listing_id) then
    raise exception 'Bu iş için zaten yorum yaptınız';
  end if;

  insert into public.reviews (listing_id, reviewer_id, seller_id, rating, comment)
  values (p_listing_id, v_uid, v_seller, p_rating, p_comment)
  returning id into v_id;

  if v_listing.status = 'awarded' then
    update public.listings set status = 'completed', completed_at = coalesce(completed_at, now())
    where id = p_listing_id;
    perform public.refresh_seller_stats(v_seller);
  end if;

  perform public.notify_user(v_seller, 'review', 'Yeni değerlendirme',
    p_rating::text || ' yıldız aldınız.',
    '/usta/' || (select slug from public.profiles where id = v_seller),
    jsonb_build_object('listing_id', p_listing_id));

  return v_id;
end;
$$;

create or replace function public.delete_review(p_review_id uuid, p_reason text default 'Sahte veya yanıltıcı yorum')
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_seller uuid;
begin
  if not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;
  select seller_id into v_seller from public.reviews where id = p_review_id;
  delete from public.reviews where id = p_review_id;
  if v_seller is not null then
    perform public.refresh_seller_stats(v_seller);
  end if;
end;
$$;

-- Teklif ücreti iade edilmez: iptalde bakiye iadesi yok (mevcut davranış korunur).

grant execute on function public.reveal_listing_phone to authenticated;
grant execute on function public.buyer_display_name to authenticated;
grant execute on function public.mask_person_name to authenticated, anon;
grant execute on function public.delete_review to authenticated;

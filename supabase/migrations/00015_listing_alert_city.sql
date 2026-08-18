-- Hizmet ilanı e-posta ve bildirimleri: satıcının kayıtlı şehri + hizmet kategorisi eşleşmeli.

create or replace function public.trg_listing_match_notify()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cat text;
  v_cat_slug text;
  v_city text;
  v_district text;
  v_loc text;
  v_link text;
  v_body text;
  rec record;
begin
  if new.status is distinct from 'open' then
    return new;
  end if;

  select name, slug into v_cat, v_cat_slug from public.categories where id = new.category_id;
  select name into v_city from public.locations where id = new.city_id;
  if new.district_id is not null then
    select name into v_district from public.locations where id = new.district_id;
  end if;

  v_loc := coalesce(v_city, 'Türkiye');
  if v_district is not null then
    v_loc := v_loc || ' / ' || v_district;
  end if;
  v_link := '/ilan/' || coalesce(v_cat_slug, 'ilan') || '/' || new.slug;
  v_body := v_loc || E'\n\n' || left(new.description, 600);

  if new.kind = 'service' then
    for rec in
      select p.id
      from public.profiles p
      join public.seller_categories sc
        on sc.user_id = p.id and sc.category_id = new.category_id
      where p.role in ('seller', 'admin')
        and p.seller_status = 'approved'
        and p.id <> new.user_id
        and p.city_id is not null
        and p.city_id = new.city_id
    loop
      perform public.notify_user(
        rec.id,
        'system',
        'Yeni talep: ' || new.title,
        v_body,
        v_link,
        jsonb_build_object('listing_id', new.id, 'kind', new.kind)
      );
    end loop;
  else
    for rec in
      select p.id
      from public.profiles p
      where p.role in ('seller', 'admin')
        and p.seller_status = 'approved'
        and p.seller_type in ('product', 'both')
        and p.id <> new.user_id
    loop
      perform public.notify_user(
        rec.id,
        'system',
        'Yeni ürün talebi: ' || new.title,
        v_body,
        v_link,
        jsonb_build_object('listing_id', new.id, 'kind', new.kind)
      );
    end loop;
  end if;

  return new;
end;
$$;

create or replace function public.listing_match_recipients(p_listing_id uuid)
returns table(user_id uuid, email text, display_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_listing public.listings%rowtype;
begin
  select * into v_listing from public.listings where id = p_listing_id;
  if not found then
    return;
  end if;

  return query
  select p.id, u.email::text, p.display_name
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id <> v_listing.user_id
    and p.role in ('seller', 'admin')
    and p.seller_status = 'approved'
    and u.email is not null
    and (
      (
        v_listing.kind = 'service'
        and p.city_id is not null
        and p.city_id = v_listing.city_id
        and exists (
          select 1 from public.seller_categories sc
          where sc.user_id = p.id and sc.category_id = v_listing.category_id
        )
      )
      or (
        v_listing.kind = 'product'
        and p.seller_type in ('product', 'both')
      )
    );
end;
$$;

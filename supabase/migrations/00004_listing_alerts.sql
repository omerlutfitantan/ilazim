-- Satıcının ilanı gizlemesi + eşleşen ilan bildirimi
create table if not exists public.seller_hidden_listings (
  seller_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (seller_id, listing_id)
);

create index if not exists seller_hidden_listings_listing_idx
  on public.seller_hidden_listings(listing_id);

alter table public.seller_hidden_listings enable row level security;

drop policy if exists seller_hidden_read_own on public.seller_hidden_listings;
create policy seller_hidden_read_own on public.seller_hidden_listings
  for select using (seller_id = auth.uid() or public.is_admin());

create or replace function public.hide_listing_for_seller(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_listing public.listings%rowtype;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;
  select * into v_listing from public.listings where id = p_listing_id;
  if not found then
    raise exception 'İlan bulunamadı';
  end if;
  if v_listing.user_id = v_uid then
    raise exception 'Kendi ilanınızı gizleyemezsiniz';
  end if;
  if not exists (
    select 1 from public.profiles
    where id = v_uid and role in ('seller', 'admin')
  ) then
    raise exception 'Yalnızca satıcılar ilan gizleyebilir';
  end if;
  insert into public.seller_hidden_listings (seller_id, listing_id)
  values (v_uid, p_listing_id)
  on conflict do nothing;
end;
$$;

grant execute on function public.hide_listing_for_seller to authenticated;

create or replace function public.trg_offer_category_access()
returns trigger
language plpgsql
as $$
declare
  v_listing public.listings%rowtype;
begin
  select * into v_listing from public.listings where id = new.listing_id;
  if exists (
    select 1 from public.seller_hidden_listings
    where seller_id = new.seller_id and listing_id = new.listing_id
  ) then
    raise exception 'Bu ilanı listenizden sildiniz. Bir daha teklif veremezsiniz.';
  end if;
  if v_listing.kind = 'service' then
    if not exists (
      select 1 from public.seller_categories
      where user_id = new.seller_id and category_id = v_listing.category_id
    ) then
      if not exists (
        select 1 from public.profiles where id = new.seller_id and role = 'admin'
      ) then
        raise exception 'Bu hizmet alanı profilinizde yok. Profilinizden hizmet ekleyin.';
      end if;
    end if;
  end if;
  return new;
end;
$$;

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

drop trigger if exists listings_match_notify on public.listings;
create trigger listings_match_notify
  after insert on public.listings
  for each row execute function public.trg_listing_match_notify();

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

revoke all on function public.listing_match_recipients(uuid) from public, anon, authenticated;
grant execute on function public.listing_match_recipients(uuid) to service_role;

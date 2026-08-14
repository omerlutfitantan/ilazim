-- Satıcı hizmet alanları + konum koordinatları (km filtresi)
alter table public.locations
  add column if not exists lat double precision,
  add column if not exists lng double precision;

create table if not exists public.seller_categories (
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, category_id)
);

create index if not exists seller_categories_cat_idx on public.seller_categories(category_id);

alter table public.seller_categories enable row level security;
drop policy if exists seller_categories_read on public.seller_categories;
create policy seller_categories_read on public.seller_categories for select using (true);

create or replace function public.geo_distance_km(
  lat1 double precision,
  lng1 double precision,
  lat2 double precision,
  lng2 double precision
) returns double precision
language sql
immutable
as $$
  select case
    when lat1 is null or lng1 is null or lat2 is null or lng2 is null then null
    else 6371 * 2 * asin(sqrt(
      power(sin(radians(lat2 - lat1) / 2), 2) +
      cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lng2 - lng1) / 2), 2)
    ))
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
  end loop;

  delete from public.seller_categories where user_id = v_uid;
  insert into public.seller_categories (user_id, category_id)
  select v_uid, unnest(coalesce(p_category_ids, '{}'))
  on conflict do nothing;
end;
$$;

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
    role = case when role = 'admin' then role else 'seller' end,
    seller_type = p_seller_type,
    seller_headline = p_headline,
    bio = p_bio,
    city_id = p_city_id,
    district_id = p_district_id,
    phone = coalesce(p_phone, phone),
    seller_status = case
      when role = 'admin' then 'approved'
      when seller_status = 'approved' then 'approved'
      else 'pending'
    end,
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

create or replace function public.trg_offer_category_access()
returns trigger
language plpgsql
as $$
declare
  v_listing public.listings%rowtype;
begin
  select * into v_listing from public.listings where id = new.listing_id;
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

drop trigger if exists offers_category_access on public.offers;
create trigger offers_category_access
  before insert on public.offers
  for each row execute function public.trg_offer_category_access();

grant execute on function public.set_seller_categories to authenticated;
grant execute on function public.geo_distance_km to authenticated, anon;

-- İl koordinatları
update public.locations set lat = 37.0000, lng = 35.3213 where slug = 'adana' and type = 'city';
update public.locations set lat = 37.7648, lng = 38.2786 where slug = 'adiyaman' and type = 'city';
update public.locations set lat = 38.7507, lng = 30.5567 where slug = 'afyonkarahisar' and type = 'city';
update public.locations set lat = 39.7191, lng = 43.0503 where slug = 'agri' and type = 'city';
update public.locations set lat = 40.6499, lng = 35.8353 where slug = 'amasya' and type = 'city';
update public.locations set lat = 39.9334, lng = 32.8597 where slug = 'ankara' and type = 'city';
update public.locations set lat = 36.8969, lng = 30.7133 where slug = 'antalya' and type = 'city';
update public.locations set lat = 41.1828, lng = 41.8183 where slug = 'artvin' and type = 'city';
update public.locations set lat = 37.8560, lng = 27.8416 where slug = 'aydin' and type = 'city';
update public.locations set lat = 39.6484, lng = 27.8826 where slug = 'balikesir' and type = 'city';
update public.locations set lat = 40.1506, lng = 29.9831 where slug = 'bilecik' and type = 'city';
update public.locations set lat = 38.8847, lng = 40.4966 where slug = 'bingol' and type = 'city';
update public.locations set lat = 38.4004, lng = 42.1095 where slug = 'bitlis' and type = 'city';
update public.locations set lat = 40.7392, lng = 31.6089 where slug = 'bolu' and type = 'city';
update public.locations set lat = 37.7203, lng = 30.2908 where slug = 'burdur' and type = 'city';
update public.locations set lat = 40.1885, lng = 29.0610 where slug = 'bursa' and type = 'city';
update public.locations set lat = 40.1553, lng = 26.4142 where slug = 'canakkale' and type = 'city';
update public.locations set lat = 40.6013, lng = 33.6134 where slug = 'cankiri' and type = 'city';
update public.locations set lat = 40.5506, lng = 34.9556 where slug = 'corum' and type = 'city';
update public.locations set lat = 37.7765, lng = 29.0864 where slug = 'denizli' and type = 'city';
update public.locations set lat = 37.9144, lng = 40.2306 where slug = 'diyarbakir' and type = 'city';
update public.locations set lat = 41.6771, lng = 26.5557 where slug = 'edirne' and type = 'city';
update public.locations set lat = 38.6810, lng = 39.2264 where slug = 'elazig' and type = 'city';
update public.locations set lat = 39.7500, lng = 39.5000 where slug = 'erzincan' and type = 'city';
update public.locations set lat = 39.9055, lng = 41.2658 where slug = 'erzurum' and type = 'city';
update public.locations set lat = 39.7767, lng = 30.5206 where slug = 'eskisehir' and type = 'city';
update public.locations set lat = 37.0662, lng = 37.3833 where slug = 'gaziantep' and type = 'city';
update public.locations set lat = 40.9128, lng = 38.3895 where slug = 'giresun' and type = 'city';
update public.locations set lat = 40.4608, lng = 39.4800 where slug = 'gumushane' and type = 'city';
update public.locations set lat = 37.5744, lng = 43.7408 where slug = 'hakkari' and type = 'city';
update public.locations set lat = 36.2023, lng = 36.1613 where slug = 'hatay' and type = 'city';
update public.locations set lat = 37.7648, lng = 30.5566 where slug = 'isparta' and type = 'city';
update public.locations set lat = 36.8121, lng = 34.6415 where slug = 'mersin' and type = 'city';
update public.locations set lat = 41.0082, lng = 28.9784 where slug = 'istanbul' and type = 'city';
update public.locations set lat = 38.4237, lng = 27.1428 where slug = 'izmir' and type = 'city';
update public.locations set lat = 40.6013, lng = 43.0975 where slug = 'kars' and type = 'city';
update public.locations set lat = 41.3887, lng = 33.7827 where slug = 'kastamonu' and type = 'city';
update public.locations set lat = 38.7312, lng = 35.4787 where slug = 'kayseri' and type = 'city';
update public.locations set lat = 41.7355, lng = 27.2250 where slug = 'kirklareli' and type = 'city';
update public.locations set lat = 39.1458, lng = 34.1606 where slug = 'kirsehir' and type = 'city';
update public.locations set lat = 40.7654, lng = 29.9408 where slug = 'kocaeli' and type = 'city';
update public.locations set lat = 37.8746, lng = 32.4932 where slug = 'konya' and type = 'city';
update public.locations set lat = 39.4192, lng = 29.9857 where slug = 'kutahya' and type = 'city';
update public.locations set lat = 38.3552, lng = 38.3095 where slug = 'malatya' and type = 'city';
update public.locations set lat = 38.6140, lng = 27.4296 where slug = 'manisa' and type = 'city';
update public.locations set lat = 37.5858, lng = 36.9371 where slug = 'kahramanmaras' and type = 'city';
update public.locations set lat = 37.3129, lng = 40.7340 where slug = 'mardin' and type = 'city';
update public.locations set lat = 37.2153, lng = 28.3636 where slug = 'mugla' and type = 'city';
update public.locations set lat = 38.7432, lng = 41.5065 where slug = 'mus' and type = 'city';
update public.locations set lat = 38.6244, lng = 34.7239 where slug = 'nevsehir' and type = 'city';
update public.locations set lat = 37.9667, lng = 34.6793 where slug = 'nigde' and type = 'city';
update public.locations set lat = 40.9839, lng = 37.8764 where slug = 'ordu' and type = 'city';
update public.locations set lat = 41.0201, lng = 40.5234 where slug = 'rize' and type = 'city';
update public.locations set lat = 40.7569, lng = 30.3781 where slug = 'sakarya' and type = 'city';
update public.locations set lat = 41.2867, lng = 36.3300 where slug = 'samsun' and type = 'city';
update public.locations set lat = 37.9333, lng = 41.9500 where slug = 'siirt' and type = 'city';
update public.locations set lat = 42.0231, lng = 35.1531 where slug = 'sinop' and type = 'city';
update public.locations set lat = 39.7477, lng = 37.0179 where slug = 'sivas' and type = 'city';
update public.locations set lat = 40.9833, lng = 27.5167 where slug = 'tekirdag' and type = 'city';
update public.locations set lat = 40.3167, lng = 36.5500 where slug = 'tokat' and type = 'city';
update public.locations set lat = 41.0015, lng = 39.7178 where slug = 'trabzon' and type = 'city';
update public.locations set lat = 39.1079, lng = 39.5401 where slug = 'tunceli' and type = 'city';
update public.locations set lat = 37.1591, lng = 38.7969 where slug = 'sanliurfa' and type = 'city';
update public.locations set lat = 38.6823, lng = 29.4082 where slug = 'usak' and type = 'city';
update public.locations set lat = 38.4891, lng = 43.4089 where slug = 'van' and type = 'city';
update public.locations set lat = 39.8181, lng = 34.8147 where slug = 'yozgat' and type = 'city';
update public.locations set lat = 41.4564, lng = 31.7987 where slug = 'zonguldak' and type = 'city';
update public.locations set lat = 38.3687, lng = 34.0370 where slug = 'aksaray' and type = 'city';
update public.locations set lat = 40.2552, lng = 40.2249 where slug = 'bayburt' and type = 'city';
update public.locations set lat = 37.1759, lng = 33.2287 where slug = 'karaman' and type = 'city';
update public.locations set lat = 39.8468, lng = 33.5153 where slug = 'kirikkale' and type = 'city';
update public.locations set lat = 37.8812, lng = 41.1351 where slug = 'batman' and type = 'city';
update public.locations set lat = 37.5164, lng = 42.4611 where slug = 'sirnak' and type = 'city';
update public.locations set lat = 41.6344, lng = 32.3375 where slug = 'bartin' and type = 'city';
update public.locations set lat = 41.1105, lng = 42.7022 where slug = 'ardahan' and type = 'city';
update public.locations set lat = 39.9167, lng = 44.0333 where slug = 'igdir' and type = 'city';
update public.locations set lat = 40.6500, lng = 29.2667 where slug = 'yalova' and type = 'city';
update public.locations set lat = 41.2044, lng = 32.6277 where slug = 'karabuk' and type = 'city';
update public.locations set lat = 36.7184, lng = 37.1212 where slug = 'kilis' and type = 'city';
update public.locations set lat = 37.0742, lng = 36.2464 where slug = 'osmaniye' and type = 'city';
update public.locations set lat = 40.8438, lng = 31.1565 where slug = 'duzce' and type = 'city';

update public.locations set lat = 40.9819, lng = 29.0576 where slug = 'kadikoy' and type = 'district';
update public.locations set lat = 41.0422, lng = 29.0067 where slug = 'besiktas' and type = 'district';
update public.locations set lat = 41.0602, lng = 28.9877 where slug = 'sisli' and type = 'district';
update public.locations set lat = 41.0235, lng = 29.0157 where slug = 'uskudar' and type = 'district';
update public.locations set lat = 40.9819, lng = 28.8772 where slug = 'bakirkoy' and type = 'district';
update public.locations set lat = 41.0165, lng = 29.1244 where slug = 'umraniye' and type = 'district';
update public.locations set lat = 39.9179, lng = 32.8626 where slug = 'cankaya' and type = 'district';
update public.locations set lat = 39.9997, lng = 32.8631 where slug = 'kecioren' and type = 'district';
update public.locations set lat = 39.9719, lng = 32.7530 where slug = 'yenimahalle' and type = 'district';
update public.locations set lat = 38.4192, lng = 27.1287 where slug = 'konak' and type = 'district';
update public.locations set lat = 38.4622, lng = 27.2161 where slug = 'bornova' and type = 'district';
update public.locations set lat = 38.4558, lng = 27.1118 where slug = 'karsiyaka' and type = 'district';


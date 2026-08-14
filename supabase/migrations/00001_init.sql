-- iLazım core schema: enums, tables, triggers, RLS, RPCs, storage
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.user_role as enum ('buyer', 'seller', 'admin');
create type public.listing_kind as enum ('service', 'product');
create type public.listing_status as enum ('draft', 'open', 'awarded', 'completed', 'cancelled');
create type public.offer_status as enum ('pending', 'accepted', 'rejected', 'withdrawn');
create type public.seller_status as enum ('pending', 'approved', 'rejected', 'suspended');
create type public.seller_type as enum ('service', 'product', 'both');
create type public.wallet_tx_type as enum ('topup', 'bid_fee', 'credit_grant', 'credit_spend', 'refund', 'adjustment');
create type public.balance_kind as enum ('cash', 'credit');
create type public.payment_status as enum ('pending', 'completed', 'failed', 'cancelled');
create type public.notification_type as enum ('offer', 'offer_accepted', 'message', 'review', 'wallet', 'system');
create type public.location_type as enum ('city', 'district');
create type public.promo_apply_on as enum ('signup', 'seller_approval');

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.slugify(input text)
returns text
language sql
immutable
as $$
  select trim(both '-' from regexp_replace(
    lower(translate(coalesce(input, ''),
      'çğıöşüÇĞİIÖŞÜâêîôûÂÊÎÔÛ',
      'cgiostCGIiOSUaeiouAEIOU'
    )),
    '[^a-z0-9]+', '-', 'g'
  ));
$$;

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.locations(id) on delete cascade,
  name text not null,
  slug text not null,
  type public.location_type not null,
  unique (type, slug)
);

create index locations_parent_idx on public.locations(parent_id);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'buyer',
  full_name text,
  display_name text,
  slug text unique,
  phone text,
  avatar_url text,
  bio text,
  city_id uuid references public.locations(id),
  district_id uuid references public.locations(id),
  seller_status public.seller_status,
  seller_type public.seller_type,
  seller_headline text,
  is_first_member boolean not null default true,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index profiles_seller_status_idx on public.profiles(seller_status);
create index profiles_slug_idx on public.profiles(slug);

create table public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  cash_balance numeric(12,2) not null default 0 check (cash_balance >= 0),
  credit_balance numeric(12,2) not null default 0 check (credit_balance >= 0),
  updated_at timestamptz not null default now()
);

alter table public.wallets
  add column available_balance numeric(12,2)
  generated always as (cash_balance + credit_balance) stored;

create table public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.wallets(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.wallet_tx_type not null,
  amount numeric(12,2) not null check (amount > 0),
  balance_kind public.balance_kind not null,
  listing_id uuid,
  offer_id uuid,
  note text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index wallet_tx_user_idx on public.wallet_transactions(user_id, created_at desc);

create table public.platform_settings (
  id int primary key default 1 check (id = 1),
  bid_fee_amount numeric(12,2) not null default 29.90,
  new_seller_credit_amount numeric(12,2) not null default 100.00,
  new_seller_discount_percent numeric(5,2) not null default 50.00,
  new_seller_discounted_offer_count int not null default 5,
  currency text not null default 'TRY',
  site_name text not null default 'iLazım',
  updated_at timestamptz not null default now()
);

insert into public.platform_settings (id) values (1);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  kind public.listing_kind not null,
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  h1 text not null,
  meta_title text not null,
  meta_description text not null,
  content text not null default '',
  faq jsonb not null default '[]'::jsonb,
  icon text,
  image_url text,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (kind, slug)
);

create index categories_kind_featured_idx on public.categories(kind, is_featured, sort_order);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  category_id uuid not null references public.categories(id),
  kind public.listing_kind not null,
  title text not null,
  slug text not null unique,
  description text not null,
  city_id uuid not null references public.locations(id),
  district_id uuid references public.locations(id),
  budget_min numeric(12,2),
  budget_max numeric(12,2),
  image_urls text[] not null default '{}',
  status public.listing_status not null default 'open',
  awarded_offer_id uuid,
  offer_count int not null default 0,
  published_at timestamptz default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index listings_status_kind_idx on public.listings(status, kind, published_at desc);
create index listings_category_idx on public.listings(category_id);
create index listings_user_idx on public.listings(user_id);
create index listings_title_trgm on public.listings using gin (title gin_trgm_ops);

create table public.offers (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  message text not null,
  eta_text text,
  image_urls text[] not null default '{}',
  fee_charged numeric(12,2) not null default 0,
  status public.offer_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, seller_id)
);

create index offers_listing_idx on public.offers(listing_id, status);
create index offers_seller_idx on public.offers(seller_id, created_at desc);

alter table public.listings
  add constraint listings_awarded_offer_fk
  foreign key (awarded_offer_id) references public.offers(id) on delete set null;

alter table public.wallet_transactions
  add constraint wallet_tx_listing_fk
  foreign key (listing_id) references public.listings(id) on delete set null;

alter table public.wallet_transactions
  add constraint wallet_tx_offer_fk
  foreign key (offer_id) references public.offers(id) on delete set null;

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references public.listings(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  rating int not null check (rating between 1 and 5),
  comment text not null,
  created_at timestamptz not null default now()
);

create index reviews_seller_idx on public.reviews(seller_id, created_at desc);

create table public.seller_stats (
  seller_id uuid primary key references public.profiles(id) on delete cascade,
  review_count int not null default 0,
  rating_avg numeric(3,2) not null default 0,
  completed_jobs int not null default 0,
  offer_count int not null default 0,
  updated_at timestamptz not null default now()
);

create table public.promo_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  credit_amount numeric(12,2) not null default 0,
  bid_fee_discount_percent numeric(5,2) not null default 0,
  discounted_offer_count int not null default 0,
  max_redemptions int,
  redeemed_count int not null default 0,
  apply_on public.promo_apply_on not null default 'seller_approval',
  is_active boolean not null default true,
  starts_at timestamptz default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.seller_promos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  campaign_id uuid references public.promo_campaigns(id) on delete set null,
  remaining_discounted_offers int not null default 0,
  discount_percent numeric(5,2) not null default 0,
  granted_credit numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create index seller_promos_user_idx on public.seller_promos(user_id);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  provider text not null default 'iyzico',
  provider_ref text,
  status public.payment_status not null default 'pending',
  checkout_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (listing_id, seller_id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_conv_idx on public.messages(conversation_id, created_at);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  link text,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications(user_id, created_at desc);

create trigger profiles_updated before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger listings_updated before update on public.listings
  for each row execute function public.set_updated_at();
create trigger offers_updated before update on public.offers
  for each row execute function public.set_updated_at();
create trigger categories_updated before update on public.categories
  for each row execute function public.set_updated_at();
create trigger wallets_updated before update on public.wallets
  for each row execute function public.set_updated_at();
create trigger payments_updated before update on public.payments
  for each row execute function public.set_updated_at();
create trigger conversations_updated before update on public.conversations
  for each row execute function public.set_updated_at();

create or replace function public.unique_slug(base text)
returns text
language plpgsql
as $$
declare
  s text := public.slugify(base);
  n int := 1;
begin
  if s is null or s = '' then
    s := 'kullanici';
  end if;
  while exists (select 1 from public.profiles where slug = s) loop
    n := n + 1;
    s := public.slugify(base) || '-' || n::text;
  end loop;
  return s;
end;
$$;

create or replace function public.unique_listing_slug(base text)
returns text
language plpgsql
as $$
declare
  s text := public.slugify(base);
  n int := 1;
begin
  if s is null or s = '' then
    s := 'ilan';
  end if;
  while exists (select 1 from public.listings where slug = s) loop
    n := n + 1;
    s := public.slugify(base) || '-' || n::text;
  end loop;
  return s;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, display_name, slug, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    public.unique_slug(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))),
    'buyer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.refresh_seller_stats(p_seller uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.seller_stats (seller_id, review_count, rating_avg, completed_jobs, offer_count, updated_at)
  select
    p_seller,
    coalesce((select count(*) from public.reviews r where r.seller_id = p_seller), 0),
    coalesce((select round(avg(r.rating)::numeric, 2) from public.reviews r where r.seller_id = p_seller), 0),
    coalesce((
      select count(*) from public.listings l
      join public.offers o on o.id = l.awarded_offer_id
      where o.seller_id = p_seller and l.status = 'completed'
    ), 0),
    coalesce((select count(*) from public.offers o where o.seller_id = p_seller), 0),
    now()
  on conflict (seller_id) do update set
    review_count = excluded.review_count,
    rating_avg = excluded.rating_avg,
    completed_jobs = excluded.completed_jobs,
    offer_count = excluded.offer_count,
    updated_at = now();
end;
$$;

create or replace function public.trg_offer_count()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    update public.listings set offer_count = offer_count + 1 where id = new.listing_id;
    perform public.refresh_seller_stats(new.seller_id);
    return new;
  elsif tg_op = 'DELETE' then
    update public.listings set offer_count = greatest(offer_count - 1, 0) where id = old.listing_id;
    return old;
  end if;
  return coalesce(new, old);
end;
$$;

create trigger offers_count after insert or delete on public.offers
  for each row execute function public.trg_offer_count();

create or replace function public.trg_review_stats()
returns trigger
language plpgsql
as $$
begin
  perform public.refresh_seller_stats(new.seller_id);
  return new;
end;
$$;

create trigger reviews_stats after insert on public.reviews
  for each row execute function public.trg_review_stats();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.ensure_wallet(p_user uuid)
returns public.wallets
language plpgsql
security definer
set search_path = public
as $$
declare
  w public.wallets;
begin
  insert into public.wallets (user_id) values (p_user)
  on conflict (user_id) do nothing;
  select * into w from public.wallets where user_id = p_user;
  return w;
end;
$$;

create or replace function public.notify_user(
  p_user uuid,
  p_type public.notification_type,
  p_title text,
  p_body text,
  p_link text,
  p_meta jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, body, link, metadata)
  values (p_user, p_type, p_title, p_body, p_link, p_meta);
end;
$$;

create or replace function public.request_seller_role(
  p_seller_type public.seller_type,
  p_headline text,
  p_bio text,
  p_city_id uuid,
  p_district_id uuid default null,
  p_phone text default null
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
end;
$$;

create or replace function public.apply_seller_benefits(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.platform_settings%rowtype;
  v_wallet public.wallets;
  v_campaign public.promo_campaigns%rowtype;
  v_credit numeric(12,2);
  v_discount numeric(5,2);
  v_offers int;
begin
  select * into v_settings from public.platform_settings where id = 1;
  v_wallet := public.ensure_wallet(p_user);

  v_credit := v_settings.new_seller_credit_amount;
  v_discount := v_settings.new_seller_discount_percent;
  v_offers := v_settings.new_seller_discounted_offer_count;

  select * into v_campaign
  from public.promo_campaigns
  where is_active = true
    and apply_on = 'seller_approval'
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at >= now())
    and (max_redemptions is null or redeemed_count < max_redemptions)
  order by created_at asc
  limit 1;

  if found then
    v_credit := v_credit + v_campaign.credit_amount;
    if v_campaign.bid_fee_discount_percent > v_discount then
      v_discount := v_campaign.bid_fee_discount_percent;
    end if;
    if v_campaign.discounted_offer_count > v_offers then
      v_offers := v_campaign.discounted_offer_count;
    end if;
    update public.promo_campaigns
      set redeemed_count = redeemed_count + 1
      where id = v_campaign.id;
  end if;

  if v_credit > 0 then
    update public.wallets
      set credit_balance = credit_balance + v_credit
      where user_id = p_user;
    insert into public.wallet_transactions (wallet_id, user_id, type, amount, balance_kind, note)
    values (v_wallet.id, p_user, 'credit_grant', v_credit, 'credit', 'İlk üye / onay kredisi');
    perform public.notify_user(p_user, 'wallet', 'Krediniz tanımlandı',
      v_credit::text || ' TL teklif kredisi hesabınıza eklendi.', '/satici/cuzdan', '{}'::jsonb);
  end if;

  if v_offers > 0 and v_discount > 0 then
    insert into public.seller_promos (user_id, campaign_id, remaining_discounted_offers, discount_percent, granted_credit)
    values (p_user, v_campaign.id, v_offers, v_discount, v_credit);
  end if;
end;
$$;

create or replace function public.review_seller(p_user_id uuid, p_approve boolean)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prev public.seller_status;
begin
  if not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;

  select seller_status into v_prev from public.profiles where id = p_user_id;
  if p_approve then
    update public.profiles
      set seller_status = 'approved', role = 'seller'
      where id = p_user_id;
    if v_prev is distinct from 'approved' then
      perform public.apply_seller_benefits(p_user_id);
    end if;
    perform public.notify_user(p_user_id, 'system', 'Satıcı hesabınız onaylandı',
      'Artık ilanlara teklif verebilirsiniz.', '/satici', '{}'::jsonb);
  else
    update public.profiles set seller_status = 'rejected' where id = p_user_id;
    perform public.notify_user(p_user_id, 'system', 'Satıcı başvurunuz reddedildi',
      'Profilinizi güncelleyip tekrar başvurabilirsiniz.', '/satici/onboarding', '{}'::jsonb);
  end if;
end;
$$;

create or replace function public.place_offer(
  p_listing_id uuid,
  p_amount numeric,
  p_message text,
  p_eta_text text default null,
  p_image_urls text[] default '{}'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile public.profiles%rowtype;
  v_listing public.listings%rowtype;
  v_wallet public.wallets%rowtype;
  v_fee numeric(12,2);
  v_base_fee numeric(12,2);
  v_promo public.seller_promos%rowtype;
  v_has_promo boolean := false;
  v_from_credit numeric(12,2);
  v_from_cash numeric(12,2);
  v_offer_id uuid;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;

  select * into v_profile from public.profiles where id = v_uid;
  if v_profile.role = 'admin' then
    null;
  elsif v_profile.role <> 'seller' or v_profile.seller_status is distinct from 'approved' then
    raise exception 'Yalnızca onaylı satıcılar teklif verebilir';
  end if;

  select * into v_listing from public.listings where id = p_listing_id for share;
  if not found then
    raise exception 'İlan bulunamadı';
  end if;
  if v_listing.status <> 'open' then
    raise exception 'Bu ilan teklife kapalı';
  end if;
  if v_listing.user_id = v_uid then
    raise exception 'Kendi ilanınıza teklif veremezsiniz';
  end if;
  if exists (
    select 1 from public.offers
    where listing_id = p_listing_id and seller_id = v_uid and status in ('pending', 'accepted')
  ) then
    raise exception 'Bu ilana zaten bir teklifiniz var';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Geçerli bir teklif tutarı girin';
  end if;

  select bid_fee_amount into v_base_fee from public.platform_settings where id = 1;
  v_fee := v_base_fee;

  select * into v_promo
  from public.seller_promos
  where user_id = v_uid and remaining_discounted_offers > 0
  order by created_at asc
  limit 1
  for update;

  if found then
    v_has_promo := true;
    if v_promo.discount_percent > 0 then
      v_fee := round(v_base_fee * (1 - v_promo.discount_percent / 100.0), 2);
    end if;
  end if;

  v_wallet := public.ensure_wallet(v_uid);
  select * into v_wallet from public.wallets where user_id = v_uid for update;

  if (v_wallet.credit_balance + v_wallet.cash_balance) < v_fee then
    raise exception 'Yetersiz bakiye. Teklif ücreti: % TL', v_fee;
  end if;

  v_from_credit := least(v_wallet.credit_balance, v_fee);
  v_from_cash := v_fee - v_from_credit;

  update public.wallets
    set credit_balance = credit_balance - v_from_credit,
        cash_balance = cash_balance - v_from_cash
    where user_id = v_uid;

  if v_from_credit > 0 then
    insert into public.wallet_transactions (wallet_id, user_id, type, amount, balance_kind, listing_id, meta)
    values (v_wallet.id, v_uid, 'credit_spend', v_from_credit, 'credit', p_listing_id,
      jsonb_build_object('fee_total', v_fee, 'base_fee', v_base_fee));
  end if;
  if v_from_cash > 0 then
    insert into public.wallet_transactions (wallet_id, user_id, type, amount, balance_kind, listing_id, meta)
    values (v_wallet.id, v_uid, 'bid_fee', v_from_cash, 'cash', p_listing_id,
      jsonb_build_object('fee_total', v_fee, 'base_fee', v_base_fee));
  end if;

  if v_has_promo then
    update public.seller_promos
      set remaining_discounted_offers = remaining_discounted_offers - 1
      where id = v_promo.id;
  end if;

  insert into public.offers (listing_id, seller_id, amount, message, eta_text, image_urls, fee_charged)
  values (p_listing_id, v_uid, p_amount, p_message, p_eta_text, coalesce(p_image_urls, '{}'), v_fee)
  returning id into v_offer_id;

  insert into public.conversations (listing_id, buyer_id, seller_id)
  values (p_listing_id, v_listing.user_id, v_uid)
  on conflict (listing_id, seller_id) do update set updated_at = now();

  perform public.notify_user(
    v_listing.user_id,
    'offer',
    'Yeni teklif',
    coalesce(v_profile.display_name, 'Bir satıcı') || ' ilanınıza teklif verdi.',
    '/hesabim/ilanlarim/' || v_listing.id::text,
    jsonb_build_object('offer_id', v_offer_id, 'listing_id', p_listing_id)
  );

  return v_offer_id;
end;
$$;

create or replace function public.accept_offer(p_offer_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_offer public.offers%rowtype;
  v_listing public.listings%rowtype;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;

  select * into v_offer from public.offers where id = p_offer_id for update;
  if not found then
    raise exception 'Teklif bulunamadı';
  end if;

  select * into v_listing from public.listings where id = v_offer.listing_id for update;
  if v_listing.user_id <> v_uid and not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;
  if v_listing.status <> 'open' then
    raise exception 'İlan teklif kabulüne kapalı';
  end if;
  if v_offer.status <> 'pending' then
    raise exception 'Bu teklif kabul edilemez';
  end if;

  update public.listings
    set status = 'awarded', awarded_offer_id = v_offer.id
    where id = v_listing.id;

  update public.offers set status = 'accepted' where id = v_offer.id;
  update public.offers
    set status = 'rejected'
    where listing_id = v_listing.id and id <> v_offer.id and status = 'pending';

  perform public.notify_user(
    v_offer.seller_id,
    'offer_accepted',
    'Teklifiniz kabul edildi',
    v_listing.title || ' ilanında teklifiniz seçildi.',
    '/satici/tekliflerim',
    jsonb_build_object('offer_id', v_offer.id, 'listing_id', v_listing.id)
  );
end;
$$;

create or replace function public.complete_listing(p_listing_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_listing public.listings%rowtype;
  v_seller uuid;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;

  select * into v_listing from public.listings where id = p_listing_id for update;
  if v_listing.user_id <> v_uid and not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;
  if v_listing.status <> 'awarded' then
    raise exception 'Yalnızca kazananı seçilmiş ilanlar tamamlanabilir';
  end if;

  update public.listings
    set status = 'completed', completed_at = now()
    where id = p_listing_id;

  select seller_id into v_seller from public.offers where id = v_listing.awarded_offer_id;
  if v_seller is not null then
    perform public.refresh_seller_stats(v_seller);
    perform public.notify_user(v_seller, 'system', 'İş tamamlandı',
      v_listing.title || ' tamamlandı olarak işaretlendi. Alıcı sizi puanlayabilir.',
      '/usta/' || (select slug from public.profiles where id = v_seller),
      '{}'::jsonb);
  end if;
end;
$$;

create or replace function public.cancel_listing(p_listing_id uuid)
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
  select * into v_listing from public.listings where id = p_listing_id for update;
  if v_listing.user_id <> v_uid and not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;
  if v_listing.status not in ('open', 'draft') then
    raise exception 'Bu ilan iptal edilemez';
  end if;
  update public.listings set status = 'cancelled' where id = p_listing_id;
  update public.offers set status = 'rejected' where listing_id = p_listing_id and status = 'pending';
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
  if v_listing.status <> 'completed' then
    raise exception 'Puanlama iş tamamlandıktan sonra yapılır';
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

  perform public.notify_user(v_seller, 'review', 'Yeni değerlendirme',
    p_rating::text || ' yıldız aldınız.',
    '/usta/' || (select slug from public.profiles where id = v_seller),
    jsonb_build_object('listing_id', p_listing_id));

  return v_id;
end;
$$;

create or replace function public.grant_balance(
  p_user_id uuid,
  p_amount numeric,
  p_kind public.balance_kind,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.wallets;
  v_type public.wallet_tx_type;
begin
  if not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;
  if p_amount is null or p_amount <= 0 then
    raise exception 'Tutar pozitif olmalı';
  end if;

  v_wallet := public.ensure_wallet(p_user_id);
  if p_kind = 'credit' then
    update public.wallets set credit_balance = credit_balance + p_amount where user_id = p_user_id;
    v_type := 'credit_grant';
  else
    update public.wallets set cash_balance = cash_balance + p_amount where user_id = p_user_id;
    v_type := 'topup';
  end if;

  insert into public.wallet_transactions (wallet_id, user_id, type, amount, balance_kind, note)
  values (v_wallet.id, p_user_id, v_type, p_amount, p_kind, coalesce(p_note, 'Admin yüklemesi'));

  perform public.notify_user(p_user_id, 'wallet', 'Bakiyeniz güncellendi',
    p_amount::text || ' TL hesabınıza eklendi.', '/satici/cuzdan', '{}'::jsonb);
end;
$$;

create or replace function public.apply_topup(p_payment_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pay public.payments%rowtype;
  v_wallet public.wallets;
begin
  select * into v_pay from public.payments where id = p_payment_id for update;
  if not found then
    raise exception 'Ödeme bulunamadı';
  end if;
  if v_pay.status = 'completed' then
    return;
  end if;
  if v_pay.status <> 'pending' then
    raise exception 'Ödeme uygulanamaz';
  end if;

  v_wallet := public.ensure_wallet(v_pay.user_id);
  update public.wallets set cash_balance = cash_balance + v_pay.amount where user_id = v_pay.user_id;
  update public.payments set status = 'completed' where id = p_payment_id;
  insert into public.wallet_transactions (wallet_id, user_id, type, amount, balance_kind, note, meta)
  values (v_wallet.id, v_pay.user_id, 'topup', v_pay.amount, 'cash', 'Cüzdan yükleme',
    jsonb_build_object('payment_id', p_payment_id));
  perform public.notify_user(v_pay.user_id, 'wallet', 'Bakiye yüklendi',
    v_pay.amount::text || ' TL cüzdanınıza eklendi.', '/satici/cuzdan', '{}'::jsonb);
end;
$$;

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
  values (v_uid, p_amount, 'iyzico', 'pending')
  returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.update_platform_settings(
  p_bid_fee numeric,
  p_new_credit numeric,
  p_discount numeric,
  p_offer_count int
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
  update public.platform_settings
  set bid_fee_amount = p_bid_fee,
      new_seller_credit_amount = p_new_credit,
      new_seller_discount_percent = p_discount,
      new_seller_discounted_offer_count = p_offer_count
  where id = 1;
end;
$$;

create or replace function public.publish_listing(
  p_category_id uuid,
  p_title text,
  p_description text,
  p_city_id uuid,
  p_district_id uuid default null,
  p_budget_min numeric default null,
  p_budget_max numeric default null,
  p_image_urls text[] default '{}'
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
  v_slug := public.unique_listing_slug(p_title);
  insert into public.listings (
    user_id, category_id, kind, title, slug, description,
    city_id, district_id, budget_min, budget_max, image_urls, status, published_at
  ) values (
    v_uid, p_category_id, v_kind, p_title, v_slug, p_description,
    p_city_id, p_district_id, p_budget_min, p_budget_max, coalesce(p_image_urls, '{}'), 'open', now()
  ) returning id into v_id;
  return v_id;
end;
$$;

create or replace function public.send_message(p_conversation_id uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_conv public.conversations%rowtype;
  v_id uuid;
  v_other uuid;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;
  if p_body is null or length(trim(p_body)) = 0 then
    raise exception 'Mesaj boş olamaz';
  end if;
  select * into v_conv from public.conversations where id = p_conversation_id;
  if not found then
    raise exception 'Sohbet bulunamadı';
  end if;
  if v_uid <> v_conv.buyer_id and v_uid <> v_conv.seller_id and not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;

  insert into public.messages (conversation_id, sender_id, body)
  values (p_conversation_id, v_uid, trim(p_body))
  returning id into v_id;

  update public.conversations set updated_at = now() where id = p_conversation_id;

  v_other := case when v_uid = v_conv.buyer_id then v_conv.seller_id else v_conv.buyer_id end;
  perform public.notify_user(v_other, 'message', 'Yeni mesaj', left(trim(p_body), 80),
    '/mesajlar/' || p_conversation_id::text,
    jsonb_build_object('conversation_id', p_conversation_id));

  return v_id;
end;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.wallet_transactions enable row level security;
alter table public.platform_settings enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.offers enable row level security;
alter table public.reviews enable row level security;
alter table public.seller_stats enable row level security;
alter table public.promo_campaigns enable row level security;
alter table public.seller_promos enable row level security;
alter table public.payments enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.locations enable row level security;

create policy locations_read on public.locations for select using (true);
create policy categories_read on public.categories for select using (true);
create policy categories_admin on public.categories for all using (public.is_admin()) with check (public.is_admin());
create policy settings_read on public.platform_settings for select using (true);
create policy settings_admin on public.platform_settings for update using (public.is_admin());

create policy profiles_read on public.profiles for select using (
  true
);
create policy profiles_update_own on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin on public.profiles for all using (public.is_admin()) with check (public.is_admin());

create policy listings_read on public.listings for select using (
  status in ('open', 'awarded', 'completed') or user_id = auth.uid() or public.is_admin()
);
create policy listings_insert_own on public.listings for insert with check (user_id = auth.uid());
create policy listings_update_own on public.listings for update using (user_id = auth.uid() or public.is_admin());

create policy offers_read on public.offers for select using (
  seller_id = auth.uid()
  or exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  or public.is_admin()
);
create policy reviews_read on public.reviews for select using (true);
create policy stats_read on public.seller_stats for select using (true);

create policy wallets_own on public.wallets for select using (user_id = auth.uid() or public.is_admin());
create policy wallet_tx_own on public.wallet_transactions for select using (user_id = auth.uid() or public.is_admin());
create policy payments_own on public.payments for select using (user_id = auth.uid() or public.is_admin());
create policy seller_promos_own on public.seller_promos for select using (user_id = auth.uid() or public.is_admin());
create policy campaigns_read on public.promo_campaigns for select using (is_active or public.is_admin());
create policy campaigns_admin on public.promo_campaigns for all using (public.is_admin()) with check (public.is_admin());

create policy conv_participants on public.conversations for select using (
  buyer_id = auth.uid() or seller_id = auth.uid() or public.is_admin()
);
create policy messages_participants on public.messages for select using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
      and (c.buyer_id = auth.uid() or c.seller_id = auth.uid() or public.is_admin())
  )
);
create policy notifications_own on public.notifications for select using (user_id = auth.uid() or public.is_admin());
create policy notifications_update_own on public.notifications for update using (user_id = auth.uid());

grant execute on function public.place_offer to authenticated;
grant execute on function public.accept_offer to authenticated;
grant execute on function public.complete_listing to authenticated;
grant execute on function public.cancel_listing to authenticated;
grant execute on function public.submit_review to authenticated;
grant execute on function public.request_seller_role to authenticated;
grant execute on function public.review_seller to authenticated;
grant execute on function public.grant_balance to authenticated;
grant execute on function public.apply_topup to authenticated, service_role;
grant execute on function public.create_topup_payment to authenticated;
grant execute on function public.update_platform_settings to authenticated;
grant execute on function public.publish_listing to authenticated;
grant execute on function public.send_message to authenticated;
grant execute on function public.is_admin to authenticated;

create or replace function public.protect_profile_fields()
returns trigger
language plpgsql
as $$
begin
  if public.is_admin() then
    return new;
  end if;
  if new.role is distinct from old.role then
    if not (old.role = 'buyer' and new.role = 'seller') then
      new.role := old.role;
    end if;
  end if;
  if new.seller_status is distinct from old.seller_status then
    if not (
      new.seller_status = 'pending'
      and (old.seller_status is null or old.seller_status = 'rejected')
    ) then
      new.seller_status := old.seller_status;
    end if;
  end if;
  return new;
end;
$$;

create trigger profiles_protect
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

insert into storage.buckets (id, name, public)
values
  ('listings', 'listings', true),
  ('avatars', 'avatars', true),
  ('offers', 'offers', true)
on conflict (id) do nothing;

create policy storage_public_read on storage.objects for select using (
  bucket_id in ('listings', 'avatars', 'offers')
);
create policy storage_auth_insert on storage.objects for insert to authenticated with check (
  bucket_id in ('listings', 'avatars', 'offers')
);
create policy storage_auth_update on storage.objects for update to authenticated using (
  bucket_id in ('listings', 'avatars', 'offers') and owner = auth.uid()
);
create policy storage_auth_delete on storage.objects for delete to authenticated using (
  bucket_id in ('listings', 'avatars', 'offers') and owner = auth.uid()
);

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'messages'
  ) then
    execute 'alter publication supabase_realtime add table public.messages';
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'notifications'
  ) then
    execute 'alter publication supabase_realtime add table public.notifications';
  end if;
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'offers'
  ) then
    execute 'alter publication supabase_realtime add table public.offers';
  end if;
end $$;

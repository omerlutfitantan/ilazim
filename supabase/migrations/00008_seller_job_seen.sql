-- Satıcı açık işlerde yeni düşen ilanı gördü mü?

create table if not exists public.seller_seen_listings (
  seller_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  seen_at timestamptz not null default now(),
  primary key (seller_id, listing_id)
);

create index if not exists seller_seen_listings_listing_idx
  on public.seller_seen_listings(listing_id);

alter table public.seller_seen_listings enable row level security;

drop policy if exists seller_seen_read_own on public.seller_seen_listings;
create policy seller_seen_read_own on public.seller_seen_listings
  for select using (seller_id = auth.uid() or public.is_admin());

create or replace function public.mark_listing_seen_for_seller(p_listing_id uuid)
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
  if not exists (
    select 1 from public.profiles
    where id = v_uid and role in ('seller', 'admin')
  ) then
    return;
  end if;
  if not exists (select 1 from public.listings where id = p_listing_id) then
    return;
  end if;
  insert into public.seller_seen_listings (seller_id, listing_id)
  values (v_uid, p_listing_id)
  on conflict do nothing;
end;
$$;

grant execute on function public.mark_listing_seen_for_seller to authenticated;

-- Mevcut açık işler 'yeni' görünmesin; rozet yalnızca bundan sonra düşenlerde
insert into public.seller_seen_listings (seller_id, listing_id)
select p.id, l.id
from public.profiles p
join public.listings l
  on l.status = 'open'
 and l.user_id <> p.id
where p.role in ('seller', 'admin')
on conflict do nothing;

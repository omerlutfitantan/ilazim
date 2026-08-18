-- Yorumlar önce admin onayına düşer; onaylanmadan profil ve puana yansımaz.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('pending', 'approved');
  end if;
end $$;

alter table public.reviews
  add column if not exists status public.review_status;

alter table public.reviews
  add column if not exists moderated_at timestamptz;

update public.reviews
set status = 'approved',
    moderated_at = coalesce(moderated_at, created_at)
where status is null;

alter table public.reviews
  alter column status set default 'pending';

alter table public.reviews
  alter column status set not null;

create index if not exists reviews_status_idx on public.reviews(status, created_at desc);

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
    coalesce((select count(*) from public.reviews r where r.seller_id = p_seller and r.status = 'approved'), 0),
    coalesce((select round(avg(r.rating)::numeric, 2) from public.reviews r where r.seller_id = p_seller and r.status = 'approved'), 0),
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
  v_admin uuid;
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

  insert into public.reviews (listing_id, reviewer_id, seller_id, rating, comment, status)
  values (p_listing_id, v_uid, v_seller, p_rating, p_comment, 'pending')
  returning id into v_id;

  if v_listing.status = 'awarded' then
    update public.listings set status = 'completed', completed_at = coalesce(completed_at, now())
    where id = p_listing_id;
    perform public.refresh_seller_stats(v_seller);
  end if;

  for v_admin in
    select id from public.profiles where role = 'admin'
  loop
    perform public.notify_user(
      v_admin,
      'system',
      'Yorum onayı bekliyor',
      'Yeni bir değerlendirme admin onayına düştü.',
      '/admin/yorumlar',
      jsonb_build_object('review_id', v_id, 'listing_id', p_listing_id)
    );
  end loop;

  return v_id;
end;
$$;

create or replace function public.approve_review(p_review_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_review public.reviews%rowtype;
begin
  if not public.is_admin() then
    raise exception 'Yetkisiz';
  end if;

  select * into v_review from public.reviews where id = p_review_id for update;
  if not found then
    raise exception 'Yorum bulunamadı';
  end if;
  if v_review.status = 'approved' then
    return;
  end if;

  update public.reviews
  set status = 'approved',
      moderated_at = now()
  where id = p_review_id;

  perform public.refresh_seller_stats(v_review.seller_id);
  perform public.notify_user(
    v_review.seller_id,
    'review',
    'Yeni değerlendirme',
    v_review.rating::text || ' yıldız aldınız.',
    '/usta/' || (select slug from public.profiles where id = v_review.seller_id),
    jsonb_build_object('listing_id', v_review.listing_id, 'review_id', v_review.id)
  );
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

drop policy if exists reviews_read on public.reviews;
drop policy if exists reviews_public on public.reviews;
drop policy if exists reviews_own on public.reviews;
drop policy if exists reviews_admin on public.reviews;

create policy reviews_public on public.reviews
  for select using (status = 'approved');

create policy reviews_own on public.reviews
  for select using (reviewer_id = auth.uid());

create policy reviews_admin on public.reviews
  for select using (public.is_admin());

grant execute on function public.approve_review to authenticated;

-- Mevcut puanları yalnızca onaylı yorumlardan yeniden hesapla.
do $$
declare
  v_seller uuid;
begin
  for v_seller in select distinct seller_id from public.reviews
  loop
    perform public.refresh_seller_stats(v_seller);
  end loop;
end $$;

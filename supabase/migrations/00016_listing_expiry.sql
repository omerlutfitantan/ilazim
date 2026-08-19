-- İlan süresi: 14 gün. Süresi dolan ilan 'expired' statüsüne geçer,
-- teklif verenlere ücret iade edilir (cüzdan bakiyesi artırılır).

-- 1. listing_status enum'a 'expired' ekle
alter type public.listing_status add value if not exists 'expired';

-- 2. listings tablosuna expires_at kolonu ekle
alter table public.listings
  add column if not exists expires_at timestamptz;

-- Mevcut 'open' ilanlar için geriye dönük expires_at hesapla (oluşturma + 14 gün)
update public.listings
set expires_at = created_at + interval '14 days'
where status = 'open'
  and expires_at is null;

-- Yeni açılan ilanlar için default (trigger ile set edeceğiz)
-- (default doğrudan kolon seviyesinde veremiyoruz çünkü sonradan ekleniyor)

-- 3. Yeni ilan açılırken expires_at otomatik set eden trigger
create or replace function public.set_listing_expires_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.expires_at is null and new.status = 'open' then
    new.expires_at := now() + interval '14 days';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_listing_expires_at on public.listings;
create trigger trg_set_listing_expires_at
  before insert on public.listings
  for each row
  execute function public.set_listing_expires_at();

-- 4. Süresi dolan ilanları expire eden ve iade yapan fonksiyon
create or replace function public.expire_listings()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
  v_bid_fee numeric(12,2);
begin
  -- Platform'dan bid_fee oku
  select coalesce(bid_fee, 0) into v_bid_fee
  from public.platform_settings
  where id = 1;

  -- Süresi dolan açık ilanlar
  for rec in
    select id
    from public.listings
    where status = 'open'
      and expires_at is not null
      and expires_at <= now()
  loop
    -- İlanı expired yap
    update public.listings
    set status = 'expired'
    where id = rec.id;

    -- Bu ilandaki teklifleri reddedilmiş olarak işaretle
    update public.offers
    set status = 'rejected'
    where listing_id = rec.id
      and status = 'pending';

    -- Teklif veren satıcılara iade
    if v_bid_fee > 0 then
      insert into public.wallet_transactions (user_id, amount, type, description, listing_id)
      select
        o.seller_id,
        v_bid_fee,
        'refund',
        'İlan süresi doldu — teklif ücreti iadesi',
        rec.id
      from public.offers o
      where o.listing_id = rec.id;

      update public.wallets w
      set cash_balance = cash_balance + v_bid_fee
      from public.offers o
      where o.listing_id = rec.id
        and w.user_id = o.seller_id;
    end if;
  end loop;
end;
$$;

-- 5. pg_cron varsa saatlik zamanlama ekle (Supabase'de pg_cron mevcut)
-- Yoksa uygulama katmanından periyodik olarak çağrılabilir.
do $$
begin
  if exists (
    select 1 from pg_extension where extname = 'pg_cron'
  ) then
    perform cron.schedule(
      'expire-listings',
      '0 * * * *',  -- her saat başı
      'select public.expire_listings()'
    );
  end if;
exception when others then
  -- pg_cron yoksa sessizce geç
  null;
end $$;

-- 6. wallet_transactions tablosunda 'refund' type'ı ekle (eğer enum ise)
do $$
begin
  alter type public.wallet_tx_type add value if not exists 'refund';
exception when others then null;
end $$;

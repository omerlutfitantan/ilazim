-- Eski seed ilçelerini (kısa slug) canonical kayıtlara taşı, sonra sil.
-- 00009_turkey_districts.sql uygulanmamış ortamlarda önce onu çalıştırın.

update public.profiles p
set district_id = canonical.id
from public.locations legacy
join public.locations canonical
  on canonical.type = 'district'
 and canonical.parent_id = legacy.parent_id
 and canonical.name = legacy.name
 and canonical.slug like '%-%'
where p.district_id = legacy.id
  and legacy.type = 'district'
  and legacy.slug not like '%-%';

update public.listings l
set district_id = canonical.id
from public.locations legacy
join public.locations canonical
  on canonical.type = 'district'
 and canonical.parent_id = legacy.parent_id
 and canonical.name = legacy.name
 and canonical.slug like '%-%'
where l.district_id = legacy.id
  and legacy.type = 'district'
  and legacy.slug not like '%-%';

delete from public.locations legacy
using public.locations canonical
where legacy.type = 'district'
  and legacy.slug not like '%-%'
  and canonical.type = 'district'
  and canonical.parent_id = legacy.parent_id
  and canonical.name = legacy.name
  and canonical.slug like '%-%'
  and canonical.id <> legacy.id;

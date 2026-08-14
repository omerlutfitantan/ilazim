-- Avatar klasörü yalnızca hesabın sahibi; admin kullanıcı yönetimi RPC.

drop policy if exists storage_auth_insert on storage.objects;
drop policy if exists storage_auth_update on storage.objects;
drop policy if exists storage_auth_delete on storage.objects;

create policy storage_auth_insert on storage.objects for insert to authenticated with check (
  bucket_id in ('listings', 'offers')
  or (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  )
);

create policy storage_auth_update on storage.objects for update to authenticated
using (
  (
    bucket_id in ('listings', 'offers')
    and owner = auth.uid()
  )
  or (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  )
)
with check (
  (
    bucket_id in ('listings', 'offers')
    and owner = auth.uid()
  )
  or (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  )
);

create policy storage_auth_delete on storage.objects for delete to authenticated using (
  (
    bucket_id in ('listings', 'offers')
    and owner = auth.uid()
  )
  or (
    bucket_id = 'avatars'
    and split_part(name, '/', 1) = auth.uid()::text
  )
);

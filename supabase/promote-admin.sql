-- Üye olduktan sonra kendi e-postanı yazıp SQL Editor’da çalıştır.
-- Bu hesap /admin paneline girer.

update public.profiles
set
  role = 'admin',
  seller_status = 'approved'
where id = (
  select id from auth.users where email = 'SENIN_EMAILIN'
);

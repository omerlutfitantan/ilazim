-- handle_new_user: kayıt sırasında gelen role metadata'yı destekle
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role public.user_role;
begin
  -- Metadata'dan rol oku; sadece 'seller' geçerli, aksi hâlde buyer
  v_role := case
    when (new.raw_user_meta_data->>'role') = 'seller' then 'seller'::public.user_role
    else 'buyer'::public.user_role
  end;

  insert into public.profiles (id, full_name, display_name, slug, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    public.unique_slug(coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))),
    v_role
  );

  -- Satıcılar için cüzdan hemen oluştur
  if v_role = 'seller' then
    perform public.ensure_wallet(new.id);
  end if;

  return new;
end;
$$;

-- Mevcut buyer'ın seller'a geçmesi için RPC
-- protect_profile_fields trigger'ı buyer→seller geçişine zaten izin veriyor
create or replace function public.upgrade_to_seller()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role public.user_role;
begin
  if v_uid is null then
    raise exception 'Oturum gerekli';
  end if;

  select role into v_role from public.profiles where id = v_uid;

  if v_role = 'seller' or v_role = 'admin' then
    -- Zaten satıcı, cüzdan kontrolü yap
    perform public.ensure_wallet(v_uid);
    return;
  end if;

  -- buyer → seller
  update public.profiles set role = 'seller' where id = v_uid;
  perform public.ensure_wallet(v_uid);
end;
$$;

grant execute on function public.upgrade_to_seller() to authenticated;

notify pgrst, 'reload schema';

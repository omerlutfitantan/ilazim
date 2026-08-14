# iLazım

Hizmet ve ürün taleplerinin ilan açıldığı, satıcıların sabit ücretle teklif verdiği pazar yeri.

## Yığın

- `apps/web` — Next.js (App Router), Tailwind v4, shadcn/ui
- `packages/shared` — tipler, Zod, teklif ücreti
- `supabase/` — şema, RLS, RPC, referans veri

Vercel kök dizini: `apps/web`.

## Ortam değişkenleri

`apps/web/.env.local` veya Vercel:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY` / `EMAIL_FROM` (eşleşen ilan e-postası)
- `IYZICO_API_KEY` / `IYZICO_SECRET_KEY` / `IYZICO_BASE_URL` (canlı: `https://api.iyzipay.com`)

## Supabase

1. SQL Editor’da sırayla: `00001_init.sql` … `00005_offer_vs_request.sql`
2. `seed.sql` — iller, kategoriler, ilk satıcı kampanyası
3. Authentication → Confirm email açık. Redirect: `https://SENIN_DOMAIN/auth/callback`
4. Kendi hesabınla kayıt ol, doğrula, `promote-admin.sql` içinde e-postanı yazıp çalıştır

Aynı hesap hem talep açar hem teklif verir. Hizmetlerim’deki kategoride kendi talebi açılamaz.

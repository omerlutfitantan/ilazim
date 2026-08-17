import Link from "next/link";
import { notFound } from "next/navigation";
import { formatTrPhone, formatTry } from "@ilazim/shared";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AdminUserForm } from "@/components/admin-user-form";
import { GrantForm } from "@/components/grant-form";
import { SellerReviewButtons } from "@/components/admin-seller-buttons";
import { UserAvatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  formatTrDate,
  labelOf,
  listingKindLabel,
  listingStatusLabel,
  offerStatusLabel,
  roleLabel,
  sellerStatusLabel,
  sellerTypeLabel,
  walletTxLabel,
} from "@/lib/labels";
import type { ListingKind, ListingStatus, OfferStatus, SellerStatus, SellerType, UserRole, WalletTxType } from "@ilazim/shared";

export default async function AdminUserDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
  if (!profile) notFound();

  let email: string | null = null;
  let lastSignIn: string | null = null;
  try {
    const admin = createAdminClient();
    const { data } = await admin.auth.admin.getUserById(id);
    email = data.user?.email ?? null;
    lastSignIn = data.user?.last_sign_in_at ?? null;
  } catch {
    email = null;
  }

  const [{ data: wallet }, { data: txs }, { data: listings }, { data: offers }, { data: reviews }, { data: cats }] =
    await Promise.all([
      supabase.from("wallets").select("*").eq("user_id", id).maybeSingle(),
      supabase
        .from("wallet_transactions")
        .select("*")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("listings")
        .select("id, title, slug, kind, status, offer_count, created_at, categories(slug, name)")
        .eq("user_id", id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("offers")
        .select("id, amount, status, fee_charged, created_at, listings(title, slug, categories(slug))")
        .eq("seller_id", id)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("reviews")
        .select("id, rating, comment, created_at, listings(title)")
        .eq("seller_id", id)
        .order("created_at", { ascending: false })
        .limit(20),
      supabase.from("seller_categories").select("category_id, categories(name, kind)").eq("user_id", id),
    ]);

  const locIds = [profile.city_id, profile.district_id].filter(Boolean) as string[];
  const { data: locs } = locIds.length
    ? await supabase.from("locations").select("id, name").in("id", locIds)
    : { data: [] };
  const locName = (lid: string | null) => locs?.find((l) => l.id === lid)?.name ?? "—";

  return (
    <div className="space-y-10">
      <div>
        <Link href="/admin/kullanicilar" className="text-xs text-muted-foreground underline">
          ← Kullanıcılar
        </Link>
        <div className="mt-4 flex flex-wrap items-start gap-5">
          <UserAvatar src={profile.avatar_url} name={profile.display_name} className="size-24 text-xl" />
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-4xl leading-none">{profile.display_name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{profile.full_name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge>{labelOf(roleLabel, profile.role as UserRole)}</Badge>
              {profile.seller_status && (
                <Badge variant="saffron">
                  {labelOf(sellerStatusLabel, profile.seller_status as SellerStatus)}
                </Badge>
              )}
              {profile.seller_type && (
                <Badge variant="outline">{labelOf(sellerTypeLabel, profile.seller_type as SellerType)}</Badge>
              )}
            </div>
            {profile.seller_status === "pending" && (
              <div className="mt-4">
                <SellerReviewButtons userId={profile.id} />
              </div>
            )}
          </div>
        </div>
      </div>

      <dl className="grid gap-4 rounded-2xl border border-border bg-card p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-muted-foreground">E-posta</dt>
          <dd className="mt-1 break-all">{email ?? "Görüntülenemedi"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Telefon</dt>
          <dd className="mt-1">{profile.phone ? formatTrPhone(profile.phone) : "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Slug</dt>
          <dd className="mt-1">{profile.slug ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Konum</dt>
          <dd className="mt-1">
            {locName(profile.city_id)}
            {profile.district_id ? ` / ${locName(profile.district_id)}` : ""}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Kayıt</dt>
          <dd className="mt-1">{formatTrDate(profile.created_at)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Son giriş</dt>
          <dd className="mt-1">{formatTrDate(lastSignIn)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Satıcı onayı</dt>
          <dd className="mt-1">{formatTrDate(profile.onboarding_completed_at)}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">İlk üye</dt>
          <dd className="mt-1">{profile.is_first_member ? "Evet" : "Hayır"}</dd>
        </div>
        {profile.seller_headline && (
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Başlık</dt>
            <dd className="mt-1">{profile.seller_headline}</dd>
          </div>
        )}
        {profile.bio && (
          <div className="sm:col-span-2">
            <dt className="text-xs text-muted-foreground">Hakkında</dt>
            <dd className="mt-1 whitespace-pre-wrap">{profile.bio}</dd>
          </div>
        )}
      </dl>

      <section>
        <h2 className="font-display text-2xl">Yönet</h2>
        <p className="mt-1 mb-4 text-sm text-muted-foreground">Rol, satıcı durumu ve kimlik bilgileri.</p>
        <AdminUserForm profile={profile} />
      </section>

      <section>
        <h2 className="font-display text-2xl">Cüzdan</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-1 md:max-w-xs">
          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Cüzdan bakiyesi</p>
            <p className="font-display text-2xl">{formatTry(Number(wallet?.cash_balance ?? 0))}</p>
          </div>
        </div>
        <div className="mt-4">
          <GrantForm userId={id} />
        </div>
        <ul className="mt-4 space-y-2 text-sm">
          {(txs ?? []).length === 0 && <li className="text-muted-foreground">Hareket yok.</li>}
          {(txs ?? []).map((t) => (
            <li key={t.id} className="flex justify-between gap-3 border-b border-border py-2">
              <span>
                {labelOf(walletTxLabel, t.type as WalletTxType)}
                {t.note ? ` · ${t.note}` : ""}
              </span>
              <span className="shrink-0">
                {formatTry(Number(t.amount))}
                <span className="ml-2 text-xs text-muted-foreground">{formatTrDate(t.created_at)}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      {(cats ?? []).length > 0 && (
        <section>
          <h2 className="font-display text-2xl">Hizmet alanları</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {(cats ?? []).map((c) => {
              const cat = c.categories as { name?: string; kind?: string } | null;
              return (
                <li key={c.category_id}>
                  <Badge variant={cat?.kind === "product" ? "product" : "service"}>
                    {cat?.name}
                    {cat?.kind ? ` · ${labelOf(listingKindLabel, cat.kind as ListingKind)}` : ""}
                  </Badge>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h2 className="font-display text-2xl">İlanları</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(listings ?? []).length === 0 && <li className="text-muted-foreground">İlan yok.</li>}
          {(listings ?? []).map((l) => {
            const cat = l.categories as { slug?: string; name?: string } | null;
            return (
              <li key={l.id} className="flex flex-wrap justify-between gap-2 border-b border-border py-2">
                <Link href={`/ilan/${cat?.slug}/${l.slug}`} className="underline">
                  {l.title}
                </Link>
                <span className="text-muted-foreground">
                  {labelOf(listingKindLabel, l.kind as ListingKind)} · {labelOf(listingStatusLabel, l.status as ListingStatus)} ·{" "}
                  {l.offer_count} teklif
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl">Teklifleri</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {(offers ?? []).length === 0 && <li className="text-muted-foreground">Teklif yok.</li>}
          {(offers ?? []).map((o) => {
            const listing = o.listings as {
              title?: string;
              slug?: string;
              categories?: { slug?: string } | null;
            } | null;
            return (
              <li key={o.id} className="flex flex-wrap justify-between gap-2 border-b border-border py-2">
                <Link href={`/ilan/${listing?.categories?.slug}/${listing?.slug}`} className="underline">
                  {listing?.title}
                </Link>
                <span className="text-muted-foreground">
                  {formatTry(Number(o.amount))} · {labelOf(offerStatusLabel, o.status as OfferStatus)}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <h2 className="font-display text-2xl">Aldığı yorumlar</h2>
        <ul className="mt-3 space-y-3 text-sm">
          {(reviews ?? []).length === 0 && <li className="text-muted-foreground">Yorum yok.</li>}
          {(reviews ?? []).map((r) => (
            <li key={r.id} className="rounded-xl border border-border bg-card p-4">
              <p>
                {r.rating} ★ · {(r.listings as { title?: string } | null)?.title}
              </p>
              <p className="mt-1">{r.comment}</p>
              <p className="mt-1 text-xs text-muted-foreground">{formatTrDate(r.created_at)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

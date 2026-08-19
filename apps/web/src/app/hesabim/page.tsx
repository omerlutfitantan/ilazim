import Link from "next/link";
import { redirect } from "next/navigation";
import { formatTry } from "@ilazim/shared";
import { getProfile } from "@/lib/data";
import { getDesk, canUseSellerDesk } from "@/lib/desk";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingActions } from "@/components/listing-actions";
import { ReviewForm } from "@/components/review-form";
import { UserAvatar } from "@/components/ui/avatar";
import { DeskSwitch } from "@/components/desk-switch";
import { labelOf, listingStatusLabel } from "@/lib/labels";
import type { ListingStatus } from "@ilazim/shared";

export default async function HesabimPage() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  const desk = await getDesk(profile);
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from("listings")
    .select("*, categories(name, slug)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false });

  const listingIds = (listings ?? []).map((l) => l.id);
  const { data: offers } = listingIds.length
    ? await supabase
        .from("offers")
        .select("*, profiles:seller_id(display_name, slug)")
        .in("listing_id", listingIds)
        .order("created_at", { ascending: false })
    : { data: [] };

  const { data: statsRows } = await supabase.from("seller_stats").select("*");
  const statsMap = new Map((statsRows ?? []).map((s) => [s.seller_id, s]));

  const { data: reviews } = listingIds.length
    ? await supabase.from("reviews").select("listing_id, status").in("listing_id", listingIds)
    : { data: [] };
  const reviewed = new Set((reviews ?? []).map((r) => r.listing_id));
  const pendingReview = new Set((reviews ?? []).filter((r) => r.status === "pending").map((r) => r.listing_id));
  const { data: convs } = listingIds.length
    ? await supabase.from("conversations").select("id, listing_id, seller_id").in("listing_id", listingIds)
    : { data: [] };
  const convKey = (listingId: string, sellerId: string) =>
    (convs ?? []).find((c) => c.listing_id === listingId && c.seller_id === sellerId)?.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <UserAvatar src={profile.avatar_url} name={profile.display_name} className="size-14 text-base" />
          <div>
            <h1 className="font-display text-3xl md:text-4xl">Hesabım</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {profile.display_name} · {desk === "seller" ? "Satıcı hesabı" : "Alıcı hesabı"} ·{" "}
              <Link href="/hesabim/profil" className="underline">
                Profili düzenle
              </Link>
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DeskSwitch desk={desk} canSell={canUseSellerDesk(profile)} />
          <Button asChild>
            <Link href="/ilan-ac">Yeni ilan</Link>
          </Button>
        </div>
      </div>

      <ul className="mt-10 space-y-6">
        {(listings ?? []).length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-muted-foreground">
            Henüz ilanınız yok.
          </li>
        )}
        {(listings ?? []).map((l) => {
          const mine = (offers ?? []).filter((o) => o.listing_id === l.id);
          const isExpired = l.status === "expired";
          const expiresAt = l.expires_at ? new Date(l.expires_at) : null;
          const now = new Date();
          const daysLeft = expiresAt ? Math.ceil((expiresAt.getTime() - now.getTime()) / 86400000) : null;
          return (
            <li
              key={l.id}
              className={`rounded-2xl border p-6 ${
                isExpired
                  ? "border-destructive/40 bg-destructive/5"
                  : "border-border bg-card"
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={l.kind === "service" ? "service" : "product"}>
                      {l.kind === "service" ? "Hizmet" : "Ürün"}
                    </Badge>
                    {isExpired && (
                      <Badge variant="destructive">Süresi doldu</Badge>
                    )}
                  </div>
                  <h2 className="mt-2 font-display text-2xl">
                    {isExpired ? (
                      <span className="text-muted-foreground">{l.title}</span>
                    ) : (
                      <Link href={`/ilan/${(l.categories as { slug?: string } | null)?.slug}/${l.slug}`}>
                        {l.title}
                      </Link>
                    )}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {isExpired
                      ? "Bu ilan süresi dolduğu için yayından kalktı. Teklif verenlerin ücretleri iade edildi."
                      : l.status === "open"
                        ? mine.length
                          ? `${mine.length} teklif · sohbet edip teklifi seçin${daysLeft !== null && daysLeft > 0 ? ` · ${daysLeft} gün kaldı` : ""}`
                          : `Teklif bekleniyor${daysLeft !== null && daysLeft > 0 ? ` · ${daysLeft} gün kaldı` : ""}`
                        : labelOf(listingStatusLabel, l.status as ListingStatus)}
                  </p>
                  {isExpired && (
                    <div className="mt-3">
                      <Button asChild size="sm">
                        <Link href="/ilan-ac">Yeni ilan aç</Link>
                      </Button>
                    </div>
                  )}
                </div>
                {!isExpired && <ListingActions listingId={l.id} status={l.status} />}
              </div>
              <ul className="mt-4 space-y-3">
                {mine.map((o) => {
                  const st = statsMap.get(o.seller_id);
                  const seller = o.profiles as { display_name?: string; slug?: string } | null;
                  const chatId = convKey(l.id, o.seller_id);
                  const body = (
                    <div className="flex justify-between gap-3">
                      <div>
                        <p className="font-medium">{seller?.display_name}</p>
                        {st && (
                          <p className="text-xs text-muted-foreground">
                            {Number(st.rating_avg).toFixed(1)} ★ ({st.review_count} yorum)
                          </p>
                        )}
                        <p className="mt-1 text-sm">{o.message}</p>
                        {chatId && <p className="mt-2 text-xs font-medium">Sohbeti aç →</p>}
                      </div>
                      <div className="text-right">
                        <p className="font-display text-lg">{formatTry(Number(o.amount))}</p>
                      </div>
                    </div>
                  );
                  return (
                    <li key={o.id}>
                      {chatId ? (
                        <Link href={`/mesajlar/${chatId}`} className="block rounded-xl bg-muted/50 p-4 hover:bg-muted">
                          {body}
                        </Link>
                      ) : (
                        <div className="rounded-xl bg-muted/50 p-4">{body}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
              {["awarded", "completed"].includes(l.status) && pendingReview.has(l.id) && (
                <p className="mt-3 rounded-xl bg-muted px-4 py-3 text-sm text-muted-foreground">
                  Yorumunuz admin onayında. Onaylanınca hizmet verenin profilinde görünür.
                </p>
              )}
              {["awarded", "completed"].includes(l.status) && !reviewed.has(l.id) && l.awarded_offer_id && (
                <ReviewForm listingId={l.id} />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { formatTry } from "@ilazim/shared";
import { getProfile, getSettings, DEFAULT_TOPUP_PRESETS } from "@/lib/data";
import { getDesk, canUseSellerDesk } from "@/lib/desk";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingActions } from "@/components/listing-actions";
import { ReviewForm } from "@/components/review-form";
import { UserAvatar } from "@/components/ui/avatar";
import { DeskSwitch } from "@/components/desk-switch";
import { labelOf, listingStatusLabel, walletTxLabel } from "@/lib/labels";
import type { ListingStatus } from "@ilazim/shared";
import { UpgradeToSellerButton } from "@/components/upgrade-to-seller-button";
import { TopupButtons } from "@/components/topup-buttons";
import type { WalletTxType } from "@ilazim/shared";

export default async function HesabimPage() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  const desk = await getDesk(profile);
  const supabase = await createClient();
  const isSeller = profile.role === "seller" || profile.role === "admin";
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

  // Satıcı: cüzdan + hareketler + preset miktarlar
  const [walletRes, txsRes, settingsData] = isSeller
    ? await Promise.all([
        supabase.from("wallets").select("*").eq("user_id", profile.id).maybeSingle(),
        supabase
          .from("wallet_transactions")
          .select("*")
          .eq("user_id", profile.id)
          .order("created_at", { ascending: false })
          .limit(10),
        getSettings(),
      ])
    : [{ data: null }, { data: [] }, null];
  const wallet = walletRes.data;
  const recentTxs = txsRes.data ?? [];
  const topupAmounts = settingsData?.topup_presets?.length
    ? settingsData.topup_presets
    : DEFAULT_TOPUP_PRESETS;

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

      {profile.role === "buyer" && <UpgradeToSellerButton />}

      {isSeller && (
        <div className="mt-10 space-y-8">
          {/* Bakiye kartı */}
          <div className="rounded-2xl bg-primary p-6 text-primary-foreground md:max-w-sm">
            <p className="text-xs opacity-70">Cüzdan bakiyesi</p>
            <p className="font-display text-4xl">{formatTry(Number(wallet?.cash_balance ?? 0))}</p>
          </div>

          {/* Bakiye yükleme */}
          <div>
            <h2 className="font-display text-2xl">Bakiye yükle</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Teklif ücretleri bu bakiyeden düşülür.
            </p>
            <TopupButtons amounts={topupAmounts} />
          </div>

          {/* Son hareketler */}
          {recentTxs.length > 0 && (
            <div>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">Son hareketler</h2>
                <Link href="/satici/cuzdan" className="text-sm text-muted-foreground underline underline-offset-4">
                  Tümünü gör
                </Link>
              </div>
              <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
                {recentTxs.map((t) => (
                  <li key={t.id} className="flex justify-between p-4 text-sm">
                    <div>
                      <p>{labelOf(walletTxLabel, t.type as WalletTxType)}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleString("tr-TR")}
                        {t.note ? ` · ${t.note}` : ""}
                      </p>
                    </div>
                    <p className="font-medium">{formatTry(Number(t.amount))}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

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
                      <Badge className="bg-red-100 text-red-700">Süresi doldu</Badge>
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

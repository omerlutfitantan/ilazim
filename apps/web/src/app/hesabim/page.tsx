import Link from "next/link";
import { redirect } from "next/navigation";
import { formatTry } from "@ilazim/shared";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ListingActions } from "@/components/listing-actions";
import { ReviewForm } from "@/components/review-form";

export default async function HesabimPage() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
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
    ? await supabase.from("reviews").select("listing_id").in("listing_id", listingIds)
    : { data: [] };
  const reviewed = new Set((reviews ?? []).map((r) => r.listing_id));
  const { data: convs } = listingIds.length
    ? await supabase.from("conversations").select("id, listing_id, seller_id").in("listing_id", listingIds)
    : { data: [] };
  const convKey = (listingId: string, sellerId: string) =>
    (convs ?? []).find((c) => c.listing_id === listingId && c.seller_id === sellerId)?.id;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Hesabım</h1>
          <p className="mt-1 text-sm text-muted-foreground">{profile.display_name} · alıcı paneli</p>
        </div>
        <Button asChild>
          <Link href="/ilan-ac">Yeni ilan</Link>
        </Button>
      </div>

      <ul className="mt-10 space-y-6">
        {(listings ?? []).length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-muted-foreground">
            Henüz ilanınız yok.
          </li>
        )}
        {(listings ?? []).map((l) => {
          const mine = (offers ?? []).filter((o) => o.listing_id === l.id);
          return (
            <li key={l.id} className="rounded-2xl border border-border bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Badge variant={l.kind === "service" ? "service" : "product"}>
                    {l.kind === "service" ? "Hizmet" : "Ürün"}
                  </Badge>
                  <h2 className="mt-2 font-display text-2xl">
                    <Link href={`/ilan/${(l.categories as { slug?: string } | null)?.slug}/${l.slug}`}>
                      {l.title}
                    </Link>
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {l.status === "open"
                      ? "Açık"
                      : l.status === "awarded"
                        ? "Teklif seçildi — yeni teklife kapalı"
                        : l.status}
                  </p>
                </div>
                <ListingActions listingId={l.id} status={l.status} />
              </div>
              <ul className="mt-4 space-y-3">
                {mine.map((o) => {
                  const st = statsMap.get(o.seller_id);
                  const seller = o.profiles as { display_name?: string; slug?: string } | null;
                  return (
                    <li key={o.id} className="rounded-xl bg-muted/50 p-4">
                      <div className="flex justify-between gap-3">
                        <div>
                          <Link href={`/usta/${seller?.slug}`} className="font-medium underline">
                            {seller?.display_name}
                          </Link>
                          <p className="text-xs">
                            <Link href={`/usta/${seller?.slug}`} className="underline">
                              Profili incele
                            </Link>
                            {convKey(l.id, o.seller_id) && (
                              <>
                                {" · "}
                                <Link href={`/mesajlar/${convKey(l.id, o.seller_id)}`} className="underline">
                                  Mesaj / teklifi seç
                                </Link>
                              </>
                            )}
                          </p>
                          {st && (
                            <p className="text-xs text-muted-foreground">
                              {Number(st.rating_avg).toFixed(1)} ★ ({st.review_count} yorum)
                            </p>
                          )}
                          <p className="mt-1 text-sm">{o.message}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-display text-lg">{formatTry(Number(o.amount))}</p>
                          {l.status === "open" && o.status === "pending" && (
                            <ListingActions listingId={l.id} status={l.status} acceptOfferId={o.id} />
                          )}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
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

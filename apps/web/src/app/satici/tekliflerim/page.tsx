import Link from "next/link";
import { redirect } from "next/navigation";
import { formatTry, maskPersonName } from "@ilazim/shared";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { labelOf, listingStatusLabel, offerStatusLabel, formatTrDate } from "@/lib/labels";
import type { ListingStatus, OfferStatus } from "@ilazim/shared";

export default async function Page() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  const supabase = await createClient();

  const { data: offers } = await supabase
    .from("offers")
    .select("*")
    .eq("seller_id", profile.id)
    .order("created_at", { ascending: false });

  const listingIds = [...new Set((offers ?? []).map((o) => o.listing_id))];
  const { data: listings } = listingIds.length
    ? await supabase
        .from("listings")
        .select("id, title, slug, status, user_id, categories(slug)")
        .in("id", listingIds)
    : { data: [] };

  const listingMap = new Map((listings ?? []).map((l) => [l.id, l]));
  const ownerIds = [...new Set((listings ?? []).map((l) => l.user_id))];
  const { data: owners } = ownerIds.length
    ? await supabase.from("profiles").select("id, full_name, display_name").in("id", ownerIds)
    : { data: [] };
  const ownerMap = new Map((owners ?? []).map((p) => [p.id, p]));

  const { data: convs } = await supabase
    .from("conversations")
    .select("id, listing_id")
    .eq("seller_id", profile.id);
  const convByListing = new Map((convs ?? []).map((c) => [c.listing_id, c.id]));

  return (
    <div>
      <h1 className="font-display text-4xl">Tekliflerim</h1>
      <p className="mt-2 text-sm text-muted-foreground">Verdiğiniz teklifler. Karta basınca sohbet açılır.</p>
      <ul className="mt-8 space-y-3">
        {(offers ?? []).length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">
            Henüz teklifiniz yok. Açık işlerden bir ilana teklif verin.
          </li>
        )}
        {(offers ?? []).map((o) => {
          const listing = listingMap.get(o.listing_id);
          const owner = listing ? ownerMap.get(listing.user_id) : null;
          const cat = listing?.categories as { slug?: string } | null;
          const convId = convByListing.get(o.listing_id);
          const href = convId
            ? `/mesajlar/${convId}`
            : listing
              ? `/ilan/${cat?.slug}/${listing.slug}`
              : "/satici/tekliflerim";
          return (
            <li key={o.id}>
              <Link
                href={href}
                className="block rounded-2xl border border-border bg-card p-5 transition-colors hover:border-ink/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium">{listing?.title ?? "İlan"}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {maskPersonName(owner?.full_name || owner?.display_name)}
                      {" · "}
                      {formatTrDate(o.created_at)}
                    </p>
                  </div>
                  <p className="font-display text-2xl">{formatTry(Number(o.amount))}</p>
                </div>
                {o.message && <p className="mt-3 line-clamp-3 text-sm leading-6">{o.message}</p>}
                {o.eta_text && <p className="mt-1 text-xs text-muted-foreground">Süre: {o.eta_text}</p>}
                <p className="mt-3 text-xs text-muted-foreground">
                  Teklif {labelOf(offerStatusLabel, o.status as OfferStatus)}
                  {" · "}
                  İlan {labelOf(listingStatusLabel, listing?.status as ListingStatus)}
                  {" · "}
                  Kesilen ücret {formatTry(Number(o.fee_charged))}
                </p>
                <p className="mt-3 text-xs font-medium">{convId ? "Sohbeti aç →" : "İlanı gör →"}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

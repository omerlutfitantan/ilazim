import Link from "next/link";
import { redirect } from "next/navigation";
import { formatTry, maskPersonName } from "@ilazim/shared";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { labelOf, listingStatusLabel, offerStatusLabel, formatTrDate } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { ListingStatus, OfferStatus } from "@ilazim/shared";

function sellerOfferStatusLabel(status: OfferStatus) {
  if (status === "accepted") return "Teklif kabul edildi";
  return labelOf(offerStatusLabel, status);
}

function sellerListingStatusLabel(status: ListingStatus | null | undefined, offerAccepted: boolean) {
  if (offerAccepted && (status === "awarded" || status === "completed")) {
    return status === "completed" ? "İş tamamlandı" : "Alıcı sizi seçti";
  }
  return labelOf(listingStatusLabel, status);
}

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
          const accepted = o.status === "accepted";
          const pending = o.status === "pending";
          return (
            <li key={o.id}>
              <Link
                href={href}
                className={cn(
                  "block rounded-2xl border p-5 transition-colors",
                  accepted
                    ? "border-emerald-500/70 bg-emerald-50/80 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.15)] hover:border-emerald-600"
                    : pending
                      ? "border-amber-400/70 bg-amber-50/80 shadow-[inset_0_0_0_1px_rgba(245,158,11,0.15)] hover:border-amber-500"
                      : "border-border bg-card hover:border-ink/30",
                )}
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
                {accepted && (
                  <p className="mt-3 inline-flex items-center rounded-full bg-emerald-600 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
                    Teklif kabul edildi
                  </p>
                )}
                {pending && (
                  <p className="mt-3 inline-flex items-center rounded-full bg-amber-500 px-2.5 py-1 text-[11px] font-semibold tracking-wide text-white uppercase">
                    Bekliyor
                  </p>
                )}
                <p className={cn("text-xs text-muted-foreground", accepted || pending ? "mt-2" : "mt-3")}>
                  {!accepted && !pending && (
                    <>
                      Teklif {sellerOfferStatusLabel(o.status as OfferStatus)}
                      {" · "}
                    </>
                  )}
                  {sellerListingStatusLabel(listing?.status as ListingStatus, accepted)}
                  {" · "}
                  Teklif ücreti {formatTry(Number(o.fee_charged))}
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

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatTry } from "@ilazim/shared";
import { StarRating } from "@/components/star-rating";
import { ReviewModerationButtons } from "@/components/review-moderation-buttons";
import { Badge } from "@/components/ui/badge";
import { labelOf, listingKindLabel } from "@/lib/labels";
import type { ListingKind } from "@ilazim/shared";

type Person = { id?: string; display_name?: string | null; full_name?: string | null; slug?: string | null };
type ListingInfo = {
  id?: string;
  title?: string | null;
  slug?: string | null;
  kind?: ListingKind | null;
  awarded_offer_id?: string | null;
  categories?: { name?: string; slug?: string } | { name?: string; slug?: string }[] | null;
};

function personName(p: Person | null | undefined) {
  return p?.full_name || p?.display_name || "—";
}

function ReviewAdminCard({
  review,
  offer,
  pending,
}: {
  review: {
    id: string;
    rating: number;
    comment: string;
    created_at: string;
    reviewer: Person | Person[] | null;
    seller: Person | Person[] | null;
    listings: ListingInfo | ListingInfo[] | null;
  };
  offer: { amount: number; fee_charged: number } | null;
  pending: boolean;
}) {
  const reviewer = (Array.isArray(review.reviewer) ? review.reviewer[0] : review.reviewer) ?? null;
  const seller = (Array.isArray(review.seller) ? review.seller[0] : review.seller) ?? null;
  const listing = (Array.isArray(review.listings) ? review.listings[0] : review.listings) ?? null;
  const category = Array.isArray(listing?.categories) ? listing?.categories[0] : listing?.categories;
  const kind = listing?.kind ? labelOf(listingKindLabel, listing.kind) : null;

  return (
    <li
      className={`rounded-2xl border bg-card p-4 ${pending ? "border-accent/40" : "border-border"}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        {pending && <Badge variant="saffron">Onay bekliyor</Badge>}
        <StarRating value={review.rating} size="sm" />
      </div>
      <p className="mt-2 text-sm">{review.comment}</p>
      <dl className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
        <div>
          <dt className="font-medium text-foreground">Yorumu yapan</dt>
          <dd>
            {reviewer?.id ? (
              <Link href={`/admin/kullanicilar/${reviewer.id}`} className="underline">
                {personName(reviewer)}
              </Link>
            ) : (
              personName(reviewer)
            )}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Yorumu alan</dt>
          <dd>
            {seller?.id ? (
              <Link href={`/admin/kullanicilar/${seller.id}`} className="underline">
                {personName(seller)}
              </Link>
            ) : (
              personName(seller)
            )}
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="font-medium text-foreground">Hizmet / ilan</dt>
          <dd>
            {kind ? `${kind} · ` : ""}
            {category?.name ? `${category.name} · ` : ""}
            {listing?.title ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Verilen teklif</dt>
          <dd>{offer ? formatTry(Number(offer.amount)) : "—"}</dd>
        </div>
        <div>
          <dt className="font-medium text-foreground">Teklif ücreti</dt>
          <dd>{offer ? formatTry(Number(offer.fee_charged)) : "—"}</dd>
        </div>
      </dl>
      <ReviewModerationButtons reviewId={review.id} pending={pending} />
    </li>
  );
}

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, status, created_at, listing_id, seller_id, reviewer_id, reviewer:reviewer_id(id, display_name, full_name), seller:seller_id(id, display_name, slug), listings(id, title, slug, kind, awarded_offer_id, categories(name, slug))",
    )
    .order("created_at", { ascending: false })
    .limit(80);

  const rows = data ?? [];
  const awardedIds = [
    ...new Set(
      rows
        .map((r) => {
          const listing = Array.isArray(r.listings) ? r.listings[0] : r.listings;
          return listing?.awarded_offer_id as string | undefined;
        })
        .filter(Boolean),
    ),
  ] as string[];
  const listingIds = rows.map((r) => r.listing_id).filter(Boolean);
  const sellerIds = rows.map((r) => r.seller_id).filter(Boolean);

  const [{ data: awardedOffers }, { data: fallbackOffers }] = await Promise.all([
    awardedIds.length
      ? supabase.from("offers").select("id, listing_id, seller_id, amount, fee_charged").in("id", awardedIds)
      : Promise.resolve({ data: [] as { id: string; listing_id: string; seller_id: string; amount: number; fee_charged: number }[] }),
    listingIds.length
      ? supabase
          .from("offers")
          .select("id, listing_id, seller_id, amount, fee_charged")
          .in("listing_id", listingIds)
          .in("seller_id", sellerIds)
          .eq("status", "accepted")
      : Promise.resolve({ data: [] as { id: string; listing_id: string; seller_id: string; amount: number; fee_charged: number }[] }),
  ]);

  const offerByAwarded = new Map((awardedOffers ?? []).map((o) => [o.id, o]));
  const offerByPair = new Map((fallbackOffers ?? []).map((o) => [`${o.listing_id}:${o.seller_id}`, o]));

  function offerFor(r: (typeof rows)[number]) {
    const listing = Array.isArray(r.listings) ? r.listings[0] : r.listings;
    const awardedId = listing?.awarded_offer_id as string | undefined;
    return (
      (awardedId ? offerByAwarded.get(awardedId) : undefined) ??
      offerByPair.get(`${r.listing_id}:${r.seller_id}`) ??
      null
    );
  }

  const pending = rows.filter((r) => r.status === "pending");
  const rest = rows.filter((r) => r.status !== "pending");

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl">Yorumlar</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Yeni yorumlar yayına girmeden önce burada onaylanır. Sahte yorumlar silinir; puana yansımaz.
      </p>

      <h2 className="font-display text-xl">Onay bekleyen</h2>
      <ul className="mt-3 space-y-3">
        {pending.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Bekleyen yorum yok.
          </li>
        )}
        {pending.map((r) => (
          <ReviewAdminCard
            key={r.id}
            review={{
              ...r,
              reviewer: r.reviewer as Person | Person[] | null,
              seller: r.seller as Person | Person[] | null,
              listings: r.listings as ListingInfo | ListingInfo[] | null,
            }}
            offer={offerFor(r)}
            pending
          />
        ))}
      </ul>

      <h2 className="mt-10 font-display text-xl">Yayındaki yorumlar</h2>
      <ul className="mt-3 space-y-3">
        {rest.length === 0 && <li className="text-sm text-muted-foreground">Yayında yorum yok.</li>}
        {rest.map((r) => (
          <ReviewAdminCard
            key={r.id}
            review={{
              ...r,
              reviewer: r.reviewer as Person | Person[] | null,
              seller: r.seller as Person | Person[] | null,
              listings: r.listings as ListingInfo | ListingInfo[] | null,
            }}
            offer={offerFor(r)}
            pending={false}
          />
        ))}
      </ul>
    </div>
  );
}

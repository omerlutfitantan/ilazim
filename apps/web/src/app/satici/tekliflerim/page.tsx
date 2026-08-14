import Link from "next/link";
import { redirect } from "next/navigation";
import { formatTry, maskPersonName } from "@ilazim/shared";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { labelOf, listingStatusLabel, offerStatusLabel } from "@/lib/labels";
import type { ListingStatus, OfferStatus } from "@ilazim/shared";

export default async function Page() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  const supabase = await createClient();
  const { data } = await supabase
    .from("offers")
    .select("*, listings(title, slug, status, categories(slug), profiles:user_id(full_name, display_name))")
    .eq("seller_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-4xl">Tekliflerim</h1>
      <ul className="mt-8 space-y-3">
        {(data ?? []).map((o) => {
          const listing = o.listings as {
            title?: string;
            slug?: string;
            status?: string;
            categories?: { slug?: string } | null;
            profiles?: { full_name?: string | null; display_name?: string | null } | null;
          } | null;
          return (
            <li key={o.id} className="rounded-2xl border border-border bg-card p-4">
              <Link href={`/ilan/${listing?.categories?.slug}/${listing?.slug}`} className="font-medium underline">
                {listing?.title}
              </Link>
              <p className="mt-1 text-sm">
                {maskPersonName(listing?.profiles?.full_name || listing?.profiles?.display_name)}
                {" · "}
                {formatTry(Number(o.amount))} · teklif {labelOf(offerStatusLabel, o.status as OfferStatus)} · ilan{" "}
                {labelOf(listingStatusLabel, listing?.status as ListingStatus)}
              </p>
              <p className="text-xs text-muted-foreground">Kesilen ücret: {formatTry(Number(o.fee_charged))}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

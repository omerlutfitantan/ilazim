import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatTry, maskPersonName } from "@ilazim/shared";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { ChatBox } from "@/components/chat-box";
import { ReviewForm } from "@/components/review-form";
import { RevealContact } from "@/components/reveal-contact";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  const supabase = await createClient();
  const { data: conv } = await supabase
    .from("conversations")
    .select("*, listings(id, title, slug, status, show_phone, awarded_offer_id, user_id, categories(slug))")
    .eq("id", id)
    .maybeSingle();
  if (!conv) notFound();
  if (conv.buyer_id !== profile.id && conv.seller_id !== profile.id && profile.role !== "admin") {
    notFound();
  }
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const { data: offer } = await supabase
    .from("offers")
    .select("id, status, seller_id, amount, fee_charged")
    .eq("listing_id", conv.listing_id)
    .eq("seller_id", conv.seller_id)
    .maybeSingle();

  const { data: buyer } = await supabase
    .from("profiles")
    .select("full_name, display_name, slug")
    .eq("id", conv.buyer_id)
    .maybeSingle();
  const { data: seller } = await supabase
    .from("profiles")
    .select("display_name, slug")
    .eq("id", conv.seller_id)
    .maybeSingle();

  const isBuyer = profile.id === conv.buyer_id;
  const listing = conv.listings as {
    id: string;
    title?: string;
    status?: string;
    show_phone?: boolean;
    awarded_offer_id?: string | null;
    categories?: { slug?: string } | null;
    slug?: string;
  } | null;

  const otherLabel = isBuyer
    ? seller?.display_name
    : maskPersonName(buyer?.full_name || buyer?.display_name);

  const { data: existingReview } = listing?.id
    ? await supabase.from("reviews").select("id").eq("listing_id", listing.id).maybeSingle()
    : { data: null };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{listing?.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {otherLabel}
            {seller?.slug && isBuyer && (
              <>
                {" · "}
                <Link href={`/usta/${seller.slug}`} className="underline">
                  Profili incele
                </Link>
              </>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          {offer && (
            <p className="text-sm font-semibold">Teklif ücreti {formatTry(Number(offer.amount))}</p>
          )}
          <RevealContact listingId={conv.listing_id} shared={Boolean(listing?.show_phone)} />
        </div>
      </div>
      {listing?.status === "awarded" && (
        <p className="mt-3 rounded-xl bg-accent/40 px-3 py-2 text-sm">
          Teklif seçildi. Bu ilan yeni tekliflere kapalı.
        </p>
      )}
      <ChatBox
        conversationId={id}
        userId={profile.id}
        initial={messages ?? []}
        offerId={offer?.id}
        listingStatus={listing?.status ?? "open"}
        isBuyer={isBuyer}
      />
      {isBuyer && listing?.status && ["awarded", "completed"].includes(listing.status) && !existingReview && (
        <ReviewForm listingId={listing.id} />
      )}
    </div>
  );
}

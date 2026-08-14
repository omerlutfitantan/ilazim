import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { formatTry, maskPersonName } from "@ilazim/shared";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { ChatPanel } from "@/components/chat-panel";
import { ReviewForm } from "@/components/review-form";
import { RevealContact } from "@/components/reveal-contact";
import { AcceptOfferButton } from "@/components/listing-actions";

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
    .select("full_name, display_name, slug, avatar_url")
    .eq("id", conv.buyer_id)
    .maybeSingle();
  const { data: seller } = await supabase
    .from("profiles")
    .select("display_name, slug, avatar_url")
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
  const listingHref = listing?.slug
    ? `/ilan/${listing.categories?.slug}/${listing.slug}`
    : null;

  const { data: existingReview } = listing?.id
    ? await supabase.from("reviews").select("id").eq("listing_id", listing.id).maybeSingle()
    : { data: null };

  const awardedThis = listing?.status === "awarded" && offer?.id && listing.awarded_offer_id === offer.id;
  const awardedOther = listing?.status === "awarded" && offer?.id && listing.awarded_offer_id !== offer.id;

  return (
    <>
      <ChatPanel
        conversationId={id}
        userId={profile.id}
        initial={messages ?? []}
        title={listing?.title ?? "İlan"}
        subtitle={otherLabel ?? "Karşı taraf"}
        listingHref={listingHref}
        avatarSrc={isBuyer ? seller?.avatar_url : buyer?.avatar_url}
        avatarName={otherLabel}
        actions={
          <>
            {offer && (
              <p className="font-display text-lg leading-none">{formatTry(Number(offer.amount))}</p>
            )}
            {isBuyer && seller?.slug && (
              <Link href={`/usta/${seller.slug}`} className="text-[11px] text-muted-foreground underline">
                Profili incele
              </Link>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              {isBuyer && listing?.status === "open" && offer?.status === "pending" && offer.id && (
                <AcceptOfferButton offerId={offer.id} size="sm" />
              )}
              <RevealContact listingId={conv.listing_id} shared={Boolean(listing?.show_phone)} />
            </div>
          </>
        }
        banner={
          awardedThis ? (
            <p className="border-b border-accent/40 bg-accent/30 px-4 py-2 text-center text-sm">
              Bu teklifi seçtiniz.
            </p>
          ) : awardedOther ? (
            <p className="border-b border-border bg-muted px-4 py-2 text-center text-sm">
              Başka bir teklif seçildi. İlan yeni tekliflere kapalı.
            </p>
          ) : null
        }
      />
      {isBuyer && listing?.status && ["awarded", "completed"].includes(listing.status) && !existingReview && (
        <div className="mx-auto max-w-2xl px-4 pb-12">
          <ReviewForm listingId={listing.id} />
        </div>
      )}
    </>
  );
}

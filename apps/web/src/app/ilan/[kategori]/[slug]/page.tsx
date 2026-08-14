import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatTry, KIND_LABELS, maskPersonName } from "@ilazim/shared";
import { getListingBySlug, getMyServiceCategoryIds, getProfile, getSellerStatsMap, getSettings } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/json-ld";
import { StarRating } from "@/components/star-rating";
import { OfferForm } from "@/components/offer-form";
import { HideListingButton } from "@/components/hide-listing-button";
import { Button } from "@/components/ui/button";
import type { ListingKind, ListingStatus } from "@/lib/database.types";

type Props = { params: Promise<{ kategori: string; slug: string }> };

type ListingView = {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  slug: string;
  description: string;
  kind: ListingKind;
  status: ListingStatus;
  offer_count: number;
  budget_min: number | null;
  budget_max: number | null;
  show_phone?: boolean;
  categories: { name: string; slug: string } | null;
  locations: { name: string } | null;
  district: { name: string } | null;
  profiles?: { full_name: string | null; display_name: string | null } | null;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = (await getListingBySlug(slug)) as ListingView | null;
  if (!listing) return { title: "İlan bulunamadı" };
  return {
    title: listing.title,
    description: listing.description.slice(0, 155),
    alternates: { canonical: `/ilan/${listing.categories?.slug}/${listing.slug}` },
  };
}

export default async function ListingPage({ params }: Props) {
  const { slug } = await params;
  const listing = (await getListingBySlug(slug)) as ListingView | null;
  if (!listing) notFound();
  const profile = await getProfile();
  const settings = await getSettings();
  const supabase = isSupabaseConfigured() ? await createClient() : null;

  let offers: Array<{
    id: string;
    amount: number;
    message: string;
    eta_text: string | null;
    seller_id: string;
    status: string;
    created_at: string;
    profiles: { display_name: string | null; slug: string | null } | null;
  }> = [];

  const isOwner = profile?.id === listing.user_id;
  let myOffer: { id: string; status: string } | null = null;

  if (supabase && (isOwner || profile?.role === "admin")) {
    const { data } = await supabase
      .from("offers")
      .select("id, amount, message, eta_text, seller_id, status, created_at, profiles:seller_id(display_name, slug)")
      .eq("listing_id", listing.id)
      .order("created_at", { ascending: false });
    offers = (data as unknown as typeof offers) ?? [];
  }

  let myConversationId: string | null = null;
  if (supabase && profile && !isOwner) {
    const { data } = await supabase
      .from("offers")
      .select("id, status")
      .eq("listing_id", listing.id)
      .eq("seller_id", profile.id)
      .maybeSingle();
    myOffer = data;
    if (data) {
      const { data: conv } = await supabase
        .from("conversations")
        .select("id")
        .eq("listing_id", listing.id)
        .eq("seller_id", profile.id)
        .maybeSingle();
      myConversationId = conv?.id ?? null;
    }
  }

  const convBySeller = new Map<string, string>();
  if (supabase && isOwner) {
    const { data: convs } = await supabase
      .from("conversations")
      .select("id, seller_id")
      .eq("listing_id", listing.id);
    for (const c of convs ?? []) convBySeller.set(c.seller_id, c.id);
  }

  let hidden = false;
  if (supabase && profile && !isOwner) {
    const { data } = await supabase
      .from("seller_hidden_listings")
      .select("listing_id")
      .eq("seller_id", profile.id)
      .eq("listing_id", listing.id)
      .maybeSingle();
    hidden = Boolean(data);
  }

  const statsMap = await getSellerStatsMap(offers.map((o) => o.seller_id));

  let inServiceArea = listing.kind !== "service";
  if (profile && listing.kind === "service") {
    const ids = await getMyServiceCategoryIds(profile.id);
    inServiceArea = ids.includes(listing.category_id);
  }

  const isSellerActor =
    !!profile &&
    profile.role !== "buyer" &&
    (profile.role === "admin" || profile.seller_status === "approved");

  if (supabase && isSellerActor && !isOwner) {
    await supabase.rpc("mark_listing_seen_for_seller", { p_listing_id: listing.id });
  }
  const canHide =
    isSellerActor &&
    listing.status === "open" &&
    listing.user_id !== profile?.id &&
    !hidden;
  const canOffer = canHide && !myOffer && inServiceArea;

  let buyerLabel = isOwner
    ? "Sizin ilanınız"
    : maskPersonName(listing.profiles?.full_name || listing.profiles?.display_name);

  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": listing.kind === "service" ? "Service" : "Product",
          name: listing.title,
          description: listing.description,
          areaServed: listing.locations?.name,
        }}
      />
      <p className="text-sm text-muted-foreground">
        <Link href="/">Anasayfa</Link> /{" "}
        <Link href={`/${listing.kind === "service" ? "hizmetler" : "urunler"}/${listing.categories?.slug}`}>
          {listing.categories?.name}
        </Link>
      </p>
      <Badge className="mt-4" variant={listing.kind === "service" ? "service" : "product"}>
        {KIND_LABELS[listing.kind]}
      </Badge>
      <h1 className="mt-3 font-display text-4xl">{listing.title}</h1>
      <p className="mt-2 text-sm">
        <span className="font-medium">{buyerLabel}</span>
        <span className="text-muted-foreground">
          {" · "}
          {listing.locations?.name}
          {listing.district?.name ? ` / ${listing.district.name}` : ""} · {listing.offer_count} teklif
        </span>
      </p>
      {canHide && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          {canOffer && (
            <Button asChild>
              <a href="#teklif">Teklif ver ({formatTry(Number(settings?.bid_fee_amount ?? 29.9))})</a>
            </Button>
          )}
          <HideListingButton listingId={listing.id} labeled />
        </div>
      )}
      {listing.status !== "open" && (
        <p className="mt-4 rounded-xl bg-muted px-4 py-3 text-sm">
          Bu talep yeni tekliflere kapalıdır.
        </p>
      )}
      <div className="mt-8 whitespace-pre-wrap text-[17px] leading-7">{listing.description}</div>
      {(listing.budget_min || listing.budget_max) && (
        <p className="mt-6 text-sm">
          Bütçe: {listing.budget_min ? formatTry(Number(listing.budget_min)) : "—"} –{" "}
          {listing.budget_max ? formatTry(Number(listing.budget_max)) : "—"}
        </p>
      )}

      {canOffer && (
        <div id="teklif" className="mt-10 scroll-mt-28 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Teklif ver</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Teklif ücreti {formatTry(Number(settings?.bid_fee_amount ?? 29.9))} (iade edilmez). Ücret
            kesilmeden telefon ve iletişim bilgisi açılmaz.
          </p>
          <OfferForm listingId={listing.id} feeLabel={formatTry(Number(settings?.bid_fee_amount ?? 29.9))} />
        </div>
      )}

      {hidden && (
        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Bu ilanı sildiniz</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Listenizden kaldırdığınız için bu işe bir daha teklif veremezsiniz.
          </p>
        </div>
      )}

      {isSellerActor &&
        listing.status === "open" &&
        listing.kind === "service" &&
        listing.user_id !== profile?.id &&
        !myOffer &&
        !hidden &&
        !inServiceArea && (
          <div className="mt-10 rounded-2xl border border-border bg-card p-6">
            <h2 className="font-display text-2xl">Bu hizmet Hizmetlerim’de yok</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {listing.categories?.name
                ? `${listing.categories.name} vermiyorsunuz.`
                : "Bu kategori seçili değil."}{" "}
              Açık işlerde yalnızca Hizmetlerim’deki talepleri görürsünüz.
            </p>
            <p className="mt-3 text-sm">
              <Link href="/satici/hizmetlerim" className="underline">
                Hizmetlerimi düzenle
              </Link>
            </p>
          </div>
        )}

      {myOffer && (
        <div className="mt-10 rounded-2xl border border-border bg-card p-6">
          <h2 className="font-display text-2xl">Teklifiniz alındı</h2>
          <p className="mt-1 text-sm text-muted-foreground">İlan sahibiyle sohbete geçebilirsiniz.</p>
          {myConversationId && (
            <Button asChild variant="saffron" className="mt-4">
              <Link href={`/mesajlar/${myConversationId}`}>İletişimi gör</Link>
            </Button>
          )}
        </div>
      )}

      {isOwner && (
        <section className="mt-12">
          <h2 className="font-display text-2xl">Gelen teklifler</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Seçmeden önce satıcı profilini, puanlarını ve geçmiş işlerini inceleyin.
          </p>
          <ul className="mt-4 space-y-4">
            {offers.length === 0 && <li className="text-sm text-muted-foreground">Henüz teklif yok.</li>}
            {offers.map((o) => {
              const st = statsMap.get(o.seller_id);
              return (
                <li key={o.id} className="rounded-2xl border border-border bg-card p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link href={`/usta/${o.profiles?.slug}`} className="font-medium underline">
                        {o.profiles?.display_name}
                      </Link>
                      {st && <StarRating value={Number(st.rating_avg)} count={st.review_count} size="sm" />}
                      <p className="mt-1 text-xs">
                        <Link href={`/usta/${o.profiles?.slug}`} className="underline">
                          Profili incele
                        </Link>
                      </p>
                      {convBySeller.get(o.seller_id) && (
                        <Button asChild variant="saffron" size="sm" className="mt-3">
                          <Link href={`/mesajlar/${convBySeller.get(o.seller_id)}`}>Sohbet</Link>
                        </Button>
                      )}
                      <p className="mt-2 text-sm">{o.message}</p>
                      {o.eta_text && <p className="mt-1 text-xs text-muted-foreground">{o.eta_text}</p>}
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl">{formatTry(Number(o.amount))}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}
    </article>
  );
}

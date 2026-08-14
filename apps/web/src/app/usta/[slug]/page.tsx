import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KIND_LABELS, maskPersonName } from "@ilazim/shared";
import { getProfile, getSellerBySlug } from "@/lib/data";
import { StarRating } from "@/components/star-rating";
import { JsonLd } from "@/components/json-ld";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/avatar";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = await getSellerBySlug(slug);
  if (!data) return { title: "Satıcı bulunamadı" };
  return {
    title: `${data.profile.display_name} — puanlar ve yorumlar`,
    description: data.profile.seller_headline ?? data.profile.bio ?? "iLazım satıcı profili",
  };
}

export default async function SellerProfilePage({ params }: Props) {
  const { slug } = await params;
  const data = await getSellerBySlug(slug);
  if (!data) notFound();
  const me = await getProfile();
  const { profile, stats, reviews, jobs, serviceAreas } = data;
  const avg = Number(stats?.rating_avg ?? 0);
  const services = jobs.filter((j) => (j.listings as { kind?: string } | null)?.kind === "service");
  const products = jobs.filter((j) => (j.listings as { kind?: string } | null)?.kind === "product");
  const isOwn = me?.id === profile.id;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: profile.display_name,
          description: profile.bio,
          aggregateRating:
            stats && stats.review_count > 0
              ? {
                  "@type": "AggregateRating",
                  ratingValue: avg,
                  reviewCount: stats.review_count,
                  bestRating: 5,
                  worstRating: 1,
                }
              : undefined,
        }}
      />
      <Badge variant="saffron">
        {profile.seller_type === "product"
          ? "Ürün satıcısı"
          : profile.seller_type === "both"
            ? "Hizmet ve ürün"
            : "Hizmet veren"}
      </Badge>
      <div className="mt-5 flex items-start gap-4">
        <UserAvatar src={profile.avatar_url} name={profile.display_name} className="size-20 text-lg" />
        <div>
          <h1 className="font-display text-4xl">{profile.display_name}</h1>
          <p className="mt-2 text-muted-foreground">{profile.seller_headline}</p>
        </div>
      </div>
      <div className="mt-4">
        <StarRating value={avg} count={stats?.review_count ?? 0} />
      </div>
      {isOwn && (
        <p className="mt-4 text-sm">
          <Link href="/hesabim/profil" className="underline">
            Profilimi düzenle
          </Link>
          {" · "}
          <Link href="/satici/hizmetlerim" className="underline">
            Hizmetlerimi düzenle
          </Link>
          {" · "}
          <Link href="/satici/ilanlar" className="underline">
            Açık işler
          </Link>
        </p>
      )}
      {serviceAreas.length > 0 && (
        <section className="mt-8">
          <h2 className="font-display text-2xl">Hizmetler</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {serviceAreas.map((a) => (
              <li key={a.category_id}>
                <Badge variant="service">
                  {(a.categories as { name?: string } | null)?.name ?? "Hizmet"}
                </Badge>
              </li>
            ))}
          </ul>
        </section>
      )}
      <h2 className="mt-10 font-display text-2xl">Hakkında</h2>
      <p className="mt-3 leading-7">{profile.bio}</p>
      <p className="mt-2 text-sm text-muted-foreground">
        {(profile.locations as { name?: string } | null)?.name} · {stats?.completed_jobs ?? 0} tamamlanan iş
      </p>

      {(services.length > 0 || products.length > 0) && (
        <section className="mt-10">
          <h2 className="font-display text-2xl">Teklifler</h2>
          <ul className="mt-4 space-y-2">
            {[...services, ...products].map((j) => {
              const l = j.listings as {
                kind?: string;
                categories?: { name?: string } | null;
              } | null;
              const kind = l?.kind === "product" ? "product" : "service";
              return (
                <li key={j.id} className="rounded-xl bg-card px-4 py-3 text-sm">
                  <span className="text-muted-foreground">{KIND_LABELS[kind]} · </span>
                  {l?.categories?.name ?? "Tamamlanan iş"}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section className="mt-12">
        <h2 className="font-display text-2xl">Puanlı yorumlar</h2>
        <ul className="mt-4 space-y-4">
          {reviews.length === 0 && (
            <li className="text-sm text-muted-foreground">Henüz yorum yok.</li>
          )}
          {reviews.map((r) => {
            const reviewer = r.reviewer as { display_name?: string; full_name?: string } | null;
            return (
              <li key={r.id} className="rounded-2xl border border-border bg-card p-5">
                <StarRating value={r.rating} size="sm" />
                <p className="mt-2 text-sm">{r.comment}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {maskPersonName(reviewer?.full_name || reviewer?.display_name)}
                </p>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

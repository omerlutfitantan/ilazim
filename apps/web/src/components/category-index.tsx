import type { Metadata } from "next";
import Link from "next/link";
import { buildCategorySeo, KIND_LABELS, KIND_PATHS, type ListingKind } from "@ilazim/shared";
import { getCategories, getCategoryBySlug, getOpenListings } from "@/lib/data";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/json-ld";

export const revalidate = 300;

export async function generateMetadata({
  params,
  kind,
}: {
  params: Promise<{ kategori?: string }>;
  kind: ListingKind;
}): Promise<Metadata> {
  const { kategori } = await params;
  if (!kategori) {
    return {
      title: `${KIND_LABELS[kind]} ilanları`,
      description: `${KIND_LABELS[kind]} taleplerini görün, teklif verin veya kendi ilanınızı açın.`,
    };
  }
  const cat = await getCategoryBySlug(kind, kategori);
  if (!cat) return { title: "Kategori bulunamadı" };
  const seo = buildCategorySeo(cat.name, kind);
  return {
    title: seo.metaTitle,
    description: seo.metaDescription,
    alternates: { canonical: `/${KIND_PATHS[kind]}/${cat.slug}` },
    openGraph: { title: seo.metaTitle, description: seo.metaDescription },
  };
}

export async function CategoryIndex({
  kind,
  kategori,
  q,
}: {
  kind: ListingKind;
  kategori?: string;
  q?: string;
}) {
  const cat = kategori ? await getCategoryBySlug(kind, kategori) : null;
  const seo = cat ? buildCategorySeo(cat.name, kind) : null;
  const categories = await getCategories(kind);
  const listings = await getOpenListings({
    kind,
    categoryId: cat?.id,
    q,
    limit: 40,
  });
  const faqs = seo?.faq ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12">
      {cat && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: seo?.h1 ?? cat.h1,
            description: seo?.metaDescription ?? cat.meta_description,
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Anasayfa", item: "/" },
                { "@type": "ListItem", position: 2, name: KIND_LABELS[kind], item: `/${KIND_PATHS[kind]}` },
                { "@type": "ListItem", position: 3, name: cat.name },
              ],
            },
          }}
        />
      )}
      {faqs.length > 0 && (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }}
        />
      )}

      <p className="text-sm text-muted-foreground">
        <Link href="/">Anasayfa</Link> /{" "}
        <Link href={`/${KIND_PATHS[kind]}`}>{KIND_LABELS[kind]}</Link>
        {cat ? ` / ${cat.name}` : null}
      </p>
      <h1 className="mt-4 max-w-3xl font-display text-[2rem] leading-[0.95] md:text-5xl">
        {seo?.h1 ?? cat?.h1 ?? `${KIND_LABELS[kind]} talepleri`}
      </h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        {seo?.content ??
          cat?.content ??
          `Açık ${KIND_LABELS[kind].toLowerCase()} ilanları. İhtiyacınız yoksa kendi talebinizi oluşturun; satıcılar size gelsin.`}
      </p>

      <div className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/${KIND_PATHS[kind]}/${c.slug}`}
            className="shrink-0 rounded-full border border-border px-3.5 py-2 text-sm hover:border-primary"
          >
            {c.name}
          </Link>
        ))}
      </div>

      <ul className="mt-10 grid gap-4">
        {listings.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-muted-foreground">
            Bu kategoride açık ilan yok.{" "}
            <Link href={`/ilan-ac?kind=${kind}`} className="underline">
              İlk ilanı siz açın
            </Link>
            .
          </li>
        )}
        {listings.map((l) => (
          <li key={l.id}>
            <Link
              href={`/ilan/${(l.categories as { slug: string } | null)?.slug ?? cat?.slug ?? "ilan"}/${l.slug}`}
              className="block rounded-2xl border border-border bg-card p-5 hover:border-primary"
            >
              <Badge variant={kind === "service" ? "service" : "product"}>{KIND_LABELS[kind]}</Badge>
              <p className="mt-2 font-display text-2xl">{l.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{l.description}</p>
              <p className="mt-3 text-xs text-muted-foreground">
                {(l.locations as { name: string } | null)?.name} · {l.offer_count} teklif
              </p>
            </Link>
          </li>
        ))}
      </ul>

      {faqs.length > 0 && (
        <section className="mt-16">
          <h2 className="font-display text-3xl">Sık sorulanlar</h2>
          <dl className="mt-6 space-y-6">
            {faqs.map((f) => (
              <div key={f.q}>
                <dt className="font-medium">{f.q}</dt>
                <dd className="mt-1 text-sm text-muted-foreground">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}
    </div>
  );
}

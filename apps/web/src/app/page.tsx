import Link from "next/link";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Baby,
  Bike,
  Dumbbell,
  Flower2,
  GraduationCap,
  Hammer,
  Home,
  Laptop,
  Sofa,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import { KIND_PATHS, type ListingKind } from "@ilazim/shared";
import { getCategories, getOpenListings } from "@/lib/data";
import { SearchHero } from "@/components/search-hero";
import { Badge } from "@/components/ui/badge";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "iLazım — Ne lazımsa, teklif gelsin",
  description:
    "Hizmet veya ürün talebinizi ilan açın. Onaylı satıcılar size teklif versin. Puanları görün, işi seçin.",
  alternates: { canonical: "/" },
};

const FALLBACK: Record<
  ListingKind,
  { name: string; slug: string; hint: string; Icon: LucideIcon }[]
> = {
  service: [
    { name: "Ev Temizliği", slug: "ev-temizligi", hint: "Derin temizlik, inşaat sonrası", Icon: Home },
    { name: "Tadilat", slug: "tadilat", hint: "Boya, mutfak, banyo", Icon: Hammer },
    { name: "Nakliyat", slug: "nakliyat", hint: "Evden eve taşıma", Icon: Truck },
    { name: "Özel Ders", slug: "ozel-ders", hint: "Sınav, dil, enstrüman", Icon: GraduationCap },
    { name: "Tamirat", slug: "tamirat", hint: "Kombi, elektrik, tesisat", Icon: Wrench },
    { name: "Güzellik", slug: "guzellik", hint: "Saç, cilt, bakım", Icon: Sparkles },
  ],
  product: [
    { name: "Bisiklet", slug: "bisiklet", hint: "Şehir, dağ, elektrikli", Icon: Bike },
    { name: "Elektronik", slug: "elektronik", hint: "Telefon, laptop, tablet", Icon: Laptop },
    { name: "Mobilya", slug: "mobilya", hint: "Koltuk, masa, dolap", Icon: Sofa },
    { name: "Spor", slug: "spor", hint: "Alet, ekipman", Icon: Dumbbell },
    { name: "Bebek", slug: "bebek-urunleri", hint: "Araba, park yatak", Icon: Baby },
    { name: "Bahçe", slug: "bahce", hint: "Alet ve dış mekan", Icon: Flower2 },
  ],
};

export default async function HomePage() {
  const [serviceCats, productCats, listings] = await Promise.all([
    getCategories("service", true),
    getCategories("product", true),
    getOpenListings({ limit: 6 }),
  ]);

  const services =
    serviceCats.length > 0
      ? serviceCats.map((c) => ({
          name: c.name,
          slug: c.slug,
          hint: c.meta_description,
          Icon: FALLBACK.service.find((f) => f.slug === c.slug)?.Icon ?? Home,
        }))
      : FALLBACK.service;
  const products =
    productCats.length > 0
      ? productCats.map((c) => ({
          name: c.name,
          slug: c.slug,
          hint: c.meta_description,
          Icon: FALLBACK.product.find((f) => f.slug === c.slug)?.Icon ?? Bike,
        }))
      : FALLBACK.product;

  return (
    <div>
      <section className="bg-ink text-white">
        <div className="mx-auto max-w-3xl px-4 py-20 text-center md:py-28">
          <p className="text-[13px] font-medium tracking-[0.18em] text-accent uppercase">
            Hizmet ve ürün
          </p>
          <h1 className="mt-5 font-display text-[clamp(2.6rem,8vw,5.25rem)] leading-[0.92]">
            Ne lazımsa,
            <br />
            teklif gelsin.
          </h1>
          <p className="mx-auto mt-6 max-w-md text-[15px] leading-6 text-white/60">
            İhtiyacını yaz. Uygun kişiler fiyat ve süreyle gelsin. Sen seç, iş bitsin.
          </p>
          <div className="mx-auto mt-10 max-w-2xl text-left text-ink">
            <SearchHero dark />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-2 text-sm">
            {[
              { href: "/hizmetler/ev-temizligi", label: "Temizlik" },
              { href: "/hizmetler/tadilat", label: "Tadilat" },
              { href: "/urunler/bisiklet", label: "Bisiklet" },
              { href: "/urunler/elektronik", label: "Elektronik" },
            ].map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className="rounded-full border border-white/15 px-3.5 py-1.5 text-white/70 transition-colors hover:border-accent hover:text-accent"
              >
                {c.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CategoryBand kind="service" title="Hizmetler" items={services} />
      <CategoryBand kind="product" title="Ürünler" items={products} />

      <section className="mx-auto max-w-6xl px-4 py-20">
        <p className="text-[13px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          Üç adım
        </p>
        <h2 className="mt-3 max-w-lg font-display text-4xl md:text-5xl">Nasıl işler</h2>
        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { n: "1", t: "İlanı aç", d: "Hizmet ya da ürün. Ne aradığını yaz, ücretsiz yayınla." },
            { n: "2", t: "Teklifleri gör", d: "Onaylı satıcılar sabit ücretle teklif verir. Puanları açıktır." },
            { n: "3", t: "Seç ve bitir", d: "Kazananı sen seçersin. İş bitince yalnızca satıcı puanlanır." },
          ].map((s) => (
            <li key={s.n} className="rounded-3xl bg-card p-7">
              <span className="grid size-10 place-items-center rounded-full bg-accent font-display text-lg text-ink">
                {s.n}
              </span>
              <h3 className="mt-6 font-display text-2xl">{s.t}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {listings.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-4xl">Açık talepler</h2>
            <Link href="/hizmetler" className="text-sm font-medium underline underline-offset-4">
              Tümü
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {listings.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/ilan/${(l.categories as { slug: string } | null)?.slug ?? "ilan"}/${l.slug}`}
                  className="block rounded-2xl bg-card p-5 transition-transform hover:-translate-y-0.5"
                >
                  <Badge variant={l.kind === "service" ? "service" : "product"}>
                    {l.kind === "service" ? "Hizmet" : "Ürün"}
                  </Badge>
                  <p className="mt-3 font-display text-xl">{l.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {(l.locations as { name: string } | null)?.name} · {l.offer_count} teklif
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function CategoryBand({
  kind,
  title,
  items,
}: {
  kind: ListingKind;
  title: string;
  items: { name: string; slug: string; hint: string; Icon: LucideIcon }[];
}) {
  const href = `/${KIND_PATHS[kind]}`;
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex items-end justify-between gap-4">
        <h2 className="font-display text-4xl md:text-5xl">{title}</h2>
        <Link href={href} className="text-sm font-medium underline underline-offset-4">
          Tümü
        </Link>
      </div>
      <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((c) => (
          <li key={c.slug}>
            <Link
              href={`${href}/${c.slug}`}
              className="group flex h-full flex-col rounded-3xl bg-card p-5 transition-colors hover:bg-ink hover:text-white"
            >
              <c.Icon className="size-6 stroke-[1.5] text-muted-foreground group-hover:text-accent" />
              <p className="mt-6 font-display text-xl">{c.name}</p>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground group-hover:text-white/55">
                {c.hint}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

import Link from "next/link";
import type { Metadata } from "next";
import type { LucideIcon } from "lucide-react";
import {
  Baby,
  BadgeCheck,
  Bike,
  Dumbbell,
  FilePlus,
  Flower2,
  GraduationCap,
  Hammer,
  Home,
  Laptop,
  MessagesSquare,
  Sofa,
  Sparkles,
  Truck,
  Wrench,
} from "lucide-react";
import { KIND_PATHS, type ListingKind } from "@ilazim/shared";
import { getCategories, getOpenListings } from "@/lib/data";
import { SearchHero } from "@/components/search-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "iLazım — Ne lazımsa, teklif gelsin",
  description:
    "İhtiyacınızı ilan olarak açın. Onaylı hizmet verenler size teklif sunsun; puanları görün, işi siz seçin.",
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
      <section className="relative overflow-hidden bg-ink text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 right-[-20%] size-[28rem] rounded-full bg-accent/15 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 left-[-10%] size-[22rem] rounded-full bg-white/5 blur-3xl"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 pt-10 pb-14 md:pt-20 md:pb-24 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <p className="text-[12px] font-medium tracking-[0.2em] text-accent uppercase md:text-[13px]">
              Hizmet ve ürün talepleri
            </p>
            <h1 className="mt-4 font-display text-[clamp(2.35rem,9vw,5.1rem)] leading-[0.92]">
              Ne lazımsa,
              <br />
              teklif gelsin.
            </h1>
            <p className="mt-5 max-w-lg text-[15px] leading-7 text-white/65 md:text-base">
              İhtiyacınızı ilan olarak açın. Onaylı hizmet verenler fiyat ve süreyle gelsin; puanları
              ve yorumları görün, işi siz seçin.
            </p>
            <div className="mt-8 max-w-2xl text-left text-ink">
              <SearchHero dark />
            </div>
            <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] md:mx-0 md:flex-wrap md:overflow-visible md:px-0 [&::-webkit-scrollbar]:hidden">
              {[
                { href: "/hizmetler/ev-temizligi", label: "Temizlik" },
                { href: "/hizmetler/tadilat", label: "Tadilat" },
                { href: "/hizmetler/nakliyat", label: "Nakliyat" },
                { href: "/urunler/bisiklet", label: "Bisiklet" },
                { href: "/urunler/elektronik", label: "Elektronik" },
              ].map((c) => (
                <Link
                  key={c.href}
                  href={c.href}
                  className="shrink-0 rounded-full border border-white/15 px-3.5 py-2 text-sm text-white/70 transition-colors hover:border-accent hover:text-accent"
                >
                  {c.label}
                </Link>
              ))}
            </div>
            <dl className="mt-8 grid grid-cols-3 gap-3 border-t border-white/10 pt-6 text-left">
              {[
                { k: "İlan", v: "Ücretsiz" },
                { k: "Hizmet veren", v: "Onaylı" },
                { k: "Teklif ücreti", v: "Sabit" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="text-[11px] tracking-wide text-white/40 uppercase">{s.k}</dt>
                  <dd className="mt-1 font-display text-lg leading-none md:text-xl">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="hidden lg:col-span-5 lg:block">
            <HeroCollage />
          </div>
        </div>
      </section>

      <CategoryBand kind="service" title="Hizmetler" kicker="Eviniz ve işiniz" items={services} />
      <CategoryBand kind="product" title="Ürünler" kicker="Aradığınız parça" items={products} />

      <section className="mx-auto max-w-6xl px-4 py-16 md:py-20">
        <p className="text-[12px] font-medium tracking-[0.2em] text-muted-foreground uppercase md:text-[13px]">
          Üç adım
        </p>
        <h2 className="mt-3 max-w-lg font-display text-[2rem] leading-none md:text-5xl">Nasıl işler</h2>
        <ol className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3 md:gap-6">
          {[
            {
              n: "01",
              Icon: FilePlus,
              t: "İlanı ücretsiz açın",
              d: "Hizmet ya da ürün. Ne aradığınızı yazın; dakikalar içinde yayınlansın.",
            },
            {
              n: "02",
              Icon: MessagesSquare,
              t: "Teklifleri görün",
              d: "Onaylı hizmet verenler sabit ücretle teklif verir. Puanlar ve yorumlar açıktır.",
            },
            {
              n: "03",
              Icon: BadgeCheck,
              t: "Siz seçin, bitsin",
              d: "Kazananı siz belirlersiniz. İş bitince yalnızca hizmet veren puanlanır.",
            },
          ].map((s) => (
            <li key={s.n} className="rounded-3xl bg-card p-6 md:p-7">
              <div className="flex items-center justify-between">
                <span className="grid size-11 place-items-center rounded-2xl bg-ink text-accent">
                  <s.Icon className="size-5" strokeWidth={1.6} />
                </span>
                <span className="font-display text-sm text-muted-foreground">{s.n}</span>
              </div>
              <h3 className="mt-6 font-display text-2xl leading-tight">{s.t}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {listings.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 pb-16 md:pb-20">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-[12px] font-medium tracking-[0.2em] text-muted-foreground uppercase">
                Şimdi açık
              </p>
              <h2 className="mt-2 font-display text-[2rem] leading-none md:text-4xl">Açık talepler</h2>
            </div>
            <Link href="/hizmetler" className="shrink-0 text-sm font-medium underline underline-offset-4">
              Tümü
            </Link>
          </div>
          <ul className="mt-8 grid gap-3 md:grid-cols-2">
            {listings.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/ilan/${(l.categories as { slug: string } | null)?.slug ?? "ilan"}/${l.slug}`}
                  className="block rounded-2xl bg-card p-5 transition-transform active:scale-[0.99] md:hover:-translate-y-0.5"
                >
                  <Badge variant={l.kind === "service" ? "service" : "product"}>
                    {l.kind === "service" ? "Hizmet" : "Ürün"}
                  </Badge>
                  <p className="mt-3 font-display text-xl leading-tight">{l.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {(l.locations as { name: string } | null)?.name} · {l.offer_count} teklif
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="px-4 pb-16 md:pb-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-ink px-6 py-10 text-white md:flex-row md:items-center md:px-12 md:py-14">
          <div>
            <p className="text-[12px] font-medium tracking-[0.2em] text-accent uppercase">Başlayın</p>
            <h2 className="mt-3 max-w-md font-display text-3xl leading-none md:text-4xl">
              İhtiyacınız dursun, teklif size gelsin.
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/55">
              Alıcı için ücretsiz. İlanınız yayına girince onaylı hizmet verenler sizi bulur.
            </p>
          </div>
          <Button asChild variant="saffron" size="lg" className="h-12 rounded-2xl px-7">
            <Link href="/ilan-ac">Ücretsiz ilan aç</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}

function HeroCollage() {
  const tiles: { Icon: LucideIcon; label: string; span?: string }[] = [
    { Icon: Home, label: "Temizlik", span: "col-span-2 row-span-2" },
    { Icon: Hammer, label: "Tadilat" },
    { Icon: Truck, label: "Nakliyat" },
    { Icon: Wrench, label: "Tamirat" },
    { Icon: Sparkles, label: "Bakım" },
  ];
  return (
    <div className="relative mx-auto w-full max-w-md">
      <div className="absolute -inset-4 rounded-[2.5rem] bg-accent/10 blur-2xl" />
      <div className="relative grid grid-cols-4 grid-rows-3 gap-3">
        {tiles.map((t) => (
          <div
            key={t.label}
            className={`flex flex-col justify-between rounded-[1.35rem] border border-white/10 bg-white/5 p-4 backdrop-blur-sm ${t.span ?? "col-span-2"}`}
          >
            <t.Icon className="size-7 text-accent" strokeWidth={1.4} />
            <p className="mt-8 font-display text-lg leading-none">{t.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryBand({
  kind,
  title,
  kicker,
  items,
}: {
  kind: ListingKind;
  title: string;
  kicker: string;
  items: { name: string; slug: string; hint: string; Icon: LucideIcon }[];
}) {
  const href = `/${KIND_PATHS[kind]}`;
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 md:py-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-medium tracking-[0.2em] text-muted-foreground uppercase">{kicker}</p>
          <h2 className="mt-2 font-display text-[2rem] leading-none md:text-5xl">{title}</h2>
        </div>
        <Link href={href} className="shrink-0 text-sm font-medium underline underline-offset-4">
          Tümü
        </Link>
      </div>
      <ul className="-mx-4 mt-7 flex gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] snap-x snap-mandatory md:mx-0 md:grid md:grid-cols-3 md:gap-3 md:overflow-visible md:px-0 md:pb-0 md:snap-none [&::-webkit-scrollbar]:hidden">
        {items.map((c) => (
          <li key={c.slug} className="w-[11.5rem] shrink-0 snap-start md:w-auto">
            <Link
              href={`${href}/${c.slug}`}
              className="group flex h-full min-h-[9.5rem] flex-col rounded-3xl bg-card p-5 transition-colors active:scale-[0.99] md:min-h-0 md:hover:bg-ink md:hover:text-white"
            >
              <span className="grid size-11 place-items-center rounded-2xl bg-ink text-accent group-hover:bg-accent group-hover:text-ink">
                <c.Icon className="size-5" strokeWidth={1.6} />
              </span>
              <p className="mt-5 font-display text-xl leading-tight">{c.name}</p>
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

import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="font-display text-2xl">iLazım</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            İhtiyacını yaz, uygun kişiler teklif etsin. Hizmet ve ürün aynı yerde.
          </p>
        </div>
        <div className="space-y-2 text-sm md:col-span-3">
          <p className="text-xs font-medium tracking-wide uppercase">Keşfet</p>
          <Link className="block text-muted-foreground hover:text-foreground" href="/hizmetler">
            Hizmetler
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/urunler">
            Ürünler
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/kayit?next=/satici/onboarding">
            Satıcı ol
          </Link>
        </div>
        <div className="space-y-2 text-sm md:col-span-3">
          <p className="text-xs font-medium tracking-wide uppercase">Yasal</p>
          <Link className="block text-muted-foreground hover:text-foreground" href="/kvkk">
            KVKK
          </Link>
          <Link className="block text-muted-foreground hover:text-foreground" href="/sartlar">
            Kullanım koşulları
          </Link>
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { getProfile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions";

export async function SiteHeader() {
  const profile = await getProfile();
  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.25rem] max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid size-8 place-items-center rounded-lg bg-ink text-[11px] font-bold text-accent">
            iL
          </span>
          <span className="font-display text-[1.35rem] leading-none">iLazım</span>
        </Link>
        <nav className="hidden items-center gap-8 text-[13px] font-medium md:flex">
          <Link href="/hizmetler" className="transition-opacity hover:opacity-60">
            Hizmetler
          </Link>
          <Link href="/urunler" className="transition-opacity hover:opacity-60">
            Ürünler
          </Link>
          <Link href="/nasil-calisir" className="transition-opacity hover:opacity-60">
            Nasıl çalışır
          </Link>
          {profile && (
            <Link href="/mesajlar" className="transition-opacity hover:opacity-60">
              Mesajlar
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {profile ? (
            <>
              {profile.role === "admin" && (
                <Button asChild variant="ghost" size="sm">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              {(profile.role === "seller" || profile.role === "admin") && (
                <>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/satici/ilanlar">Açık işler</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/satici/hizmetlerim">Hizmetlerim</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/satici">Satıcı</Link>
                  </Button>
                </>
              )}
              <Button asChild variant="ghost" size="sm">
                <Link href="/hesabim">Hesabım</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/ilan-ac">İlan aç</Link>
              </Button>
              <form action={signOutAction}>
                <Button type="submit" variant="ghost" size="sm">
                  Çıkış
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/giris">Giriş</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href="/kayit">Kayıt</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/ilan-ac">İlan aç</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

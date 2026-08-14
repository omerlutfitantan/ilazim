import Link from "next/link";
import { getProfile } from "@/lib/data";
import { getDesk, canUseSellerDesk } from "@/lib/desk";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/actions";
import { UserAvatar } from "@/components/ui/avatar";

export async function SiteHeader() {
  const profile = await getProfile();
  const desk = await getDesk(profile);
  const sellerDesk = Boolean(profile && desk === "seller" && canUseSellerDesk(profile));

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-background/90 pt-[env(safe-area-inset-top,0px)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 md:h-[4.25rem]">
        <BrandMark className="min-w-0" wordmarkClassName="text-[1.2rem] md:text-[1.35rem]" />
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
        <div className="flex shrink-0 items-center gap-1.5 md:gap-2">
          {profile ? (
            <>
              {profile.role === "admin" && (
                <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              {sellerDesk ? (
                <>
                  <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                    <Link href="/satici/tekliflerim">Tekliflerim</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                    <Link href="/satici/ilanlar">Açık işler</Link>
                  </Button>
                </>
              ) : (
                <Button asChild size="sm" className="hidden md:inline-flex">
                  <Link href="/ilan-ac">İlan aç</Link>
                </Button>
              )}
              <Button asChild variant="ghost" size="sm" className="px-1.5 md:px-3">
                <Link href="/hesabim" className="flex items-center gap-2">
                  <UserAvatar src={profile.avatar_url} name={profile.display_name} className="size-7 text-[10px]" />
                  <span className="hidden md:inline">Hesabım</span>
                </Link>
              </Button>
              <form action={signOutAction} className="hidden md:block">
                <Button type="submit" variant="ghost" size="sm">
                  Çıkış
                </Button>
              </form>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link href="/giris">Giriş</Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
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

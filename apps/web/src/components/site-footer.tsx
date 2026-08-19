import type { ReactNode } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ConsentSettingsButton } from "@/components/cookie-banner";

const SUPPORT_EMAIL = "destek@talepik.com";

export function SiteFooter() {
  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <BrandMark wordmarkClassName="text-2xl" />
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">
              Talepik, hizmet ve ürün ihtiyaçlarınızı ilan olarak paylaştığınız bir talepler
              pazaryeridir. Onaylı hizmet verenler size teklif sunar; puanları ve yorumları
              karşılaştırır, işi siz seçersiniz.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium hover:opacity-70"
            >
              <Mail className="size-4" />
              {SUPPORT_EMAIL}
            </a>
            <p className="mt-1 text-xs text-muted-foreground">Destek hattımız e-posta üzerindendir.</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-4">
            <FooterCol title="Keşfet">
              <FooterLink href="/hizmetler">Hizmetler</FooterLink>
              <FooterLink href="/urunler">Ürünler</FooterLink>
              <FooterLink href="/nasil-calisir">Nasıl çalışır</FooterLink>
            </FooterCol>
            <FooterCol title="Hesap">
              <FooterLink href="/kayit">Kayıt ol</FooterLink>
              <FooterLink href="/giris">Giriş</FooterLink>
              <FooterLink href="/ilan-ac">İlan aç</FooterLink>
            </FooterCol>
            <FooterCol title="Yasal">
              <FooterLink href="/kvkk">KVKK</FooterLink>
              <FooterLink href="/sartlar">Kullanım koşulları</FooterLink>
              <FooterLink href="/cerez">Çerez politikası</FooterLink>
              <ConsentSettingsButton className="block text-left text-muted-foreground transition-colors hover:text-foreground" />
            </FooterCol>
          </div>

          <div className="lg:col-span-3">
            <p className="text-xs font-medium tracking-wide uppercase">Mobil</p>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Uygulamamız çok yakında hizmetinizde.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <StoreBadge store="ios" />
              <StoreBadge store="android" />
            </div>
          </div>
        </div>

        <p className="mt-14 border-t border-border pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Talepik. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2 text-sm">
      <p className="text-xs font-medium tracking-wide uppercase">{title}</p>
      {children}
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link className="block text-muted-foreground transition-colors hover:text-foreground" href={href}>
      {children}
    </Link>
  );
}

function StoreBadge({ store }: { store: "ios" | "android" }) {
  const ios = store === "ios";
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white">
      {ios ? <AppleMark /> : <AndroidMark />}
      <div className="min-w-0">
        <p className="text-[10px] tracking-wide text-white/55 uppercase">Çok yakında</p>
        <p className="text-sm font-medium leading-tight">{ios ? "App Store" : "Google Play"}</p>
      </div>
    </div>
  );
}

function AppleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 shrink-0 fill-current" aria-hidden>
      <path d="M16.7 12.6c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.5-1.6-3-1.6-1.3-.1-2.5.7-3.1.7s-1.6-.7-2.7-.7c-1.4 0-2.6.8-3.3 2-.1.2-1.4 3.8.9 6.3.8 1.2 1.8 2.5 3.1 2.4 1.2-.1 1.7-.8 3.2-.8s1.9.8 3.2.8c1.3 0 2.2-1.2 3-2.4.9-1.3 1.3-2.6 1.3-2.6s-2.4-.9-2.4-3.9zM14.8 6.4c.7-.8 1.1-1.9 1-3-.9.1-2.1.6-2.8 1.4-.6.7-1.2 1.9-1 3 1 .1 2.1-.5 2.8-1.4z" />
    </svg>
  );
}

function AndroidMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-7 shrink-0 fill-current" aria-hidden>
      <path d="M6.2 9.2a.9.9 0 0 1 .9.9v5.3a.9.9 0 1 1-1.8 0V10a.9.9 0 0 1 .9-.8zm11.6 0a.9.9 0 0 1 .9.9v5.3a.9.9 0 1 1-1.8 0V10a.9.9 0 0 1 .9-.9zM8.4 8.4h7.2c.7 0 1.3.6 1.3 1.3v7.2c0 .9-.7 1.6-1.6 1.6h-.4v2.1a.9.9 0 1 1-1.8 0v-2.1H11v2.1a.9.9 0 1 1-1.8 0v-2.1h-.5c-.9 0-1.6-.7-1.6-1.6V9.7c0-.7.6-1.3 1.3-1.3zm.8-3.1 1-1.8a.4.4 0 0 1 .7.3L10.1 5c.6-.2 1.2-.3 1.9-.3s1.3.1 1.9.3l.2-1.2a.4.4 0 0 1 .7-.3l1 1.8A5.8 5.8 0 0 1 9.2 5.3zM10 7.1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm4 0a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
    </svg>
  );
}

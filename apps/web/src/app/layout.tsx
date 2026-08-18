import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { CookieBanner } from "@/components/cookie-banner";
import { WelcomePoster } from "@/components/welcome-poster";
import { AnalyticsScripts } from "@/components/analytics-scripts";
import { AuthHashHandler } from "@/components/auth-hash-handler";
import { getProfile } from "@/lib/data";
import { getDesk, canUseSellerDesk } from "@/lib/desk";
import { CONSENT_COOKIE, parseConsent } from "@/lib/consent";
import { getPublicSiteTags } from "@/lib/integrations";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const syne = localFont({
  src: "../fonts/Syne-wght.ttf",
  variable: "--font-syne",
  weight: "600 800",
  display: "swap",
});

const SITE_TITLE = "iLazım — Ne lazımsa, teklif gelsin";
const SITE_DESCRIPTION =
  "Hizmet ve ürün ihtiyaçlarınızı ilan açın. Onaylı hizmet verenler sabit teklif ücretiyle size gelsin. Puanları görün, işi siz seçin.";

export async function generateMetadata(): Promise<Metadata> {
  const tags = await getPublicSiteTags();
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: {
      default: SITE_TITLE,
      template: "%s | iLazım",
    },
    description: SITE_DESCRIPTION,
    applicationName: "iLazım",
    appleWebApp: { capable: true, title: "iLazım", statusBarStyle: "default" },
    formatDetection: { telephone: false },
    verification: tags.googleSiteVerification
      ? { google: tags.googleSiteVerification }
      : undefined,
    openGraph: {
      type: "website",
      locale: "tr_TR",
      siteName: "iLazım",
      title: SITE_TITLE,
      description: "Hizmet veya ürün ihtiyacınızı yayınlayın; teklifler size gelsin.",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0C0C0C",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const profile = await getProfile();
  const desk = await getDesk(profile);
  const sellerDesk = Boolean(profile && desk === "seller" && canUseSellerDesk(profile));
  const jar = await cookies();
  const consent = parseConsent(jar.get(CONSENT_COOKIE)?.value);
  const welcomeSeen = jar.get("ilazim_welcome")?.value === "1";
  const tags = await getPublicSiteTags();

  return (
    <html
      lang="tr"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <MobileTabBar authed={Boolean(profile)} sellerDesk={sellerDesk} />
        <CookieBanner initial={consent} />
        <WelcomePoster show={Boolean(consent) && !welcomeSeen} />
        <AnalyticsScripts
          gtmId={tags.gtmContainerId}
          gaId={tags.gaMeasurementId}
          adsId={tags.googleAdsId}
          initialConsent={consent}
        />
        <AuthHashHandler />
        <Toaster />
      </body>
    </html>
  );
}

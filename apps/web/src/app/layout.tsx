import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { WelcomePoster } from "@/components/welcome-poster";
import { getProfile } from "@/lib/data";
import { getDesk, canUseSellerDesk } from "@/lib/desk";
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "iLazım — Ne lazımsa, teklif gelsin",
    template: "%s | iLazım",
  },
  description:
    "Hizmet ve ürün ihtiyaçlarınızı ilan açın. Onaylı hizmet verenler sabit teklif ücretiyle size gelsin. Puanları görün, işi siz seçin.",
  applicationName: "iLazım",
  appleWebApp: { capable: true, title: "iLazım", statusBarStyle: "default" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "iLazım",
    title: "iLazım — Ne lazımsa, teklif gelsin",
    description:
      "Hizmet veya ürün ihtiyacınızı yayınlayın; teklifler size gelsin.",
  },
};

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
  const welcomeSeen = (await cookies()).get("ilazim_welcome")?.value === "1";

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
        <WelcomePoster show={!welcomeSeen} />
        <Toaster />
      </body>
    </html>
  );
}

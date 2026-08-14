import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import localFont from "next/font/local";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
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
    "Hizmet ve ürün taleplerinizi ilan açın. Onaylı satıcılar sabit teklif ücretiyle size teklif versin. Puanları görün, işi bitirin.",
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
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}

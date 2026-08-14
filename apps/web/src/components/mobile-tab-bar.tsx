"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, Plus, MessageCircle, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileTabBar({
  authed,
  sellerDesk,
}: {
  authed: boolean;
  sellerDesk: boolean;
}) {
  const path = usePathname();
  if (path.startsWith("/admin")) return null;

  const items = [
    { href: "/", label: "Ana", Icon: Home, match: (p: string) => p === "/" },
    sellerDesk
      ? {
          href: "/satici/ilanlar",
          label: "İşler",
          Icon: Search,
          match: (p: string) => p.startsWith("/satici"),
        }
      : {
          href: "/hizmetler",
          label: "Keşfet",
          Icon: Search,
          match: (p: string) => p.startsWith("/hizmetler") || p.startsWith("/urunler"),
        },
    {
      href: "/ilan-ac",
      label: "İlan",
      Icon: Plus,
      match: (p: string) => p.startsWith("/ilan-ac"),
      primary: true,
    },
    {
      href: authed ? "/mesajlar" : "/giris",
      label: "Mesaj",
      Icon: MessageCircle,
      match: (p: string) => p.startsWith("/mesajlar"),
    },
    {
      href: authed ? "/hesabim" : "/giris",
      label: authed ? "Hesap" : "Giriş",
      Icon: UserRound,
      match: (p: string) => p.startsWith("/hesabim"),
    },
  ];

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t border-black/8 bg-background/95 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Ana menü"
    >
      <ul className="mx-auto grid h-[4.25rem] max-w-lg grid-cols-5 px-1">
        {items.map((item) => {
          const on = item.match(path);
          return (
            <li key={item.label} className="min-w-0">
              <Link
                href={item.href}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
                  on ? "text-foreground" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center rounded-2xl transition-colors",
                    item.primary
                      ? "-mt-3 size-11 bg-accent text-ink shadow-[0_8px_20px_-8px_rgba(200,240,75,0.9)]"
                      : "size-8",
                    on && !item.primary && "text-ink",
                  )}
                >
                  <item.Icon className="size-5" strokeWidth={1.75} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

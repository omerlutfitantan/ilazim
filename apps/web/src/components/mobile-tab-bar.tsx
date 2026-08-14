"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardPlus, Home, MessageCircle, Plus, Search, Store, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileTabBar({
  authed,
  sellerDesk,
}: {
  authed: boolean;
  sellerDesk: boolean;
}) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [path]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  if (path.startsWith("/admin")) return null;

  const sellHref = authed ? "/satici/onboarding" : "/kayit?next=/satici/onboarding";

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
  ] as const;

  const left = items.slice(0, 2);
  const right = items.slice(2);

  return (
    <>
      <button
        type="button"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        className={cn(
          "fixed inset-0 z-40 bg-ink/40 backdrop-blur-[2px] transition-opacity duration-300 md:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
      />
      <nav
        className="fixed inset-x-0 bottom-0 z-50 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        aria-label="Ana menü"
      >
        <div className="border-t border-black/8 bg-background/95 backdrop-blur-xl">
          <div
            className={cn(
              "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-out",
              open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="min-h-0">
              <div className="mx-auto grid max-w-lg grid-cols-2 gap-2 px-3 pt-3 pb-1">
                <ComposeLink
                  href="/ilan-ac"
                  Icon={ClipboardPlus}
                  title="İlan aç"
                  hint="İhtiyacını yaz, teklif gelsin"
                />
                <ComposeLink
                  href={sellHref}
                  Icon={Store}
                  title="Hizmet ver / ürün sat"
                  hint="Onaylı hesapla teklif ver"
                />
              </div>
            </div>
          </div>
          <ul className="mx-auto grid h-[4.25rem] max-w-lg grid-cols-5 px-1">
            {left.map((item) => (
              <TabItem key={item.label} {...item} path={path} />
            ))}
            <li className="min-w-0">
              <button
                type="button"
                aria-expanded={open}
                aria-label={open ? "Kapat" : "iLazım menüsü"}
                onClick={() => setOpen((v) => !v)}
                className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium"
              >
                <span
                  className={cn(
                    "grid size-11 -mt-3 place-items-center rounded-2xl bg-accent text-ink shadow-[0_8px_20px_-8px_rgba(200,240,75,0.9)] transition-transform duration-300 ease-out",
                    open && "rotate-45",
                  )}
                >
                  <Plus className="size-5" strokeWidth={2} />
                </span>
                <span className="font-display text-[10px] leading-none tracking-tight">iLazım</span>
              </button>
            </li>
            {right.map((item) => (
              <TabItem key={item.label} {...item} path={path} />
            ))}
          </ul>
        </div>
      </nav>
    </>
  );
}

function TabItem({
  href,
  label,
  Icon,
  match,
  path,
}: {
  href: string;
  label: string;
  Icon: typeof Home;
  match: (p: string) => boolean;
  path: string;
}) {
  const on = match(path);
  return (
    <li className="min-w-0">
      <Link
        href={href}
        className={cn(
          "flex h-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium",
          on ? "text-foreground" : "text-muted-foreground",
        )}
      >
        <span className={cn("grid size-8 place-items-center", on && "text-ink")}>
          <Icon className="size-5" strokeWidth={1.75} />
        </span>
        {label}
      </Link>
    </li>
  );
}

function ComposeLink({
  href,
  Icon,
  title,
  hint,
}: {
  href: string;
  Icon: typeof ClipboardPlus;
  title: string;
  hint: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-[4.75rem] flex-col justify-center rounded-2xl bg-ink px-3 py-3 text-white transition-transform active:scale-[0.98]"
    >
      <Icon className="size-5 text-accent" strokeWidth={1.7} />
      <span className="mt-2 font-display text-sm leading-tight">{title}</span>
      <span className="mt-0.5 text-[10px] leading-snug text-white/50">{hint}</span>
    </Link>
  );
}

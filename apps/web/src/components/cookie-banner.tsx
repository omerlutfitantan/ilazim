"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  allowsPreferences,
  clearClientCookie,
  CONSENT_COOKIE,
  CONSENT_SAVED_EVENT,
  DESK_COOKIE_NAME,
  OPEN_CONSENT_EVENT,
  WELCOME_COOKIE,
  writeClientCookie,
  type ConsentChoice,
} from "@/lib/consent";
import { LISTING_DRAFT_KEY } from "@/lib/listing-draft";

export function openConsentSettings() {
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}

export function CookieBanner({ initial }: { initial: ConsentChoice | null }) {
  const path = usePathname();
  const [open, setOpen] = useState(!initial);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, onOpen);
  }, []);

  if (path.startsWith("/admin")) return null;

  const legal = path === "/cerez" || path === "/kvkk" || path === "/sartlar";
  const blocking = open && !legal;

  function save(next: ConsentChoice) {
    writeClientCookie(CONSENT_COOKIE, next);
    if (!allowsPreferences(next)) {
      clearClientCookie(WELCOME_COOKIE);
      clearClientCookie(DESK_COOKIE_NAME);
      try {
        localStorage.removeItem(LISTING_DRAFT_KEY);
      } catch {
        /* ignore */
      }
    }
    setOpen(false);
    window.dispatchEvent(new Event(CONSENT_SAVED_EVENT));
  }

  if (!open) return null;

  return (
    <>
      {blocking && (
        <div className="fixed inset-0 z-[89] bg-ink/50 backdrop-blur-[2px] md:bg-ink/40" aria-hidden />
      )}
      <div
        className="fixed inset-x-0 bottom-0 z-[90] px-3 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:px-4 md:pb-6"
        role="dialog"
        aria-labelledby="cookie-title"
        aria-modal={blocking}
      >
        <div className="mx-auto max-w-3xl overflow-hidden rounded-[1.5rem] bg-ink text-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.5)]">
          <div className="relative px-5 py-5 md:px-7 md:py-6">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-12 right-[-10%] size-36 rounded-full bg-accent/25 blur-3xl"
            />
            <div className="relative">
              <p className="text-[11px] font-medium tracking-[0.18em] text-accent uppercase">Çerezler</p>
              <h2 id="cookie-title" className="mt-2 font-display text-2xl leading-tight">
                Deneyimin için çerezleri kabul et
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-white/70">
                Zorunlu çerezler oturum ve güvenlik içindir. Tercih çerezleri afiş, masa seçimi ve benzeri
                ayarlar içindir. Ayrıntılar{" "}
                <Link href="/cerez" className="text-accent underline underline-offset-4">
                  çerez politikasında
                </Link>
                .
              </p>
              <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                <Button
                  type="button"
                  variant="saffron"
                  className="h-12 flex-1 rounded-2xl"
                  onClick={() => save("all")}
                >
                  Kabul et
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 flex-1 rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10"
                  onClick={() => save("necessary")}
                >
                  Sadece zorunlu
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function ConsentSettingsButton({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => openConsentSettings()}>
      Çerez ayarları
    </button>
  );
}

export function CookiePageCta() {
  return (
    <Button type="button" variant="saffron" className="mt-8 rounded-2xl" onClick={() => openConsentSettings()}>
      Çerez tercihini değiştir
    </Button>
  );
}

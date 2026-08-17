"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  allowsPreferences,
  CONSENT_SAVED_EVENT,
  readClientConsent,
  WELCOME_COOKIE,
  writeClientCookie,
} from "@/lib/consent";

function dismissedThisSession() {
  try {
    return sessionStorage.getItem(WELCOME_COOKIE) === "1";
  } catch {
    return false;
  }
}

function persistDismiss() {
  try {
    sessionStorage.setItem(WELCOME_COOKIE, "1");
  } catch {
    /* ignore */
  }
  if (allowsPreferences(readClientConsent())) {
    writeClientCookie(WELCOME_COOKIE, "1");
  }
}

export function WelcomePoster({ show }: { show: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (dismissedThisSession()) return;
    if (show) setOpen(true);
  }, [show]);

  useEffect(() => {
    function onConsent() {
      if (dismissedThisSession()) return;
      setOpen(true);
    }
    window.addEventListener(CONSENT_SAVED_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_SAVED_EVENT, onConsent);
  }, []);

  if (
    path.startsWith("/admin") ||
    path === "/cerez" ||
    path === "/kvkk" ||
    path === "/sartlar"
  ) {
    return null;
  }

  function close() {
    persistDismiss();
    setOpen(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next: boolean) => {
        if (!next) close();
      }}
    >
      <DialogContent
        aria-describedby={undefined}
        className="overflow-hidden border-0 bg-ink p-0 text-white shadow-[0_30px_80px_-24px_rgba(0,0,0,0.55)] [&>button]:text-white/70 [&>button]:hover:text-white"
      >
        <div className="relative overflow-hidden px-6 pt-8 pb-7 md:px-9 md:pt-10 md:pb-9">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-20 right-[-12%] size-64 rounded-full bg-accent/35 blur-3xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-16 left-[-20%] size-48 rounded-full bg-accent/15 blur-3xl"
          />
          <p
            aria-hidden
            className="pointer-events-none absolute -right-2 -bottom-8 font-display text-[11rem] leading-none text-accent/25"
          >
            3
          </p>
          <div className="relative">
            <p className="inline-flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-lg bg-accent text-[11px] font-bold text-ink">
                iL
              </span>
              <span className="font-display text-xl leading-none">iLazım</span>
            </p>
            <p className="mt-6 ml-3 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold tracking-wide text-ink uppercase md:ml-5">
              <Sparkles className="size-3.5" strokeWidth={2.2} />
              Yeni hizmet verenlere
            </p>
            <DialogTitle className="mt-4 max-w-[17rem] font-display text-[2.25rem] leading-[0.9] md:max-w-none md:text-[2.75rem]">
              İlk 3 teklif tamamen ücretsiz.
            </DialogTitle>
            <p className="mt-4 max-w-sm text-[15px] leading-7 text-white/80">
              Kaydol, hesabını onayla ve teklif vermeye başla. Üstelik ilk 3 teklifin bizden! Hemen teklif
              vermeye başla!
            </p>
            <Button asChild variant="saffron" size="lg" className="mt-8 w-full rounded-2xl">
              <Link href="/kayit?next=/satici/onboarding" onClick={close}>
                Hizmet vermeye başla
              </Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

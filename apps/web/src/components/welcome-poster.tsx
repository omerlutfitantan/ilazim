"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const COOKIE = "ilazim_welcome";

function dismissCookie() {
  document.cookie = `${COOKIE}=1; Path=/; Max-Age=31536000; SameSite=Lax`;
}

export function WelcomePoster({ show }: { show: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(show);

  if (path.startsWith("/admin") || !show) return null;

  function close() {
    dismissCookie();
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
            className="pointer-events-none absolute -top-16 right-[-20%] size-56 rounded-full bg-accent/20 blur-3xl"
          />
          <p
            aria-hidden
            className="pointer-events-none absolute -right-3 -bottom-10 font-display text-[11rem] leading-none text-accent/15"
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
            <p className="mt-6 text-[11px] font-medium tracking-[0.2em] text-accent uppercase">
              Yeni hizmet verenlere
            </p>
            <DialogTitle className="mt-3 max-w-[16rem] font-display text-[2.15rem] leading-[0.92] md:max-w-none md:text-4xl">
              İlk 3 teklif tamamen ücretsiz.
            </DialogTitle>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/65">
              Yeni kayıt olan hizmet verenlerin ilk üç teklifi ücretsizdir. Sonrasında teklif ücreti
              sabittir; yüzde yoktur.
            </p>
            <div className="mt-8 flex flex-col gap-2">
              <Button type="button" variant="saffron" className="h-12 w-full rounded-2xl" onClick={close}>
                Anladım, devam et
              </Button>
              <Button asChild variant="outline" className="h-12 w-full rounded-2xl border-white/20 bg-transparent text-white hover:bg-white/10">
                <Link href="/kayit?next=/satici/onboarding" onClick={close}>
                  Hizmet vermeye başla
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

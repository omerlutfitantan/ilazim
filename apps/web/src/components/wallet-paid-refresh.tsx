"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Whop redirect sonrası webhook gecikirse bakiyeyi birkaç kez yeniler. */
export function WalletPaidRefresh({ paid }: { paid?: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!paid) return;
    let ticks = 0;
    const id = window.setInterval(() => {
      ticks += 1;
      router.refresh();
      if (ticks >= 6) window.clearInterval(id);
    }, 2500);
    return () => window.clearInterval(id);
  }, [paid, router]);

  if (!paid) return null;

  return (
    <p className="mt-4 rounded-2xl bg-teal-soft p-4 text-sm">
      Ödeme alındı. Bakiye birkaç saniye içinde güncellenir…
    </p>
  );
}

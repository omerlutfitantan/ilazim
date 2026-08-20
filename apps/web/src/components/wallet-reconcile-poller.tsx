"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Shopier OSB gecikirse veya gelmezse bekleyen yüklemeleri periyodik kontrol eder. */
export function WalletReconcilePoller() {
  const router = useRouter();

  useEffect(() => {
    let active = true;
    let ticks = 0;
    const maxTicks = 18;

    const tick = async () => {
      if (!active || document.visibilityState === "hidden") return;
      ticks += 1;
      try {
        const res = await fetch("/api/payments/shopier/reconcile", { method: "POST" });
        if (!res.ok) return;
        const data = (await res.json()) as { applied?: number };
        if (data.applied && data.applied > 0) router.refresh();
      } catch {
        // sessiz — sayfa yükünde zaten reconcile çalışır
      }
    };

    const id = window.setInterval(() => {
      if (ticks >= maxTicks) {
        window.clearInterval(id);
        return;
      }
      void tick();
    }, 10_000);

    const onVisible = () => {
      if (document.visibilityState === "visible") void tick();
    };
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      active = false;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [router]);

  return null;
}

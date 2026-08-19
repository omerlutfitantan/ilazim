"use client";

import { useTransition } from "react";
import { upgradeToSellerAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function UpgradeToSellerButton() {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <div className="mt-10 rounded-2xl border border-border bg-muted/40 p-6">
      <h2 className="font-display text-xl">Hizmet vermeye başla</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Hesabınızı satıcıya yükseltin, ilan tekliflerini görebilin ve teklif verin. Cüzdanınız
        otomatik oluşturulur.
      </p>
      <Button
        className="mt-4"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await upgradeToSellerAction();
            if (r.error) {
              toast.error(r.error);
            } else {
              toast.success("Satıcı hesabınız aktif edildi!");
              router.refresh();
            }
          })
        }
      >
        {pending ? "Aktif ediliyor…" : "Satıcı hesabı aç"}
      </Button>
    </div>
  );
}

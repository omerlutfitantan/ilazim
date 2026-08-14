"use client";

import { useState, useTransition } from "react";
import { Phone } from "lucide-react";
import { telHref } from "@ilazim/shared";
import { revealContactAction } from "@/actions";

export function RevealContact({ listingId, shared }: { listingId: string; shared: boolean }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!shared) {
    return <p className="text-sm text-muted-foreground">İletişim bilgileri gizli</p>;
  }

  if (phone) {
    return (
      <a
        href={telHref(phone)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
      >
        <Phone className="size-4" />
        {phone}
      </a>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        className="text-sm font-medium text-primary underline underline-offset-4 disabled:opacity-50"
        onClick={() =>
          start(async () => {
            const r = await revealContactAction(listingId);
            if (r.error) setError(r.error);
            else if (r.phone) setPhone(r.phone);
          })
        }
      >
        {pending ? "Açılıyor…" : "İletişim bilgilerini gör"}
      </button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

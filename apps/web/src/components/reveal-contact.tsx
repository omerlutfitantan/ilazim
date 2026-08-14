"use client";

import { useState, useTransition } from "react";
import { Phone } from "lucide-react";
import { telHref } from "@ilazim/shared";
import { revealContactAction } from "@/actions";
import { Button } from "@/components/ui/button";

export function RevealContact({ listingId }: { listingId: string }) {
  const [phone, setPhone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (phone) {
    return (
      <a
        href={telHref(phone)}
        className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-sm font-semibold text-ink"
      >
        <Phone className="size-4" />
        {phone}
      </a>
    );
  }

  return (
    <div>
      <Button
        type="button"
        variant="saffron"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await revealContactAction(listingId);
            if (r.error) setError(r.error);
            else if (r.phone) setPhone(r.phone);
          })
        }
      >
        {pending ? "Açılıyor…" : "İletişimi gör"}
      </Button>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
}

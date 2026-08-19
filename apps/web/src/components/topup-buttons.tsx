"use client";

import { createTopupAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { formatTry } from "@ilazim/shared";
import { useTransition } from "react";
import { toast } from "sonner";

export function TopupButtons({ amounts }: { amounts: number[] }) {
  const [pending, start] = useTransition();
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {amounts.map((a) => (
        <Button
          key={a}
          type="button"
          variant="outline"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await createTopupAction(a);
              if (r.redirectUrl) {
                window.location.href = r.redirectUrl;
                return;
              }
              if (r.error) toast.message(r.error);
            })
          }
        >
          {formatTry(a)}
        </Button>
      ))}
    </div>
  );
}

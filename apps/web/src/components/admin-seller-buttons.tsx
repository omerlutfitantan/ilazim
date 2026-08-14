"use client";

import { reviewSellerAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

export function SellerReviewButtons({ userId }: { userId: string }) {
  const [pending, start] = useTransition();
  return (
    <div className="flex gap-2">
      <Button
        size="sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await reviewSellerAction(userId, true);
            if (r.error) toast.error(r.error);
            else toast.success("Onaylandı");
          })
        }
      >
        Onayla
      </Button>
      <Button
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await reviewSellerAction(userId, false);
            if (r.error) toast.error(r.error);
          })
        }
      >
        Reddet
      </Button>
    </div>
  );
}

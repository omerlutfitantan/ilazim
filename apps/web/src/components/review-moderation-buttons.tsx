"use client";

import { approveReviewAction, deleteReviewAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

export function ReviewModerationButtons({
  reviewId,
  pending,
}: {
  reviewId: string;
  pending: boolean;
}) {
  const [busy, start] = useTransition();
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {pending && (
        <Button
          size="sm"
          disabled={busy}
          onClick={() =>
            start(async () => {
              const r = await approveReviewAction(reviewId);
              if (r.error) toast.error(r.error);
              else toast.success("Yorum onaylandı");
            })
          }
        >
          Onayla
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        disabled={busy}
        onClick={() =>
          start(async () => {
            const r = await deleteReviewAction(reviewId);
            if (r.error) toast.error(r.error);
            else toast.success(pending ? "Sahte yorum silindi" : "Yorum silindi");
          })
        }
      >
        Sahte / sil
      </Button>
    </div>
  );
}

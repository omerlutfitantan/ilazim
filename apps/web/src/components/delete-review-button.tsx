"use client";

import { deleteReviewAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

export function DeleteReviewButton({ reviewId }: { reviewId: string }) {
  const [pending, start] = useTransition();
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await deleteReviewAction(reviewId);
          if (r.error) toast.error(r.error);
          else toast.success("Yorum silindi");
        })
      }
    >
      Sahte / sil
    </Button>
  );
}

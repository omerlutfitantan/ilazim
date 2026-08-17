"use client";

import { useActionState } from "react";
import { submitReviewAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { StarPicker } from "@/components/star-picker";

export function ReviewForm({ listingId }: { listingId: string }) {
  const [state, action, pending] = useActionState(submitReviewAction, null);
  return (
    <form action={action} className="mt-4 space-y-3 border-t border-border pt-4">
      <input type="hidden" name="listingId" value={listingId} />
      <div className="space-y-2">
        <Label>Seçtiğiniz satıcıyı puanlayın</Label>
        <StarPicker />
      </div>
      <Textarea name="comment" required minLength={8} placeholder="Deneyiminiz" />
      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" size="sm" disabled={pending}>
        Yorumu gönder
      </Button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { submitReviewAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function ReviewForm({ listingId }: { listingId: string }) {
  const [state, action, pending] = useActionState(submitReviewAction, null);
  return (
    <form action={action} className="mt-4 space-y-3 border-t border-border pt-4">
      <input type="hidden" name="listingId" value={listingId} />
      <Label>Seçtiğiniz satıcıyı puanlayın</Label>
      <select
        name="rating"
        required
        className="h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
        defaultValue="5"
      >
        {[5, 4, 3, 2, 1].map((n) => (
          <option key={n} value={n}>
            {n} yıldız
          </option>
        ))}
      </select>
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

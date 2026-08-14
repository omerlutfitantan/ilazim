"use client";

import { useActionState } from "react";
import { placeOfferAction } from "@/actions";
import { HideListingButton } from "@/components/hide-listing-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function OfferForm({
  listingId,
  feeLabel,
}: {
  listingId: string;
  feeLabel: string;
}) {
  const [state, action, pending] = useActionState(placeOfferAction, null);
  return (
    <form action={action} className="mt-4 space-y-3">
      <input type="hidden" name="listingId" value={listingId} />
      <div>
        <Label htmlFor="amount">Teklif tutarı (TL)</Label>
        <Input id="amount" name="amount" type="number" min="1" step="0.01" required className="mt-1" />
      </div>
      <div>
        <Label htmlFor="etaText">Süre / teslim</Label>
        <Input id="etaText" name="etaText" placeholder="Örn. 2 gün, elden teslim" className="mt-1" />
      </div>
      <div>
        <Label htmlFor="message">Mesaj</Label>
        <Textarea id="message" name="message" required minLength={10} className="mt-1" />
      </div>
      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state && "ok" in state && <p className="text-sm text-primary">Teklifiniz gönderildi.</p>}
      <div className="flex items-center gap-2">
        <Button type="submit" disabled={pending}>
          {pending ? "Gönderiliyor…" : `Teklif ver (${feeLabel})`}
        </Button>
        <HideListingButton listingId={listingId} />
      </div>
    </form>
  );
}

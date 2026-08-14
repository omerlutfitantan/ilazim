"use client";

import { useActionState } from "react";
import { createCampaignAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/money-input";

export function CampaignForm() {
  const [state, action, pending] = useActionState(createCampaignAction, null);
  return (
    <form action={action} className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <Label>Ad</Label>
        <Input name="name" required placeholder="İlk 100 satıcı" className="mt-1" />
      </div>
      <div>
        <Label>Ek kredi (TL)</Label>
        <MoneyInput name="creditAmount" defaultValue={50} className="mt-1" />
      </div>
      <div>
        <Label>Teklif indirimi %</Label>
        <Input name="bidFeeDiscountPercent" type="number" defaultValue={50} className="mt-1" />
      </div>
      <div>
        <Label>İndirimli teklif adedi</Label>
        <Input name="discountedOfferCount" type="number" defaultValue={10} className="mt-1" />
      </div>
      <div>
        <Label>Maks. kullanım</Label>
        <Input name="maxRedemptions" type="number" defaultValue={100} className="mt-1" />
      </div>
      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={pending}>
        Kampanya oluştur
      </Button>
    </form>
  );
}

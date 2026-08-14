"use client";

import { useActionState } from "react";
import { updateSettingsAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/money-input";

export function SettingsForm({
  settings,
}: {
  settings: {
    bid_fee_amount: number;
    new_seller_credit_amount: number;
    new_seller_discount_percent: number;
    new_seller_discounted_offer_count: number;
  };
}) {
  const [state, action, pending] = useActionState(updateSettingsAction, null);
  return (
    <form action={action} className="grid max-w-lg gap-4">
      <div>
        <Label>Sabit teklif ücreti (TL)</Label>
        <MoneyInput name="bidFeeAmount" defaultValue={settings.bid_fee_amount} className="mt-1" />
      </div>
      <div>
        <Label>Yeni satıcı kredisi (TL)</Label>
        <MoneyInput name="newSellerCreditAmount" defaultValue={settings.new_seller_credit_amount} className="mt-1" />
      </div>
      <div>
        <Label>Yeni satıcı teklif indirimi %</Label>
        <Input
          name="newSellerDiscountPercent"
          type="number"
          defaultValue={settings.new_seller_discount_percent}
          className="mt-1"
        />
      </div>
      <div>
        <Label>İndirimli teklif adedi</Label>
        <Input
          name="newSellerDiscountedOfferCount"
          type="number"
          defaultValue={settings.new_seller_discounted_offer_count}
          className="mt-1"
        />
      </div>
      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state && "ok" in state && <p className="text-sm text-primary">Kaydedildi.</p>}
      <Button type="submit" disabled={pending}>
        Kaydet
      </Button>
    </form>
  );
}

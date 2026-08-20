"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateSettingsAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/money-input";
import { TopupPresetsField } from "@/components/topup-presets-field";
import { DEFAULT_TOPUP_PRESETS } from "@/lib/topup-presets";

export function SettingsForm({
  settings,
}: {
  settings: {
    bid_fee_amount: number;
    new_seller_welcome_balance: number;
    new_seller_discount_percent: number;
    new_seller_discounted_offer_count: number;
    topup_presets?: number[];
  };
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateSettingsAction, null);

  useEffect(() => {
    if (state && "ok" in state) {
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="grid max-w-lg gap-4">
      <div>
        <Label>Sabit teklif ücreti (TL)</Label>
        <MoneyInput name="bidFeeAmount" defaultValue={settings.bid_fee_amount} className="mt-1" />
      </div>
      <div>
        <Label>Yeni satıcı hoş geldin bakiyesi (TL)</Label>
        <MoneyInput
          name="newSellerWelcomeBalance"
          defaultValue={settings.new_seller_welcome_balance}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Onay sonrası nakit cüzdana eklenir. Ücret 50 TL ise 150 TL = 3 teklif hakkı.
        </p>
      </div>
      <div>
        <Label>Yeni satıcı teklif indirimi %</Label>
        <Input
          name="newSellerDiscountPercent"
          type="number"
          min={0}
          max={100}
          defaultValue={settings.new_seller_discount_percent}
          className="mt-1"
        />
      </div>
      <div>
        <Label>İndirimli teklif adedi</Label>
        <Input
          name="newSellerDiscountedOfferCount"
          type="number"
          min={0}
          defaultValue={settings.new_seller_discounted_offer_count}
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          0 ise yalnızca hoş geldin bakiyesi uygulanır; yüzde indirim de 0 olmalı.
        </p>
      </div>
      <TopupPresetsField
        key={(settings.topup_presets ?? DEFAULT_TOPUP_PRESETS).join("-")}
        presets={settings.topup_presets ?? DEFAULT_TOPUP_PRESETS}
      />
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

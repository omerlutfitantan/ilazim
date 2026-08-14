"use client";

import { useActionState, useState } from "react";
import { sellerOnboardingAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { ServiceCategoryPicker } from "@/components/service-category-picker";
import { CityDistrictFields } from "@/components/city-district-fields";

type Loc = { id: string; name: string; parent_id: string | null; type: string };
type Cat = { id: string; name: string };

export function OnboardingForm({
  cities,
  districts,
  serviceCategories,
  blockedIds = [],
}: {
  cities: Loc[];
  districts: Loc[];
  serviceCategories: Cat[];
  blockedIds?: string[];
}) {
  const [sellerType, setSellerType] = useState("service");
  const [state, action, pending] = useActionState(sellerOnboardingAction, null);

  return (
    <form action={action} className="space-y-4">
      <div>
        <Label>Ne satıyorsunuz?</Label>
        <select
          name="sellerType"
          required
          className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
          value={sellerType}
          onChange={(e) => setSellerType(e.target.value)}
        >
          <option value="service">Hizmet</option>
          <option value="product">Ürün</option>
          <option value="both">Her ikisi</option>
        </select>
      </div>
      {(sellerType === "service" || sellerType === "both") && (
        <ServiceCategoryPicker categories={serviceCategories} blockedIds={blockedIds} />
      )}
      <div>
        <Label htmlFor="headline">Kısa başlık</Label>
        <Input id="headline" name="headline" required minLength={8} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="bio">Hakkında</Label>
        <Textarea id="bio" name="bio" required minLength={20} className="mt-1" />
      </div>
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" name="phone" className="mt-1" />
      </div>
      <CityDistrictFields cities={cities} districts={districts} />
      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      <Button type="submit" disabled={pending}>
        Başvuruyu gönder
      </Button>
    </form>
  );
}

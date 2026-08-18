"use client";

import { useActionState, useEffect, useState } from "react";
import { splitPersonName } from "@ilazim/shared";
import { updateProfileAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CityDistrictFields, type LocOption } from "@/components/city-district-fields";
import { PhoneInput } from "@/components/phone-input";

export function ProfileForm({
  fullName,
  phone,
  bio,
  cityId,
  districtId,
  cities,
  districts,
}: {
  fullName: string | null;
  phone: string | null;
  bio: string | null;
  cityId: string | null;
  districtId: string | null;
  cities: LocOption[];
  districts: LocOption[];
}) {
  const names = splitPersonName(fullName);
  const [state, action, pending] = useActionState(updateProfileAction, null);
  const [selectedCityId, setSelectedCityId] = useState(cityId ?? "");
  const [selectedDistrictId, setSelectedDistrictId] = useState(districtId ?? "");

  useEffect(() => {
    setSelectedCityId(cityId ?? "");
    setSelectedDistrictId(districtId ?? "");
  }, [cityId, districtId]);

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="firstName">Ad</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={names.firstName}
            required
            minLength={2}
            maxLength={40}
            autoComplete="given-name"
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="lastName">Soyad</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={names.lastName}
            required
            minLength={2}
            maxLength={40}
            autoComplete="family-name"
            className="mt-1"
          />
        </div>
      </div>
      <p className="-mt-2 text-xs text-muted-foreground">
        Tekliflerde yalnızca adınız ve soyadınızın baş harfi görünür.
      </p>
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <PhoneInput id="phone" defaultValue={phone} required className="mt-1" />
      </div>
      <input type="hidden" name="cityId" value={selectedCityId} />
      <input type="hidden" name="districtId" value={selectedDistrictId} />
      <CityDistrictFields
        cities={cities}
        districts={districts}
        cityId={selectedCityId}
        districtId={selectedDistrictId}
        onCityChange={(id) => {
          setSelectedCityId(id);
          setSelectedDistrictId("");
        }}
        onDistrictChange={setSelectedDistrictId}
        useFormNames={false}
      />
      <div>
        <Label htmlFor="bio">Hakkında</Label>
        <Textarea id="bio" name="bio" defaultValue={bio ?? ""} className="mt-1 min-h-24" />
      </div>
      {state && "error" in state && state.error && <p className="text-sm text-destructive">{state.error}</p>}
      {state && "ok" in state && <p className="text-sm text-primary">Kaydedildi.</p>}
      <Button type="submit" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </Button>
    </form>
  );
}

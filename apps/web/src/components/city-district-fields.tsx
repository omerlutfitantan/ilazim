"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";

export type LocOption = { id: string; name: string; parent_id: string | null; type: string };

export function CityDistrictFields({
  cities,
  districts,
  defaultCityId = "",
  defaultDistrictId = "",
  required = true,
}: {
  cities: LocOption[];
  districts: LocOption[];
  defaultCityId?: string | null;
  defaultDistrictId?: string | null;
  required?: boolean;
}) {
  const [cityId, setCityId] = useState(defaultCityId ?? "");
  const [districtId, setDistrictId] = useState(defaultDistrictId ?? "");
  const cityDistricts = districts.filter((d) => d.parent_id === cityId);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="cityId">Şehir</Label>
        <select
          id="cityId"
          name="cityId"
          required={required}
          value={cityId}
          onChange={(e) => {
            setCityId(e.target.value);
            setDistrictId("");
          }}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
        >
          <option value="">Seçin</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="districtId">İlçe</Label>
        <select
          id="districtId"
          name="districtId"
          required={required}
          value={districtId}
          disabled={!cityId}
          onChange={(e) => setDistrictId(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm disabled:opacity-60"
        >
          <option value="">{cityId ? "Seçin" : "Önce şehir seçin"}</option>
          {cityDistricts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState } from "react";
import { Label } from "@/components/ui/label";

export type LocOption = { id: string; name: string; parent_id: string | null; type: string };

const trSort = (a: LocOption, b: LocOption) => a.name.localeCompare(b.name, "tr");

export function CityDistrictFields({
  cities,
  districts,
  defaultCityId = "",
  defaultDistrictId = "",
  required = true,
  cityId: controlledCityId,
  districtId: controlledDistrictId,
  onCityChange,
  onDistrictChange,
  useFormNames = true,
}: {
  cities: LocOption[];
  districts: LocOption[];
  defaultCityId?: string | null;
  defaultDistrictId?: string | null;
  required?: boolean;
  cityId?: string;
  districtId?: string;
  onCityChange?: (id: string) => void;
  onDistrictChange?: (id: string) => void;
  useFormNames?: boolean;
}) {
  const [cityId, setCityId] = useState(defaultCityId ?? "");
  const [districtId, setDistrictId] = useState(defaultDistrictId ?? "");

  useEffect(() => {
    setCityId(defaultCityId ?? "");
    setDistrictId(defaultDistrictId ?? "");
  }, [defaultCityId, defaultDistrictId]);

  const currentCityId = controlledCityId ?? cityId;
  const currentDistrictId = controlledDistrictId ?? districtId;

  const sortedCities = useMemo(() => [...cities].sort(trSort), [cities]);
  const cityDistricts = useMemo(
    () => districts.filter((d) => d.parent_id === currentCityId).sort(trSort),
    [districts, currentCityId],
  );

  function changeCity(next: string) {
    if (onCityChange) onCityChange(next);
    else setCityId(next);
    if (onDistrictChange) onDistrictChange("");
    else setDistrictId("");
  }

  function changeDistrict(next: string) {
    if (onDistrictChange) onDistrictChange(next);
    else setDistrictId(next);
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label htmlFor="cityId">Şehir</Label>
        <select
          id="cityId"
          name={useFormNames ? "cityId" : undefined}
          required={required}
          value={currentCityId}
          onChange={(e) => changeCity(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
        >
          <option value="">Seçin</option>
          {sortedCities.map((c) => (
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
          name={useFormNames ? "districtId" : undefined}
          required={required}
          value={currentDistrictId}
          disabled={!currentCityId}
          onChange={(e) => changeDistrict(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm disabled:opacity-60"
        >
          <option value="">{currentCityId ? "Seçin" : "Önce şehir seçin"}</option>
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

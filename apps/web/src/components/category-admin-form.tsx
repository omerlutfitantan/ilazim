"use client";

import { useActionState } from "react";
import { upsertCategoryAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CategoryRow } from "@/lib/database.types";

export function CategoryAdminForm({ initial }: { initial?: CategoryRow }) {
  const [state, action, pending] = useActionState(upsertCategoryAction, null);
  return (
    <form action={action} className="mt-4 grid gap-3 md:grid-cols-2">
      {initial && <input type="hidden" name="id" value={initial.id} />}
      <div>
        <Label>Tür</Label>
        <select
          name="kind"
          defaultValue={initial?.kind ?? "service"}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
        >
          <option value="service">Hizmet</option>
          <option value="product">Ürün</option>
        </select>
      </div>
      <div>
        <Label>Ad</Label>
        <Input name="name" defaultValue={initial?.name} required minLength={2} className="mt-1" />
      </div>
      <div>
        <Label>Sıra</Label>
        <Input name="sortOrder" type="number" defaultValue={initial?.sort_order ?? 0} className="mt-1" />
      </div>
      <label className="flex items-center gap-2 self-end pb-2 text-sm">
        <input type="checkbox" name="isFeatured" defaultChecked={initial?.is_featured} />
        Anasayfada öne çıkar
      </label>
      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive md:col-span-2">{state.error}</p>
      )}
      {state && "ok" in state && (
        <p className="text-sm text-primary md:col-span-2">Kaydedildi. SEO alanları addan üretildi.</p>
      )}
      <div>
        <Button type="submit" size="sm" disabled={pending}>
          {initial ? "Güncelle" : "Ekle"}
        </Button>
      </div>
    </form>
  );
}

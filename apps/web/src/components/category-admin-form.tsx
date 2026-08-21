"use client";

import { useActionState } from "react";
import { upsertCategoryAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
      <div className="md:col-span-2">
        <Label>SEO başlığı</Label>
        <Input
          name="metaTitle"
          defaultValue={initial?.meta_title}
          maxLength={80}
          placeholder="Temizlik | Talepik ile teklif toplayın"
          className="mt-1"
        />
        <p className="mt-1 text-xs text-muted-foreground">Google ve tarayıcı sekmesi. Boş bırakılırsa addan üretilir.</p>
      </div>
      <div className="md:col-span-2">
        <Label>SEO açıklaması / kart metni</Label>
        <Textarea
          name="metaDescription"
          defaultValue={initial?.meta_description}
          maxLength={220}
          placeholder="Temizlik ilanı açın. Onaylı hizmet verenler sabit teklif ücretiyle size fiyat versin."
          className="mt-1 min-h-24"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Anasayfa kategori kartında ve Google açıklamasında görünür.
        </p>
      </div>
      <div className="md:col-span-2">
        <Label>Sayfa başlığı (H1)</Label>
        <Input name="h1" defaultValue={initial?.h1} maxLength={160} className="mt-1" />
      </div>
      <div className="md:col-span-2">
        <Label>Sayfa metni</Label>
        <Textarea name="content" defaultValue={initial?.content} maxLength={2000} className="mt-1" />
      </div>
      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive md:col-span-2">{state.error}</p>
      )}
      {state && "ok" in state && (
        <p className="text-sm text-primary md:col-span-2">Kaydedildi. Kart ve SEO metinleri güncellendi.</p>
      )}
      <div>
        <Button type="submit" size="sm" disabled={pending}>
          {initial ? "Güncelle" : "Ekle"}
        </Button>
      </div>
    </form>
  );
}

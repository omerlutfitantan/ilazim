"use client";

import { useActionState } from "react";
import { setSellerCategoriesAction } from "@/actions";
import { ServiceCategoryPicker } from "@/components/service-category-picker";
import { Button } from "@/components/ui/button";

export function SellerCategoriesForm({
  categories,
  selected,
  blockedIds = [],
}: {
  categories: { id: string; name: string }[];
  selected: string[];
  blockedIds?: string[];
}) {
  const [state, action, pending] = useActionState(setSellerCategoriesAction, null);
  return (
    <form action={action} className="space-y-6">
      <ServiceCategoryPicker
        key={selected.join(",")}
        categories={categories}
        selected={selected}
        blockedIds={blockedIds}
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

"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type Cat = { id: string; name: string };

export function ServiceCategoryPicker({
  categories,
  selected,
  blockedIds = [],
}: {
  categories: Cat[];
  selected?: string[];
  blockedIds?: string[];
}) {
  const [picked, setPicked] = useState(() => new Set(selected ?? []));
  const blocked = new Set(blockedIds);

  function toggle(id: string) {
    if (blocked.has(id)) return;
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">Gösterilecek hizmet yok.</p>;
  }

  return (
    <fieldset>
      <legend className="sr-only">Hizmetlerim</legend>
      {[...picked].map((id) => (
        <input key={id} type="hidden" name="categoryIds" value={id} />
      ))}
      <ul className="grid gap-2 sm:grid-cols-2">
        {categories.map((c) => {
          const locked = blocked.has(c.id);
          const on = picked.has(c.id);
          return (
            <li key={c.id}>
              <button
                type="button"
                disabled={locked}
                onClick={() => toggle(c.id)}
                className={cn(
                  "w-full rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                  locked && "cursor-not-allowed opacity-40",
                  !locked && on && "border-ink bg-ink text-white",
                  !locked && !on && "border-border bg-background hover:border-ink/40",
                )}
              >
                {c.name}
                {locked ? " · açık talebiniz var" : ""}
              </button>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

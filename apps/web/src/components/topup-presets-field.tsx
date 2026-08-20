"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTry } from "@ilazim/shared";
import { formatTopupPresets } from "@/lib/topup-presets";

export function TopupPresetsField({ presets }: { presets: number[] }) {
  const [amounts, setAmounts] = useState(presets);
  const [draft, setDraft] = useState("");
  const hiddenValue = useMemo(() => formatTopupPresets(amounts), [amounts]);

  function addAmount() {
    const value = Number(draft.replace(",", ".").trim());
    if (!Number.isFinite(value) || value <= 0) return;
    const rounded = Math.round(value);
    setAmounts((prev) => [...new Set([...prev, rounded])].sort((a, b) => a - b));
    setDraft("");
  }

  return (
    <div>
      <Label>Bakiye yükleme seçenekleri</Label>
      <input type="hidden" name="topupPresets" value={hiddenValue} />
      <div className="mt-2 flex flex-wrap gap-2">
        {amounts.map((amount) => (
          <div
            key={amount}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-sm"
          >
            <span>{formatTry(amount)}</span>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              aria-label={`${formatTry(amount)} seçeneğini kaldır`}
              onClick={() => setAmounts((prev) => prev.filter((item) => item !== amount))}
            >
              ×
            </button>
          </div>
        ))}
        {amounts.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz tutar eklenmedi.</p>
        )}
      </div>
      <div className="mt-3 flex gap-2">
        <Input
          type="number"
          min={1}
          step={1}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Örn. 750"
          className="max-w-[160px]"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addAmount();
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addAmount}>
          Tutar ekle
        </Button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Cüzdan yükleme sayfasında görünecek hazır tutar butonları.
      </p>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KIND_LABELS, type ListingKind } from "@ilazim/shared";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SearchHero({ dark = false }: { dark?: boolean }) {
  const [kind, setKind] = useState<ListingKind>("service");
  const [q, setQ] = useState("");
  const router = useRouter();

  function go(e: React.FormEvent) {
    e.preventDefault();
    const path = kind === "service" ? "/hizmetler" : "/urunler";
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    router.push(`${path}?${params.toString()}`);
  }

  return (
    <form onSubmit={go} className="w-full min-w-0">
      <div
        className={cn(
          "w-full min-w-0 rounded-2xl p-2 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.45)]",
          dark ? "bg-white" : "border border-border bg-card",
        )}
      >
        <div className="grid w-full min-w-0 grid-cols-2 rounded-xl bg-secondary p-1">
          {(["service", "product"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKind(k)}
              className={cn(
                "h-11 rounded-lg text-sm font-semibold transition-colors",
                kind === k ? "bg-ink text-white" : "text-muted-foreground",
              )}
            >
              {KIND_LABELS[k]}
            </button>
          ))}
        </div>
        <div className="mt-2 flex w-full min-w-0 items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={kind === "service" ? "Temizlik, tadilat…" : "Bisiklet, telefon…"}
            className="h-11 min-w-0 flex-1 rounded-xl bg-transparent px-3 text-base outline-none placeholder:text-muted-foreground"
          />
          <Button type="submit" className="h-11 shrink-0 px-4">
            Ara
          </Button>
        </div>
      </div>
    </form>
  );
}

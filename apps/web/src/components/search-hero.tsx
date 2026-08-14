"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
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
    <form onSubmit={go} className="w-full">
      <div
        className={cn(
          "rounded-2xl p-1.5 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.45)]",
          dark ? "bg-white" : "border border-border bg-card",
        )}
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex shrink-0 rounded-xl bg-secondary p-1">
            {(["service", "product"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  "flex-1 rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors sm:flex-none",
                  kind === k ? "bg-ink text-white" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {KIND_LABELS[k]}
              </button>
            ))}
          </div>
          <div className="flex min-w-0 flex-1 items-center gap-2 px-1">
            <Search className="ml-2 hidden size-4 shrink-0 text-muted-foreground sm:block" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={
                kind === "service"
                  ? "Temizlik, tadilat, nakliyat…"
                  : "Bisiklet, telefon, mobilya…"
              }
              className="h-12 min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" className="h-11 rounded-xl px-6">
              Ara
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

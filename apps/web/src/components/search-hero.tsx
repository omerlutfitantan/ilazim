"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import type { ListingKind } from "@ilazim/shared";
import { KIND_LABELS } from "@ilazim/shared";
import { cn } from "@/lib/utils";

const PLACEHOLDERS: Record<ListingKind, string[]> = {
  service: ["Ev temizliği…", "Tadilat…", "Özel ders…", "Nakliyat…", "Tamirat…"],
  product: ["Bisiklet…", "Telefon…", "Mobilya…", "Spor aleti…", "Elektronik…"],
};

function useCyclingPlaceholder(kind: ListingKind) {
  const [i, setI] = useState(0);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setI((prev) => (prev + 1) % PLACEHOLDERS[kind].length);
        setVisible(true);
      }, 300);
    }, 2800);
    return () => clearInterval(id);
  }, [kind]);
  return { text: PLACEHOLDERS[kind][i], visible };
}

export function SearchHero({ dark = false }: { dark?: boolean }) {
  const [kind, setKind] = useState<ListingKind>("service");
  const [q, setQ] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { text: phText, visible: phVisible } = useCyclingPlaceholder(kind);

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
          "w-full min-w-0 rounded-2xl p-2 transition-all duration-300",
          dark ? "bg-white" : "border border-border bg-card",
          focused
            ? "search-pulse shadow-[0_0_0_2px_rgba(200,240,75,0.5),0_20px_60px_-16px_rgba(0,0,0,0.5)]"
            : "shadow-[0_20px_60px_-24px_rgba(0,0,0,0.45)]",
        )}
      >
        {/* Kind tabs */}
        <div className="grid w-full min-w-0 grid-cols-2 rounded-xl bg-secondary p-1">
          {(["service", "product"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => { setKind(k); setQ(""); }}
              className={cn(
                "h-11 rounded-lg text-sm font-semibold transition-all duration-200",
                kind === k
                  ? "bg-ink text-white shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {KIND_LABELS[k]}
            </button>
          ))}
        </div>

        {/* Input row */}
        <div className="mt-2 flex w-full min-w-0 items-center gap-2">
          <Search className="ml-2 size-4 shrink-0 text-muted-foreground" />
          <div className="relative min-w-0 flex-1">
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              className="h-11 w-full bg-transparent px-1 text-base outline-none placeholder:text-transparent"
              placeholder=" "
              aria-label={`${KIND_LABELS[kind]} ara`}
            />
            {!q && (
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute top-1/2 left-1 -translate-y-1/2 text-base text-muted-foreground transition-opacity duration-300",
                  phVisible ? "opacity-100" : "opacity-0",
                )}
              >
                {phText}
              </span>
            )}
          </div>
          <button
            type="submit"
            className="h-11 shrink-0 rounded-xl bg-ink px-4 text-sm font-semibold text-accent transition-all hover:bg-ink/80 active:scale-[0.97]"
          >
            Ara
          </button>
        </div>
      </div>
    </form>
  );
}

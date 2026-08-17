"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const hints: Record<number, string> = {
  1: "Zayıf",
  2: "Orta",
  3: "İyi",
  4: "Çok iyi",
  5: "Mükemmel",
};

export function StarPicker({
  name = "rating",
  defaultValue = 5,
}: {
  name?: string;
  defaultValue?: number;
}) {
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div>
      <input type="hidden" name={name} value={value} required />
      <div
        className="inline-flex items-center gap-0.5 rounded-2xl border border-border bg-card px-3 py-2"
        role="radiogroup"
        aria-label="Puan seçin"
        onMouseLeave={() => setHover(0)}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const n = i + 1;
          const active = n <= display;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={value === n}
              aria-label={`${n} yıldız`}
              className="rounded-lg p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => setValue(n)}
            >
              <Star
                className={cn(
                  "size-8 transition-colors duration-150",
                  active ? "fill-saffron text-saffron drop-shadow-sm" : "text-border",
                )}
              />
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{hints[display]}</p>
    </div>
  );
}

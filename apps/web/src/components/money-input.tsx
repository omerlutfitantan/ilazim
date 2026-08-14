"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const MAX_CENTS = 9_999_999_999;

export function MoneyInput({
  name,
  id,
  required,
  defaultValue,
  optional,
  className,
  value,
  onValueChange,
}: {
  name?: string;
  id?: string;
  required?: boolean;
  defaultValue?: number | string | null;
  optional?: boolean;
  className?: string;
  value?: string;
  onValueChange?: (next: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const skipInsert = useRef(false);
  const [inner, setInner] = useState(() => centsFrom(defaultValue));
  const cents = value != null ? centsFrom(value) : inner;

  function setCents(next: number) {
    const clipped = Math.min(Math.max(0, Math.floor(next)), MAX_CENTS);
    if (onValueChange) onValueChange(optional && clipped === 0 ? "" : (clipped / 100).toFixed(2));
    else setInner(clipped);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      const len = el.value.length;
      el.setSelectionRange(len, len);
    });
  }

  const hidden = optional && cents === 0 ? "" : (cents / 100).toFixed(2);

  return (
    <>
      {name ? <input type="hidden" name={name} value={hidden} /> : null}
      <Input
        ref={inputRef}
        id={id}
        inputMode="numeric"
        autoComplete="off"
        required={required && !optional ? cents > 0 : required}
        className={cn("tabular-nums", className)}
        value={(cents / 100).toFixed(2)}
        onFocus={(e) => {
          const el = e.currentTarget;
          const len = el.value.length;
          requestAnimationFrame(() => el.setSelectionRange(len, len));
        }}
        onKeyDown={(e) => {
          if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault();
            setCents(Math.floor(cents / 10));
            return;
          }
          if (/^\d$/.test(e.key)) {
            e.preventDefault();
            skipInsert.current = true;
            setCents(cents * 10 + Number(e.key));
          }
        }}
        onBeforeInput={(e) => {
          const data = e.data;
          if (!data) return;
          e.preventDefault();
          if (skipInsert.current) {
            skipInsert.current = false;
            return;
          }
          if (!/^\d+$/.test(data)) return;
          let next = cents;
          for (const ch of data) next = next * 10 + Number(ch);
          setCents(next);
        }}
        onPaste={(e) => {
          e.preventDefault();
          const digits = e.clipboardData.getData("text").replace(/\D/g, "");
          setCents(parseInt(digits || "0", 10));
        }}
        onChange={(e) => {
          const formatted = (cents / 100).toFixed(2);
          if (e.target.value === formatted) return;
          setCents(parseInt(e.target.value.replace(/\D/g, "") || "0", 10));
        }}
      />
    </>
  );
}

function centsFrom(value: number | string | null | undefined) {
  if (value == null || value === "") return 0;
  const n = typeof value === "number" ? value : Number(String(value).replace(",", "."));
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

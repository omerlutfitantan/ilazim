"use client";

import { useRef, useState } from "react";
import { formatTrPhone, normalizeTrPhone } from "@ilazim/shared";
import { Input } from "@/components/ui/input";

export function PhoneInput({
  name = "phone",
  id,
  defaultValue,
  value,
  onValueChange,
  required,
  className,
}: {
  name?: string;
  id?: string;
  defaultValue?: string | null;
  value?: string;
  onValueChange?: (next: string) => void;
  required?: boolean;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const skipInsert = useRef(false);
  const [inner, setInner] = useState(() => normalizeTrPhone(defaultValue) ?? "");
  const stored = value != null ? (normalizeTrPhone(value) ?? "") : inner;

  function setPhone(raw: string) {
    const next = normalizeTrPhone(raw) ?? "";
    if (onValueChange) onValueChange(next);
    else setInner(next);
    requestAnimationFrame(() => {
      const el = inputRef.current;
      if (!el) return;
      const len = el.value.length;
      el.setSelectionRange(len, len);
    });
  }

  return (
    <>
      <input type="hidden" name={name} value={stored} />
      <Input
        ref={inputRef}
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        required={required}
        placeholder="05xx xxx xx xx"
        className={className}
        value={stored ? formatTrPhone(stored) : "0"}
        onFocus={(e) => {
          const el = e.currentTarget;
          const len = el.value.length;
          requestAnimationFrame(() => el.setSelectionRange(len, len));
        }}
        onKeyDown={(e) => {
          if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault();
            const digits = stored.replace(/\D/g, "");
            setPhone(digits.slice(0, -1));
            return;
          }
          if (!/^\d$/.test(e.key)) return;
          e.preventDefault();
          skipInsert.current = true;
          const national = stored.replace(/^0+/, "").replace(/\D/g, "");
          if (!national && e.key === "0") return;
          setPhone(national + e.key);
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
          const national = stored.replace(/^0+/, "").replace(/\D/g, "");
          let next = national;
          for (const ch of data) {
            if (!next && ch === "0") continue;
            if (next.length >= 10) break;
            next += ch;
          }
          setPhone(next);
        }}
        onPaste={(e) => {
          e.preventDefault();
          setPhone(e.clipboardData.getData("text"));
        }}
        onChange={(e) => {
          const shown = stored ? formatTrPhone(stored) : "0";
          if (e.target.value === shown) return;
          setPhone(e.target.value);
        }}
      />
    </>
  );
}

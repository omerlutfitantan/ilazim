/** TR telefon: 0 + 10 hane. 5xx, 05xx, 905xx, +90 hepsi aynı kayda iner. */
export function normalizeTrPhone(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  let d = String(raw).replace(/\D/g, "");
  if (!d) return null;
  if (d.startsWith("90")) d = d.slice(2);
  d = d.replace(/^0+/, "");
  d = d.slice(0, 10);
  if (!d) return null;
  return `0${d}`;
}

export function formatTrPhone(raw: string | null | undefined): string {
  const n = normalizeTrPhone(raw);
  if (!n) return "0";
  if (n.length <= 4) return n;
  if (n.length <= 7) return `${n.slice(0, 4)} ${n.slice(4)}`;
  if (n.length <= 9) return `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7)}`;
  return `${n.slice(0, 4)} ${n.slice(4, 7)} ${n.slice(7, 9)} ${n.slice(9, 11)}`;
}

export function telHref(phone: string): string {
  const n = normalizeTrPhone(phone);
  if (!n) return "tel:";
  const national = n.startsWith("0") ? n.slice(1) : n;
  return `tel:+90${national}`;
}

export function preprocessPhone(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  if (!s) return null;
  return normalizeTrPhone(s);
}

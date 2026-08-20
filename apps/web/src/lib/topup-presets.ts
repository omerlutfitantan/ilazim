export const DEFAULT_TOPUP_PRESETS = [100, 250, 500, 1000];

export function parseTopupPresets(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.map(Number).filter((n) => Number.isFinite(n) && n > 0);
  }
  if (typeof value === "string" && value.trim()) {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map(Number).filter((n) => Number.isFinite(n) && n > 0);
      }
    } catch {
      // Virgülle ayrılmış metin
      const nums = value
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isFinite(n) && n > 0);
      if (nums.length > 0) return nums;
    }
  }
  return DEFAULT_TOPUP_PRESETS;
}

export function formatTopupPresets(values: number[]) {
  return values.join(", ");
}

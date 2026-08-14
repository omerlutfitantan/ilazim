export const CONSENT_COOKIE = "ilazim_consent";
export const WELCOME_COOKIE = "ilazim_welcome";
export const DESK_COOKIE_NAME = "ilazim_desk";
export const CONSENT_SAVED_EVENT = "ilazim-consent-saved";
export const OPEN_CONSENT_EVENT = "ilazim-open-consent";

export type ConsentChoice = "necessary" | "all";

export function parseConsent(value: string | undefined | null): ConsentChoice | null {
  if (value === "necessary" || value === "all") return value;
  return null;
}

export function allowsPreferences(choice: ConsentChoice | null): boolean {
  return choice === "all";
}

export function readClientConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const row = document.cookie.split("; ").find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
  return parseConsent(row?.slice(CONSENT_COOKIE.length + 1));
}

export function writeClientCookie(name: string, value: string, maxAge = 60 * 60 * 24 * 365) {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

export function clearClientCookie(name: string) {
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax`;
}

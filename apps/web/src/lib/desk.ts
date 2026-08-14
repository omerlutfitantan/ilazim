import { cookies } from "next/headers";
import type { ProfileRow } from "@/lib/database.types";

export const DESK_COOKIE = "ilazim_desk";
export type Desk = "buyer" | "seller";

export function canUseSellerDesk(profile: ProfileRow | null) {
  return profile?.role === "seller" || profile?.role === "admin";
}

export async function getDesk(profile: ProfileRow | null): Promise<Desk> {
  if (!profile) return "buyer";
  const jar = await cookies();
  const raw = jar.get(DESK_COOKIE)?.value;
  if (raw === "buyer" || raw === "seller") {
    if (raw === "seller" && !canUseSellerDesk(profile)) return "buyer";
    return raw;
  }
  return profile.role === "buyer" ? "buyer" : "seller";
}

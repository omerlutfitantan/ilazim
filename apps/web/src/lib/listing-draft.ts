import type { ListingKind } from "@ilazim/shared";

export const LISTING_DRAFT_KEY = "ilazim_listing_draft";

export type ListingDraft = {
  kind?: ListingKind;
  categoryId?: string;
  categoryName?: string;
  title?: string;
  description?: string;
  cityId?: string;
  cityName?: string;
  districtId?: string | null;
  districtName?: string | null;
  budgetMin?: string;
  budgetMax?: string;
  showPhone?: boolean;
  phone?: string;
};

function parse(raw: string | null): ListingDraft {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as ListingDraft;
  } catch {
    return {};
  }
}

export function readDraft(): ListingDraft {
  if (typeof window === "undefined") return {};
  const local = parse(localStorage.getItem(LISTING_DRAFT_KEY));
  const session = parse(sessionStorage.getItem(LISTING_DRAFT_KEY));
  return { ...session, ...local };
}

export function writeDraft(partial: Partial<ListingDraft>) {
  const next = { ...readDraft(), ...partial };
  const raw = JSON.stringify(next);
  localStorage.setItem(LISTING_DRAFT_KEY, raw);
  sessionStorage.setItem(LISTING_DRAFT_KEY, raw);
  return next;
}

export function clearDraft() {
  localStorage.removeItem(LISTING_DRAFT_KEY);
  sessionStorage.removeItem(LISTING_DRAFT_KEY);
}

export function isDraftPublishable(d: ListingDraft) {
  return Boolean(
    d.kind &&
      d.categoryId &&
      (d.title?.trim().length ?? 0) >= 8 &&
      (d.description?.trim().length ?? 0) >= 20 &&
      d.cityId,
  );
}

export const APP_NAME = "iLazım";
export const APP_TAGLINE = "Ne lazımsa, teklif gelsin.";
export const DEFAULT_CURRENCY = "TRY";
export const DEFAULT_BID_FEE = 29.9;
export const DEFAULT_NEW_SELLER_CREDIT = 100;
export const DEFAULT_NEW_SELLER_DISCOUNT_PERCENT = 50;
export const DEFAULT_DISCOUNTED_OFFER_COUNT = 5;

export const USER_ROLES = ["buyer", "seller", "admin"] as const;
export const LISTING_KINDS = ["service", "product"] as const;
export const LISTING_STATUSES = [
  "draft",
  "open",
  "awarded",
  "completed",
  "cancelled",
] as const;
export const OFFER_STATUSES = [
  "pending",
  "accepted",
  "rejected",
  "withdrawn",
] as const;
export const SELLER_STATUSES = [
  "pending",
  "approved",
  "rejected",
  "suspended",
] as const;
export const SELLER_TYPES = ["service", "product", "both"] as const;

export const KIND_LABELS: Record<(typeof LISTING_KINDS)[number], string> = {
  service: "Hizmet",
  product: "Ürün",
};

export const KIND_PATHS: Record<(typeof LISTING_KINDS)[number], string> = {
  service: "hizmetler",
  product: "urunler",
};

export const TOPUP_PRESETS = [100, 250, 500, 1000] as const;
export const JOB_RADIUS_KM = [10, 25, 50, 100] as const;

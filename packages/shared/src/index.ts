export type UserRole = "buyer" | "seller" | "admin";
export type ListingKind = "service" | "product";
export type ListingStatus = "draft" | "open" | "awarded" | "completed" | "cancelled";
export type OfferStatus = "pending" | "accepted" | "rejected" | "withdrawn";
export type SellerStatus = "pending" | "approved" | "rejected" | "suspended";
export type SellerType = "service" | "product" | "both";
export type WalletTxType =
  | "topup"
  | "bid_fee"
  | "credit_grant"
  | "credit_spend"
  | "refund"
  | "adjustment";
export type PaymentStatus = "pending" | "completed" | "failed" | "cancelled";
export type NotificationType =
  | "offer"
  | "offer_accepted"
  | "message"
  | "review"
  | "wallet"
  | "system";

export type FaqItem = { q: string; a: string };

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatTry(amount: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
  }).format(amount);
}

export function maskPersonName(name: string | null | undefined): string {
  const clean = (name ?? "").trim().replace(/\s+/g, " ");
  if (!clean) return "Kullanıcı";
  const parts = clean.split(" ");
  if (parts.length === 1) return parts[0];
  const last = parts[parts.length - 1];
  return `${parts[0]} ${last.charAt(0).toLocaleUpperCase("tr-TR")}.`;
}

export function slugify(input: string): string {
  return input
    .trim()
    .replace(/[İI]/g, "i")
    .replace(/[ı]/g, "i")
    .toLowerCase()
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function clipSeo(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const sp = cut.lastIndexOf(" ");
  return `${(sp > 24 ? cut.slice(0, sp) : cut).trimEnd()}…`;
}

export function buildCategorySeo(name: string, kind: ListingKind) {
  const trimmed = name.trim().replace(/\s+/g, " ");
  const lower = trimmed.toLocaleLowerCase("tr-TR");
  const isService = kind === "service";
  const who = isService ? "hizmet verenler" : "satıcılar";
  const h1 = isService
    ? `${trimmed} hizmeti alın, ustalar teklif versin`
    : `${trimmed} ilanı açın, satıcılar teklif versin`;
  const metaTitle = clipSeo(`${trimmed} | iLazım ile teklif toplayın`, 70);
  const metaDescription = clipSeo(
    isService
      ? `${trimmed} ilanı açın. Onaylı ${who} sabit teklif ücretiyle size fiyat versin. Puanları karşılaştırın, işi bitirin.`
      : `${trimmed} talebi açın. Onaylı ${who} sabit teklif ücretiyle size fiyat versin. Puanları karşılaştırın, işi bitirin.`,
    155,
  );
  const content = `iLazım üzerinden ${lower} ${
    isService ? "talebi" : "ilanı"
  } oluşturduğunuzda bölgenizdeki onaylı ${who} size teklif gönderir. İlanınız açık kaldığı sürece teklifler gelir. Kazananı siz seçersiniz; iş tamamlanınca puanlarsınız.`;
  const faq: FaqItem[] = [
    {
      q: `${trimmed} ilanı nasıl açılır?`,
      a: `Kategori olarak ${trimmed} seçin, konumunuzu ve ihtiyacınızı yazın. ${
        isService ? "Hizmet verenler" : "Satıcılar"
      } size teklif iletir.`,
    },
    {
      q: "Teklif ücreti nedir?",
      a: "Alıcı için ücretsizdir. Teklif veren her seferinde sabit bir platform ücreti öder.",
    },
  ];
  return {
    slug: slugify(trimmed) || "kategori",
    h1: clipSeo(h1, 160),
    metaTitle,
    metaDescription,
    content,
    faq,
  };
}

export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

export function computeBidFee(input: {
  baseFee: number;
  remainingDiscountedOffers?: number;
  discountPercent?: number;
}): { fee: number; usedPromo: boolean } {
  const remaining = input.remainingDiscountedOffers ?? 0;
  const discount = input.discountPercent ?? 0;
  if (remaining > 0 && discount > 0) {
    return {
      fee: roundMoney(input.baseFee * (1 - discount / 100)),
      usedPromo: true,
    };
  }
  return { fee: roundMoney(input.baseFee), usedPromo: false };
}

export function allocateSpend(
  creditBalance: number,
  cashBalance: number,
  amount: number,
): { fromCredit: number; fromCash: number } {
  const need = roundMoney(amount);
  const available = roundMoney(creditBalance + cashBalance);
  if (available + 0.001 < need) {
    throw new Error("Yetersiz bakiye");
  }
  const fromCredit = roundMoney(Math.min(creditBalance, need));
  const fromCash = roundMoney(need - fromCredit);
  return { fromCredit, fromCash };
}

export function availableBalance(credit: number, cash: number): number {
  return roundMoney(credit + cash);
}

export * from "./constants";
export * from "./schemas";
export * from "./phone";

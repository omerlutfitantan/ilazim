import type {
  ListingKind,
  ListingStatus,
  OfferStatus,
  PaymentStatus,
  SellerStatus,
  SellerType,
  UserRole,
  WalletTxType,
} from "@ilazim/shared";

export const roleLabel: Record<UserRole, string> = {
  buyer: "Alıcı",
  seller: "Satıcı",
  admin: "Admin",
};

export const listingKindLabel: Record<ListingKind, string> = {
  service: "Hizmet",
  product: "Ürün",
};

export const listingStatusLabel: Record<ListingStatus, string> = {
  draft: "Taslak",
  open: "Açık",
  awarded: "Teklif seçildi",
  completed: "Tamamlandı",
  cancelled: "İptal",
};

export const offerStatusLabel: Record<OfferStatus, string> = {
  pending: "Bekliyor",
  accepted: "Kabul",
  rejected: "Red",
  withdrawn: "Geri çekildi",
};

export const sellerStatusLabel: Record<SellerStatus, string> = {
  pending: "İncelemede",
  approved: "Onaylı",
  rejected: "Reddedildi",
  suspended: "Askıda",
};

export const sellerTypeLabel: Record<SellerType, string> = {
  service: "Hizmet",
  product: "Ürün",
  both: "Hizmet ve ürün",
};

export const paymentStatusLabel: Record<PaymentStatus, string> = {
  pending: "Bekliyor",
  completed: "Tamamlandı",
  failed: "Başarısız",
  cancelled: "İptal",
};

export const walletTxLabel: Record<WalletTxType, string> = {
  topup: "Yükleme",
  bid_fee: "Teklif ücreti",
  credit_grant: "Bakiye tanımı (eski)",
  credit_spend: "Bakiye kullanımı (eski)",
  refund: "İade",
  adjustment: "Düzeltme",
};

export const balanceKindLabel: Record<string, string> = {
  cash: "Bakiye",
  credit: "Bakiye (eski)",
};

export function labelOf<T extends string>(map: Record<T, string>, value: string | null | undefined) {
  if (!value) return "—";
  return map[value as T] ?? value;
}

export function formatTrDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

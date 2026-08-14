import { z } from "zod";

export const listingKindSchema = z.enum(["service", "product"]);
export const sellerTypeSchema = z.enum(["service", "product", "both"]);

export const signUpSchema = z
  .object({
    fullName: z.string().trim().min(2, "Ad soyad en az 2 karakter").max(80),
    email: z.string().email("Geçerli bir e-posta girin"),
    password: z.string().min(8, "Şifre en az 8 karakter"),
    passwordConfirm: z.string().min(8, "Şifreyi tekrar girin"),
    phone: z.string().trim().max(20).optional().nullable(),
    acceptTerms: z.boolean().refine((v) => v === true, "Şartları kabul etmelisiniz"),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordConfirm"],
  });

export const signInSchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

export const emailOnlySchema = z.object({
  email: z.string().email("Geçerli bir e-posta girin"),
});

export const passwordResetSchema = z
  .object({
    password: z.string().min(8, "Şifre en az 8 karakter"),
    passwordConfirm: z.string().min(8, "Şifreyi tekrar girin"),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: "Şifreler eşleşmiyor",
    path: ["passwordConfirm"],
  });

export const listingCreateSchema = z.object({
  kind: listingKindSchema,
  categoryId: z.string().uuid("Kategori seçin"),
  title: z.string().trim().min(8, "Başlık en az 8 karakter").max(120),
  description: z.string().trim().min(20, "Açıklama en az 20 karakter").max(5000),
  cityId: z.string().uuid("Şehir seçin"),
  districtId: z.string().uuid().optional().nullable(),
  budgetMin: z.coerce.number().min(0).optional().nullable(),
  budgetMax: z.coerce.number().min(0).optional().nullable(),
  imageUrls: z.array(z.string().url()).max(8).default([]),
  showPhone: z.boolean().default(false),
  phone: z.string().trim().max(20).optional().nullable(),
});

export const offerCreateSchema = z.object({
  listingId: z.string().uuid(),
  amount: z.coerce.number().positive("Teklif tutarı 0'dan büyük olmalı"),
  message: z.string().trim().min(10, "Mesaj en az 10 karakter").max(2000),
  etaText: z.string().trim().max(120).optional().nullable(),
  imageUrls: z.array(z.string().url()).max(6).default([]),
});

export const reviewSchema = z.object({
  listingId: z.string().uuid(),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().min(8, "Yorum en az 8 karakter").max(2000),
});

export const sellerOnboardingSchema = z.object({
  sellerType: sellerTypeSchema,
  headline: z.string().trim().min(8, "Başlık en az 8 karakter").max(120),
  bio: z.string().trim().min(20, "Hakkında en az 20 karakter").max(2000),
  cityId: z.string().uuid("Şehir seçin"),
  districtId: z.string().uuid().optional().nullable(),
  phone: z.string().trim().min(10).max(20).optional().nullable(),
  categoryIds: z.array(z.string().uuid()).default([]),
});

export const messageSchema = z.object({
  conversationId: z.string().uuid(),
  body: z.string().trim().min(1).max(4000),
});

export const categorySchema = z.object({
  kind: listingKindSchema,
  name: z.string().trim().min(2).max(80),
  isFeatured: z.boolean().default(false),
  sortOrder: z.coerce.number().int().default(0),
});

export const bidFeeSettingsSchema = z.object({
  bidFeeAmount: z.coerce.number().min(0),
  newSellerCreditAmount: z.coerce.number().min(0),
  newSellerDiscountPercent: z.coerce.number().min(0).max(100),
  newSellerDiscountedOfferCount: z.coerce.number().int().min(0),
});

export const grantBalanceSchema = z.object({
  userId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  kind: z.enum(["credit", "cash"]),
  note: z.string().trim().max(300).optional(),
});

export const promoCampaignSchema = z.object({
  name: z.string().trim().min(3).max(120),
  creditAmount: z.coerce.number().min(0),
  bidFeeDiscountPercent: z.coerce.number().min(0).max(100),
  discountedOfferCount: z.coerce.number().int().min(0),
  maxRedemptions: z.coerce.number().int().min(0).nullable().optional(),
  isActive: z.boolean().default(true),
});

export const topupSchema = z.object({
  amount: z.coerce.number().min(50, "En az 50 TL yükleyebilirsiniz"),
});

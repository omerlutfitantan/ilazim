import { z } from "zod";
import { preprocessPhone } from "./phone";

const emptyToNull = (v: unknown) => (typeof v === "string" && v.trim() === "" ? null : v);
const phoneField = z.preprocess(preprocessPhone, z.string().max(16).nullable().optional());
const requiredPhone = z.preprocess(preprocessPhone, z.string().regex(/^0\d{10}$/, "Geçerli bir telefon girin"));
const namePart = (label: string) =>
  z
    .string()
    .trim()
    .min(2, `${label} en az 2 karakter`)
    .max(40, `${label} en fazla 40 karakter`)
    .regex(/^[A-Za-zÀ-ÿÇĞİÖŞÜçğıöşü'’\- ]+$/u, `${label} yalnızca harf içermeli`);

export const listingKindSchema = z.enum(["service", "product"]);
export const sellerTypeSchema = z.enum(["service", "product", "both"]);

export const signUpSchema = z
  .object({
    firstName: namePart("Ad"),
    lastName: namePart("Soyad"),
    email: z.string().email("Geçerli bir e-posta girin"),
    password: z.string().min(8, "Şifre en az 8 karakter"),
    passwordConfirm: z.string().min(8, "Şifreyi tekrar girin"),
    phone: requiredPhone,
    cityId: z.string().uuid("Şehir seçin"),
    districtId: z.string().uuid("İlçe seçin"),
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
  districtId: z.string().uuid("İlçe seçin"),
  budgetMin: z.coerce.number().min(0).optional().nullable(),
  budgetMax: z.coerce.number().min(0).optional().nullable(),
  imageUrls: z.array(z.string().url()).max(8).default([]),
  showPhone: z.boolean().default(false),
  phone: phoneField,
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
  districtId: z.string().uuid("İlçe seçin"),
  phone: phoneField,
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
  metaTitle: z.string().trim().max(80).optional(),
  metaDescription: z.string().trim().max(220).optional(),
  h1: z.string().trim().max(160).optional(),
  content: z.string().trim().max(2000).optional(),
});

export const bidFeeSettingsSchema = z.object({
  bidFeeAmount: z.coerce.number().min(0),
  newSellerWelcomeBalance: z.coerce.number().min(0),
  newSellerDiscountPercent: z.coerce.number().min(0).max(100),
  newSellerDiscountedOfferCount: z.coerce.number().int().min(0),
});

export const grantBalanceSchema = z.object({
  userId: z.string().uuid(),
  amount: z.coerce.number().positive(),
  note: z.string().trim().max(300).optional(),
});

export const siteIntegrationsSchema = z.object({
  emailFrom: z.string().trim().max(200).optional().default(""),
  resendApiKey: z.string().trim().max(200).optional().default(""),
  // Shopier PAT-based checkout + REST webhook processing
  shopierPat: z.string().trim().max(500).optional().default(""),
  shopierShopSlug: z.string().trim().max(120).optional().default(""),
  shopierWebhookToken: z.string().trim().max(200).optional().default(""),
  gaMeasurementId: z.string().trim().max(40).optional().default(""),
  gtmContainerId: z.string().trim().max(40).optional().default(""),
  googleAdsId: z.string().trim().max(40).optional().default(""),
  googleSiteVerification: z.string().trim().max(120).optional().default(""),
});

export const topupSchema = z.object({
  amount: z.coerce.number().min(50, "En az 50 TL yükleyebilirsiniz"),
});

export const profileUpdateSchema = z.object({
  firstName: namePart("Ad"),
  lastName: namePart("Soyad"),
  phone: requiredPhone,
  bio: z.preprocess(emptyToNull, z.string().trim().max(2000).nullable().optional()),
  cityId: z.string().uuid("Şehir seçin"),
  districtId: z.string().uuid("İlçe seçin"),
});

export const adminUserUpdateSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["buyer", "seller", "admin"]),
  sellerStatus: z.preprocess(
    emptyToNull,
    z.enum(["pending", "approved", "rejected", "suspended"]).nullable().optional(),
  ),
  sellerType: z.preprocess(emptyToNull, z.enum(["service", "product", "both"]).nullable().optional()),
  fullName: z.string().trim().min(2).max(80).optional(),
  displayName: z.string().trim().min(2).max(80).optional(),
  phone: phoneField,
  bio: z.preprocess(emptyToNull, z.string().trim().max(2000).nullable().optional()),
  sellerHeadline: z.preprocess(emptyToNull, z.string().trim().max(120).nullable().optional()),
});

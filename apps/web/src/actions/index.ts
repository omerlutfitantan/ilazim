"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  listingCreateSchema,
  offerCreateSchema,
  reviewSchema,
  sellerOnboardingSchema,
  signInSchema,
  signUpSchema,
  emailOnlySchema,
  passwordResetSchema,
  messageSchema,
  grantBalanceSchema,
  bidFeeSettingsSchema,
  promoCampaignSchema,
  categorySchema,
  buildCategorySeo,
  profileUpdateSchema,
  adminUserUpdateSchema,
} from "@ilazim/shared";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { after } from "next/server";
import { getProfile } from "@/lib/data";
import { DESK_COOKIE } from "@/lib/desk";
import { allowsPreferences, CONSENT_COOKIE, parseConsent } from "@/lib/consent";
import { sendNewMessageEmail, sendOfferReceivedEmail } from "@/lib/notify-emails";

async function persistDeskCookie(desk: "buyer" | "seller") {
  const jar = await cookies();
  if (!allowsPreferences(parseConsent(jar.get(CONSENT_COOKIE)?.value))) return;
  jar.set(DESK_COOKIE, desk, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}

export async function signUpAction(_: unknown, formData: FormData) {
  const parsed = signUpSchema.safeParse({
    fullName: formData.get("fullName"),
    email: formData.get("email"),
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
    phone: formData.get("phone") || null,
    cityId: formData.get("cityId"),
    districtId: formData.get("districtId"),
    acceptTerms: formData.get("acceptTerms") === "on",
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const nextRaw = String(formData.get("next") || "");
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/hesabim";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        phone: parsed.data.phone ?? "",
        city_id: parsed.data.cityId,
        district_id: parsed.data.districtId,
      },
      emailRedirectTo: `${site}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });
  if (error) return { error: error.message };
  if (data.session && data.user && !data.user.email_confirmed_at) {
    await supabase.auth.signOut();
  }
  if (!data.session || !data.user?.email_confirmed_at) {
    redirect(`/dogrula?email=${encodeURIComponent(parsed.data.email)}&next=${encodeURIComponent(next)}`);
  }
  redirect(next);
}

export async function signInAction(_: unknown, formData: FormData) {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  const nextRaw = String(formData.get("next") || "/hesabim");
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/hesabim";
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
      return { error: "E-posta veya şifre hatalı" };
    }
    return { error: error.message };
  }
  if (data.user && !data.user.email_confirmed_at) {
    await supabase.auth.signOut();
    return { error: "Önce e-posta adresinizi doğrulayın. Gelen kutunuzdaki bağlantıya tıklayın." };
  }
  redirect(next);
}

export async function resendVerificationAction(_: unknown, formData: FormData) {
  const parsed = emailOnlySchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz e-posta" };
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const nextRaw = String(formData.get("next") || "/hesabim");
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/hesabim";
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: parsed.data.email,
    options: { emailRedirectTo: `${site}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function requestPasswordResetAction(_: unknown, formData: FormData) {
  const parsed = emailOnlySchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz e-posta" };
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${site}/auth/callback?next=${encodeURIComponent("/sifre-yenile")}`,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function updatePasswordAction(_: unknown, formData: FormData) {
  const parsed = passwordResetSchema.safeParse({
    password: formData.get("password"),
    passwordConfirm: formData.get("passwordConfirm"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return { error: error.message };
  redirect("/hesabim");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const jar = await cookies();
  jar.delete(DESK_COOKIE);
  redirect("/");
}

export async function switchDeskAction(formData: FormData) {
  const desk = String(formData.get("desk") || "");
  if (desk !== "buyer" && desk !== "seller") redirect("/hesabim");
  await persistDeskCookie(desk);
  revalidatePath("/", "layout");
  if (desk === "seller") {
    const profile = await getProfile();
    if (!profile) redirect("/giris");
    if (profile.role === "buyer") redirect("/satici/onboarding");
    redirect("/satici/tekliflerim");
  }
  redirect("/hesabim");
}

export async function publishListingAction(_: unknown, formData: FormData) {
  const parsed = listingCreateSchema.safeParse({
    kind: formData.get("kind"),
    categoryId: formData.get("categoryId"),
    title: formData.get("title"),
    description: formData.get("description"),
    cityId: formData.get("cityId"),
    districtId: formData.get("districtId") || null,
    budgetMin: formData.get("budgetMin") || null,
    budgetMax: formData.get("budgetMax") || null,
    imageUrls: [],
    showPhone: formData.get("showPhone") === "on",
    phone: formData.get("phone") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  if (parsed.data.showPhone && (!parsed.data.phone || parsed.data.phone.replace(/\D/g, "").length < 10)) {
    return { error: "Telefonun görünsün derseniz geçerli bir numara girin" };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("publish_listing", {
    p_category_id: parsed.data.categoryId,
    p_title: parsed.data.title,
    p_description: parsed.data.description,
    p_city_id: parsed.data.cityId,
    p_district_id: parsed.data.districtId ?? null,
    p_budget_min: parsed.data.budgetMin ?? null,
    p_budget_max: parsed.data.budgetMax ?? null,
    p_image_urls: parsed.data.imageUrls,
    p_show_phone: parsed.data.showPhone,
    p_phone: parsed.data.phone ?? null,
  });
  if (error) return { error: error.message };
  if (data) {
    try {
      const { sendListingMatchEmails } = await import("@/lib/listing-alerts");
      await sendListingMatchEmails(String(data));
    } catch {
      /* e-posta isteğe bağlı; ilan yayınlanır */
    }
  }
  revalidatePath("/");
  revalidatePath("/hesabim/ilanlarim");
  if (formData.get("stay") === "1") {
    return { ok: true as const, id: String(data) };
  }
  redirect(`/hesabim/ilanlarim/${data}`);
}

export async function placeOfferAction(_: unknown, formData: FormData) {
  const parsed = offerCreateSchema.safeParse({
    listingId: formData.get("listingId"),
    amount: formData.get("amount"),
    message: formData.get("message"),
    etaText: formData.get("etaText") || null,
    imageUrls: [],
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("place_offer", {
    p_listing_id: parsed.data.listingId,
    p_amount: parsed.data.amount,
    p_message: parsed.data.message,
    p_eta_text: parsed.data.etaText ?? null,
    p_image_urls: parsed.data.imageUrls,
  });
  if (error) return { error: error.message };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    after(() =>
      sendOfferReceivedEmail({
        listingId: parsed.data.listingId,
        amount: parsed.data.amount,
        message: parsed.data.message,
        sellerId: user.id,
      }),
    );
  }
  revalidatePath("/satici/tekliflerim");
  revalidatePath("/mesajlar");
  revalidatePath("/ilan", "layout");
  revalidatePath("/");
  return { ok: true };
}

export async function hideListingAction(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("hide_listing_for_seller", {
    p_listing_id: listingId,
  });
  if (error) return { error: error.message };
  revalidatePath("/satici/ilanlar");
  revalidatePath("/satici");
  revalidatePath("/");
  return { ok: true };
}

export async function markListingSeenAction(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_listing_seen_for_seller", {
    p_listing_id: listingId,
  });
  if (error) return { error: error.message };
  revalidatePath("/satici/ilanlar");
  return { ok: true };
}

export async function acceptOfferAction(offerId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("accept_offer", { p_offer_id: offerId });
  if (error) return { error: error.message };
  revalidatePath("/hesabim");
  revalidatePath("/mesajlar", "layout");
  revalidatePath("/satici");
  revalidatePath("/ilan", "layout");
  return { ok: true };
}

export async function revealContactAction(listingId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("reveal_listing_phone", {
    p_listing_id: listingId,
  });
  if (error) return { error: error.message };
  return { phone: data as string };
}

export async function deleteReviewAction(reviewId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_review", { p_review_id: reviewId });
  if (error) return { error: error.message };
  revalidatePath("/admin/yorumlar");
  return { ok: true };
}

export async function completeListingAction(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_listing", { p_listing_id: listingId });
  if (error) return { error: error.message };
  revalidatePath("/hesabim");
  return { ok: true };
}

export async function cancelListingAction(listingId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_listing", { p_listing_id: listingId });
  if (error) return { error: error.message };
  revalidatePath("/hesabim");
  return { ok: true };
}

export async function submitReviewAction(_: unknown, formData: FormData) {
  const parsed = reviewSchema.safeParse({
    listingId: formData.get("listingId"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_review", {
    p_listing_id: parsed.data.listingId,
    p_rating: parsed.data.rating,
    p_comment: parsed.data.comment,
  });
  if (error) return { error: error.message };
  revalidatePath("/hesabim");
  revalidatePath("/usta");
  return { ok: true };
}

export async function sellerOnboardingAction(_: unknown, formData: FormData) {
  const parsed = sellerOnboardingSchema.safeParse({
    sellerType: formData.get("sellerType"),
    headline: formData.get("headline"),
    bio: formData.get("bio"),
    cityId: formData.get("cityId"),
    districtId: formData.get("districtId") || null,
    phone: formData.get("phone") || null,
    categoryIds: formData.getAll("categoryIds").filter(Boolean),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  if (
    (parsed.data.sellerType === "service" || parsed.data.sellerType === "both") &&
    parsed.data.categoryIds.length === 0
  ) {
    return { error: "En az bir hizmet seçin" };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("request_seller_role", {
    p_seller_type: parsed.data.sellerType,
    p_headline: parsed.data.headline,
    p_bio: parsed.data.bio,
    p_city_id: parsed.data.cityId,
    p_district_id: parsed.data.districtId ?? null,
    p_phone: parsed.data.phone ?? null,
    p_category_ids: parsed.data.categoryIds,
  });
  if (error) return { error: error.message };
  await persistDeskCookie("seller");
  revalidatePath("/", "layout");
  revalidatePath("/satici");
  redirect("/satici");
}

export async function setSellerCategoriesAction(_: unknown, formData: FormData) {
  const ids = formData.getAll("categoryIds").map(String).filter(Boolean);
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_seller_categories", {
    p_category_ids: ids,
  });
  if (error) return { error: error.message };
  revalidatePath("/satici");
  revalidatePath("/satici/ilanlar");
  revalidatePath("/satici/hizmetlerim");
  revalidatePath("/usta");
  return { ok: true };
}

export async function sendMessageAction(_: unknown, formData: FormData) {
  const parsed = messageSchema.safeParse({
    conversationId: formData.get("conversationId"),
    body: formData.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Boş mesaj" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("send_message", {
    p_conversation_id: parsed.data.conversationId,
    p_body: parsed.data.body,
  });
  if (error) return { error: error.message };
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    after(() =>
      sendNewMessageEmail({
        conversationId: parsed.data.conversationId,
        senderId: user.id,
        body: parsed.data.body,
      }),
    );
  }
  revalidatePath(`/mesajlar/${parsed.data.conversationId}`);
  return { ok: true };
}

export async function markConversationReadAction(conversationId: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_conversation_read", {
    p_conversation_id: conversationId,
  });
  if (error) return { error: error.message };
  return { ok: true };
}

export async function reviewSellerAction(userId: string, approve: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("review_seller", {
    p_user_id: userId,
    p_approve: approve,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/kullanicilar");
  revalidatePath(`/admin/kullanicilar/${userId}`);
  return { ok: true };
}

export async function grantBalanceAction(_: unknown, formData: FormData) {
  const parsed = grantBalanceSchema.safeParse({
    userId: formData.get("userId"),
    amount: formData.get("amount"),
    kind: formData.get("kind"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("grant_balance", {
    p_user_id: parsed.data.userId,
    p_amount: parsed.data.amount,
    p_kind: parsed.data.kind,
    p_note: parsed.data.note ?? null,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/cuzdan");
  revalidatePath(`/admin/kullanicilar/${parsed.data.userId}`);
  return { ok: true };
}

export async function updateProfileAction(_: unknown, formData: FormData) {
  const parsed = profileUpdateSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    bio: formData.get("bio"),
    cityId: formData.get("cityId"),
    districtId: formData.get("districtId"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum gerekli" };
  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.fullName,
      display_name: parsed.data.fullName,
      phone: parsed.data.phone ?? null,
      bio: parsed.data.bio ?? null,
      city_id: parsed.data.cityId,
      district_id: parsed.data.districtId,
    })
    .eq("id", user.id);
  if (error) return { error: error.message };
  revalidatePath("/hesabim");
  revalidatePath("/hesabim/profil");
  revalidatePath("/satici/ilanlar");
  return { ok: true };
}

export async function saveAvatarUrlAction(url: string | null) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum gerekli" };
  if (url) {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
    const allowed = `${base}/storage/v1/object/public/avatars/${user.id}/`;
    if (!url.split("?")[0].startsWith(allowed)) return { error: "Geçersiz görsel" };
  }
  const { error } = await supabase.from("profiles").update({ avatar_url: url }).eq("id", user.id);
  if (error) return { error: error.message };
  const { data: p } = await supabase.from("profiles").select("slug").eq("id", user.id).maybeSingle();
  revalidatePath("/hesabim");
  revalidatePath("/hesabim/profil");
  revalidatePath("/admin/kullanicilar");
  if (p?.slug) revalidatePath(`/usta/${p.slug}`);
  return { ok: true };
}

export async function adminUpdateUserAction(_: unknown, formData: FormData) {
  const parsed = adminUserUpdateSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
    sellerStatus: formData.get("sellerStatus"),
    sellerType: formData.get("sellerType"),
    fullName: formData.get("fullName"),
    displayName: formData.get("displayName"),
    phone: formData.get("phone"),
    bio: formData.get("bio"),
    sellerHeadline: formData.get("sellerHeadline"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Oturum gerekli" };
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") return { error: "Yetkisiz" };
  const { error } = await supabase
    .from("profiles")
    .update({
      role: parsed.data.role,
      seller_status: parsed.data.sellerStatus ?? null,
      seller_type: parsed.data.sellerType ?? null,
      full_name: parsed.data.fullName,
      display_name: parsed.data.displayName,
      phone: parsed.data.phone ?? null,
      bio: parsed.data.bio ?? null,
      seller_headline: parsed.data.sellerHeadline ?? null,
    })
    .eq("id", parsed.data.userId);
  if (error) return { error: error.message };
  revalidatePath("/admin/kullanicilar");
  revalidatePath(`/admin/kullanicilar/${parsed.data.userId}`);
  return { ok: true };
}

export async function updateSettingsAction(_: unknown, formData: FormData) {
  const parsed = bidFeeSettingsSchema.safeParse({
    bidFeeAmount: formData.get("bidFeeAmount"),
    newSellerCreditAmount: formData.get("newSellerCreditAmount"),
    newSellerDiscountPercent: formData.get("newSellerDiscountPercent"),
    newSellerDiscountedOfferCount: formData.get("newSellerDiscountedOfferCount"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("update_platform_settings", {
    p_bid_fee: parsed.data.bidFeeAmount,
    p_new_credit: parsed.data.newSellerCreditAmount,
    p_discount: parsed.data.newSellerDiscountPercent,
    p_offer_count: parsed.data.newSellerDiscountedOfferCount,
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/ayarlar");
  return { ok: true };
}

export async function createCampaignAction(_: unknown, formData: FormData) {
  const parsed = promoCampaignSchema.safeParse({
    name: formData.get("name"),
    creditAmount: formData.get("creditAmount"),
    bidFeeDiscountPercent: formData.get("bidFeeDiscountPercent"),
    discountedOfferCount: formData.get("discountedOfferCount"),
    maxRedemptions: formData.get("maxRedemptions") || null,
    isActive: true,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  const supabase = await createClient();
  const { error } = await supabase.from("promo_campaigns").insert({
    name: parsed.data.name,
    credit_amount: parsed.data.creditAmount,
    bid_fee_discount_percent: parsed.data.bidFeeDiscountPercent,
    discounted_offer_count: parsed.data.discountedOfferCount,
    max_redemptions: parsed.data.maxRedemptions ?? null,
    is_active: true,
    apply_on: "seller_approval",
  });
  if (error) return { error: error.message };
  revalidatePath("/admin/kampanyalar");
  return { ok: true };
}

export async function createTopupAction(amount: number) {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_topup_payment", { p_amount: amount });
  if (error) return { error: error.message };
  return {
    error: `Ödeme kaydı oluşturuldu (${data}). iyzico anahtarları yok: bakiyeyi admin panelinden yükleyin veya IYZICO_API_KEY ekleyin.`,
    paymentId: data,
  };
}

export async function upsertCategoryAction(_: unknown, formData: FormData) {
  const parsed = categorySchema.safeParse({
    kind: formData.get("kind"),
    name: formData.get("name"),
    isFeatured: formData.get("isFeatured") === "on",
    sortOrder: formData.get("sortOrder") || 0,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Geçersiz form" };
  const seo = buildCategorySeo(parsed.data.name, parsed.data.kind);
  const supabase = await createClient();
  const id = String(formData.get("id") || "");
  let slug = seo.slug;
  if (id) {
    const { data: existing } = await supabase.from("categories").select("slug").eq("id", id).maybeSingle();
    if (existing?.slug) slug = existing.slug;
  } else {
    const { data: clash } = await supabase
      .from("categories")
      .select("id")
      .eq("kind", parsed.data.kind)
      .eq("slug", slug)
      .maybeSingle();
    if (clash) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
  }
  const payload = {
    kind: parsed.data.kind,
    name: parsed.data.name,
    slug,
    h1: seo.h1,
    meta_title: seo.metaTitle,
    meta_description: seo.metaDescription,
    content: seo.content,
    faq: seo.faq,
    is_featured: parsed.data.isFeatured,
    sort_order: parsed.data.sortOrder,
  };
  const { error } = id
    ? await supabase.from("categories").update(payload).eq("id", id)
    : await supabase.from("categories").insert(payload);
  if (error) return { error: error.message };
  revalidatePath("/admin/kategoriler");
  revalidatePath("/");
  revalidatePath("/hizmetler");
  revalidatePath("/urunler");
  return { ok: true };
}

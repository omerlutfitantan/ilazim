import { cache } from "react";
import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import type { AdminIntegrations } from "@/lib/integration-types";

export type { AdminIntegrations };

export type PublicSiteTags = {
  gaMeasurementId: string | null;
  gtmContainerId: string | null;
  googleAdsId: string | null;
  googleSiteVerification: string | null;
};

type IntegrationSecrets = {
  emailFrom: string | null;
  resendApiKey: string | null;
  shopierPat: string | null;
  shopierShopSlug: string | null;
  shopierOsbUsername: string | null;
  shopierOsbPassword: string | null;
};

function firstText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return null;
}

const emptyTags: PublicSiteTags = {
  gaMeasurementId: null,
  gtmContainerId: null,
  googleAdsId: null,
  googleSiteVerification: null,
};

export const getPublicSiteTags = cache(async (): Promise<PublicSiteTags> => {
  if (!isSupabaseConfigured()) return emptyTags;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_public_site_tags");
    if (error || !data) return emptyTags;
    const row = Array.isArray(data) ? data[0] : data;
    if (!row || typeof row !== "object") return emptyTags;
    const typed = row as {
      ga_measurement_id?: string | null;
      gtm_container_id?: string | null;
      google_ads_id?: string | null;
      google_site_verification?: string | null;
    };
    return {
      gaMeasurementId: firstText(typed.ga_measurement_id),
      gtmContainerId: firstText(typed.gtm_container_id),
      googleAdsId: firstText(typed.google_ads_id),
      googleSiteVerification: firstText(typed.google_site_verification),
    };
  } catch {
    return emptyTags;
  }
});

export const getAdminIntegrations = cache(async (): Promise<AdminIntegrations | null> => {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.rpc("get_admin_integrations");
    if (error || !data || typeof data !== "object" || Array.isArray(data)) return null;
    const row = data as Partial<AdminIntegrations>;
    return {
      email_from: row.email_from ?? null,
      resend_api_key_set: Boolean(row.resend_api_key_set),
      shopier_pat_set: Boolean(row.shopier_pat_set),
      shopier_shop_slug_set: Boolean(row.shopier_shop_slug_set),
      shopier_shop_slug: (row as any).shopier_shop_slug ?? null,
      shopier_osb_username_set: Boolean((row as any).shopier_osb_username_set),
      shopier_osb_password_set: Boolean((row as any).shopier_osb_password_set),
      ga_measurement_id: row.ga_measurement_id ?? null,
      gtm_container_id: row.gtm_container_id ?? null,
      google_ads_id: row.google_ads_id ?? null,
      google_site_verification: row.google_site_verification ?? null,
    };
  } catch {
    return null;
  }
});

const getSecretRow = cache(async (): Promise<IntegrationSecrets | null> => {
  if (!isSupabaseConfigured() || !process.env.SUPABASE_SERVICE_ROLE_KEY) return null;
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("site_integrations")
      .select("email_from, resend_api_key, shopier_pat, shopier_shop_slug, shopier_osb_username, shopier_osb_password")
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      emailFrom: data.email_from,
      resendApiKey: data.resend_api_key,
      shopierPat: data.shopier_pat,
      shopierShopSlug: data.shopier_shop_slug,
      shopierOsbUsername: data.shopier_osb_username,
      shopierOsbPassword: data.shopier_osb_password,
    };
  } catch {
    return null;
  }
});

export async function getEmailConfig() {
  const row = await getSecretRow();
  return {
    apiKey: firstText(row?.resendApiKey, process.env.RESEND_API_KEY),
    from: firstText(row?.emailFrom, process.env.EMAIL_FROM) ?? "Talepik <noreply@ilazim.online>",
  };
}

export async function getPaymentConfig() {
  const row = await getSecretRow();
  return {
    pat: firstText(row?.shopierPat, process.env.SHOPIER_PAT),
    shopSlug: firstText(row?.shopierShopSlug, process.env.SHOPIER_SHOP_SLUG),
    osbUsername: firstText(row?.shopierOsbUsername, process.env.SHOPIER_OSB_USERNAME),
    osbPassword: firstText(row?.shopierOsbPassword, process.env.SHOPIER_OSB_PASSWORD),
  };
}

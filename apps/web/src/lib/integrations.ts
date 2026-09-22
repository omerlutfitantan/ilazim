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
  whopApiKey: string | null;
  whopCompanyId: string | null;
  whopWebhookSecret: string | null;
  whopProductId: string | null;
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
      whop_api_key_set: Boolean(row.whop_api_key_set),
      whop_company_id: row.whop_company_id ?? null,
      whop_webhook_secret_set: Boolean(row.whop_webhook_secret_set),
      whop_product_id: row.whop_product_id ?? null,
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
      .select(
        "email_from, resend_api_key, whop_api_key, whop_company_id, whop_webhook_secret, whop_product_id",
      )
      .eq("id", 1)
      .maybeSingle();
    if (error || !data) return null;
    return {
      emailFrom: data.email_from,
      resendApiKey: data.resend_api_key,
      whopApiKey: (data as { whop_api_key?: string | null }).whop_api_key ?? null,
      whopCompanyId: (data as { whop_company_id?: string | null }).whop_company_id ?? null,
      whopWebhookSecret:
        (data as { whop_webhook_secret?: string | null }).whop_webhook_secret ?? null,
      whopProductId: (data as { whop_product_id?: string | null }).whop_product_id ?? null,
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
    apiKey: firstText(row?.whopApiKey, process.env.WHOP_API_KEY),
    companyId: firstText(row?.whopCompanyId, process.env.WHOP_COMPANY_ID),
    webhookSecret: firstText(row?.whopWebhookSecret, process.env.WHOP_WEBHOOK_SECRET),
    productId: firstText(row?.whopProductId, process.env.WHOP_PRODUCT_ID),
  };
}

export type AdminIntegrations = {
  email_from: string | null;
  resend_api_key_set: boolean;
  whop_api_key_set: boolean;
  whop_company_id: string | null;
  whop_webhook_secret_set: boolean;
  whop_product_id: string | null;
  ga_measurement_id: string | null;
  gtm_container_id: string | null;
  google_ads_id: string | null;
  google_site_verification: string | null;
};

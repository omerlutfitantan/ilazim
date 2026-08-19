export type AdminIntegrations = {
  email_from: string | null;
  resend_api_key_set: boolean;
  shopier_pat_set: boolean;
  shopier_shop_slug_set: boolean;
  shopier_shop_slug: string | null;
  shopier_osb_username_set: boolean;
  shopier_osb_password_set: boolean;
  ga_measurement_id: string | null;
  gtm_container_id: string | null;
  google_ads_id: string | null;
  google_site_verification: string | null;
};

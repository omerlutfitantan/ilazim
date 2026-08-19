import { getPaymentConfig } from "@/lib/integrations";

export type CheckoutInput = {
  paymentId: string;
  amount: number;
  userId: string;
  email?: string;
};

export type CheckoutResult = {
  provider: "shopier" | "manual";
  redirectUrl?: string;
  token?: string;
  configured: boolean;
  message: string;
};

export async function isShopierConfigured() {
  const cfg = await getPaymentConfig();
  return Boolean(cfg.pat && cfg.shopSlug && cfg.webhookToken);
}

/** Anahtar yoksa ödeme kaydı oluşur; bakiyeyi admin yükler. */
export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  if (!(await isShopierConfigured())) {
    return {
      provider: "manual",
      configured: false,
      message:
        "Kart ödemesi henüz açık değil. Ödeme kaydı oluştu; bakiyeyi admin panelinden yükleyin.",
    };
  }
  return {
    provider: "shopier",
    configured: true,
    redirectUrl: `/api/payments/shopier/checkout?paymentId=${encodeURIComponent(input.paymentId)}`,
    message: `Shopier ile ödeme hazırlanıyor (${input.paymentId}).`,
  };
}

import { getPaymentConfig } from "@/lib/integrations";

export type CheckoutInput = {
  paymentId: string;
  amount: number;
  userId: string;
  email?: string;
};

export type CheckoutResult = {
  provider: "iyzico" | "manual";
  redirectUrl?: string;
  token?: string;
  configured: boolean;
  message: string;
};

export async function isIyzicoConfigured() {
  const cfg = await getPaymentConfig();
  return Boolean(cfg.apiKey && cfg.secretKey);
}

/** Anahtar yoksa ödeme kaydı oluşur; bakiyeyi admin yükler. */
export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  if (!(await isIyzicoConfigured())) {
    return {
      provider: "manual",
      configured: false,
      message:
        "Kart ödemesi henüz açık değil. Ödeme kaydı oluştu; bakiyeyi admin panelinden yükleyin.",
    };
  }
  return {
    provider: "iyzico",
    configured: true,
    message: `Ödeme hazırlanıyor (${input.paymentId}).`,
  };
}

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

export function isIyzicoConfigured() {
  return Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY);
}

/** Anahtar yoksa ödeme kaydı oluşur; bakiyeyi admin yükler. */
export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  if (!isIyzicoConfigured()) {
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

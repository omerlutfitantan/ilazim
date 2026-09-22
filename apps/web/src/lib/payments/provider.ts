import { WhopClient } from "@whop/sdk";
import { getPaymentConfig } from "@/lib/integrations";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/utils";

export type CheckoutInput = {
  paymentId: string;
  amount: number;
  userId: string;
  email?: string;
};

export type CheckoutResult = {
  provider: "whop" | "manual";
  redirectUrl?: string;
  configured: boolean;
  message: string;
};

export async function isWhopConfigured() {
  const cfg = await getPaymentConfig();
  return Boolean(cfg.apiKey && cfg.companyId);
}

function createWhopClient(apiKey: string) {
  return new WhopClient({
    token: apiKey,
    apiVersionDate: "2026-09-15",
  });
}

/** Anahtar yoksa ödeme kaydı oluşur; bakiyeyi admin yükler. */
export async function createCheckout(input: CheckoutInput): Promise<CheckoutResult> {
  const cfg = await getPaymentConfig();
  if (!cfg.apiKey || !cfg.companyId) {
    return {
      provider: "manual",
      configured: false,
      message:
        "Kart ödemesi henüz açık değil. Ödeme kaydı oluştu; bakiyeyi admin panelinden yükleyin.",
    };
  }

  try {
    const client = createWhopClient(cfg.apiKey);
    const returnUrl = `${siteUrl()}/satici/cuzdan?paid=1`;

    const checkout = await client.checkoutConfigurations.create({
      account_id: cfg.companyId,
      mode: "payment",
      redirect_url: returnUrl,
      metadata: {
        payment_id: input.paymentId,
        user_id: input.userId,
      },
      plan: {
        account_id: cfg.companyId,
        ...(cfg.productId ? { product_id: cfg.productId } : {}),
        initial_price: Number(input.amount),
        currency: "try",
        plan_type: "one_time",
        title: `Talepik cüzdan — ${input.amount} TL`,
        description: "Satıcı cüzdan bakiyesi yükleme",
        visibility: "hidden",
        force_create_new_plan: true,
      },
    });

    const purchaseUrl = checkout.purchase_url;
    if (!purchaseUrl) {
      return {
        provider: "manual",
        configured: false,
        message: "Whop ödeme bağlantısı oluşturulamadı.",
      };
    }

    const admin = createAdminClient();
    await admin
      .from("payments")
      .update({
        provider_ref: checkout.id,
        checkout_payload: {
          whop_checkout_id: checkout.id,
          whop_plan_id: checkout.plan?.id ?? null,
          purchase_url: purchaseUrl,
        },
      })
      .eq("id", input.paymentId);

    return {
      provider: "whop",
      configured: true,
      redirectUrl: purchaseUrl,
      message: `Whop ile ödeme hazır (${input.paymentId}).`,
    };
  } catch (err) {
    console.error("[whop/checkout]", err);
    const msg = err instanceof Error ? err.message : "Whop checkout hatası";
    return {
      provider: "manual",
      configured: false,
      message: `Ödeme başlatılamadı: ${msg}`,
    };
  }
}

export { createWhopClient };

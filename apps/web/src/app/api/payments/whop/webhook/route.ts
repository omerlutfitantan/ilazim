import { NextRequest, NextResponse } from "next/server";
import { unwrapWebhook } from "@whop/sdk/helpers";
import { getPaymentConfig } from "@/lib/integrations";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Whop webhook — payment.succeeded → apply_topup
 *
 * Dashboard → Developer → Webhooks:
 *   URL: https://ilazim.online/api/payments/whop/webhook
 *   Events: payment.succeeded
 *   API version: v1
 */
export async function POST(request: NextRequest) {
  const cfg = await getPaymentConfig();
  if (!cfg.webhookSecret) {
    return new NextResponse("missing webhook secret", { status: 503 });
  }

  const payload = await request.text();
  const headers = Object.fromEntries(request.headers);

  let event: { type?: string; data?: Record<string, unknown> };
  try {
    event = unwrapWebhook(payload, {
      headers,
      key: cfg.webhookSecret,
    }) as { type?: string; data?: Record<string, unknown> };
  } catch (err) {
    console.error("[whop/webhook] signature failed:", err);
    return new NextResponse("unauthorized", { status: 401 });
  }

  if (event.type !== "payment.succeeded") {
    return new NextResponse("OK", { status: 200 });
  }

  const data = event.data ?? {};
  const metadata = (data.metadata ?? {}) as Record<string, unknown>;
  const paymentId = String(metadata.payment_id ?? "").trim();
  const whopPaymentId = String(data.id ?? "").trim();

  const admin = createAdminClient();

  let targetId = paymentId;
  if (!targetId && whopPaymentId) {
    const { data: pay } = await admin
      .from("payments")
      .select("id")
      .eq("provider_ref", whopPaymentId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    targetId = pay?.id ?? "";
  }

  // checkout id (ch_...) provider_ref'te olabilir
  if (!targetId && metadata.payment_id == null) {
    // no-op
  }

  if (!targetId) {
    console.warn("[whop/webhook] payment_id missing in metadata", {
      whopPaymentId,
      metadata,
    });
    return new NextResponse("OK", { status: 200 });
  }

  try {
    await admin.rpc("apply_topup", { p_payment_id: targetId });
    if (whopPaymentId) {
      await admin
        .from("payments")
        .update({
          provider_ref: whopPaymentId,
          checkout_payload: {
            whop_payment_id: whopPaymentId,
            amount_after_fees: data.amount_after_fees ?? null,
            currency: data.currency ?? null,
          },
        })
        .eq("id", targetId);
    }
  } catch (err) {
    console.error("[whop/webhook] apply_topup failed:", err);
  }

  return new NextResponse("OK", { status: 200 });
}

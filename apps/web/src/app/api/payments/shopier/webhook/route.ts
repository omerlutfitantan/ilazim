import { NextRequest, NextResponse } from "next/server";
import { verifyAndParseWebhook } from "@nopeion/shopier";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentConfig } from "@/lib/integrations";

function looksLikeUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function POST(request: NextRequest) {
  const cfg = await getPaymentConfig();
  if (!cfg.webhookToken) {
    return NextResponse.json({ error: "Shopier webhook token yok" }, { status: 503 });
  }

  const rawBody = Buffer.from(await request.arrayBuffer());
  const event = verifyAndParseWebhook({
    webhookToken: cfg.webhookToken,
    headers: request.headers,
    body: rawBody,
  });

  if (!event) {
    return NextResponse.json({ ok: true });
  }

  // Tip isimleri Shopier tarafında değişebilir; en sık görülenleri kapsıyoruz.
  const allowedTypes = new Set([
    "order.created",
    "order.paid",
    "order.fulfilled",
    "payment.succeeded",
  ]);
  if (!allowedTypes.has(event.type)) return NextResponse.json({ ok: true });

  const data: any = event.data ?? {};
  const orderId = String(data.platform_order_id ?? data.orderId ?? "");
  if (!orderId || !looksLikeUuid(orderId)) return NextResponse.json({ ok: true });

  const status = String(data.status ?? data.payment_status ?? "");
  const okStatuses = new Set(["success", "paid", "completed"]);
  if (status && !okStatuses.has(status)) return NextResponse.json({ ok: true });

  const admin = createAdminClient();
  try {
    const { error } = await admin.rpc("apply_topup", { p_payment_id: orderId });
    if (error) {
      // Idempotency: aynı callback tekrar gelirse veya ödeme zaten tamamlandıysa sorun olmaz.
      // apply_topup hata fırlatırsa retry edeceğini varsayıp boş dönüyoruz.
    }
  } catch {
    // ignore
  }

  return NextResponse.json({ ok: true });
}


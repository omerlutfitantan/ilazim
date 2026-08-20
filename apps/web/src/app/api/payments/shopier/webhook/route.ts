import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentConfig } from "@/lib/integrations";
import { reconcileShopierTopupsForUser } from "@/lib/payments/shopier-reconcile";

function looksLikeUuid(id: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Shopier OSB (Otomatik Sipariş Bildirimi) endpoint'i.
 *
 * Shopier, sipariş tamamlandığında bu URL'e şunu gönderir:
 *   POST res=<base64 JSON>  &  hash=<HMAC-SHA256>
 *
 * Doğrulama:
 *   expectedHash = HMAC-SHA256(res + osbUsername, osbPassword)
 *
 * Eşleme:
 *   - productid UUID ise → doğrudan payments.id
 *   - değilse (Shopier ürün id) → payments.provider_ref
 *   - yoksa customer_note / custom note içindeki UUID
 *
 * Başarıda tam olarak "success" metni dönmemiz gerekiyor.
 */
export async function POST(request: NextRequest) {
  const cfg = await getPaymentConfig();
  if (!cfg.osbUsername || !cfg.osbPassword) {
    return new NextResponse("missing config", { status: 503 });
  }

  let body: URLSearchParams;
  try {
    const text = await request.text();
    body = new URLSearchParams(text);
  } catch {
    return new NextResponse("bad request", { status: 400 });
  }

  const res = body.get("res") ?? "";
  const hash = body.get("hash") ?? "";

  if (!res || !hash) {
    return new NextResponse("missing parameter", { status: 400 });
  }

  const expectedHash = createHmac("sha256", cfg.osbPassword)
    .update(res + cfg.osbUsername)
    .digest("hex");

  if (expectedHash !== hash) {
    return new NextResponse("unauthorized", { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    const decoded = Buffer.from(res, "base64").toString("utf8");
    payload = JSON.parse(decoded) as Record<string, unknown>;
  } catch {
    return new NextResponse("bad payload", { status: 400 });
  }

  if (payload.istest === 1 || payload.istest === "1") {
    return new NextResponse("success");
  }

  const admin = createAdminClient();
  const productId = String(payload.productid ?? payload.product_id ?? "").trim();
  const note = String(
    payload.customer_note ?? payload.customernote ?? payload.note ?? "",
  ).trim();

  let paymentId: string | null = null;

  if (productId && looksLikeUuid(productId)) {
    paymentId = productId;
  } else if (note && looksLikeUuid(note)) {
    paymentId = note;
  } else if (productId) {
    const { data: pay } = await admin
      .from("payments")
      .select("id")
      .eq("provider_ref", productId)
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    paymentId = pay?.id ?? null;
  }

  if (!paymentId) {
    // Bizim dışımızdaki siparişler — Shopier retry etmesin
    return new NextResponse("success");
  }

  const { data: paymentRow } = await admin
    .from("payments")
    .select("user_id")
    .eq("id", paymentId)
    .maybeSingle();

  try {
    await admin.rpc("apply_topup", { p_payment_id: paymentId });
  } catch (err) {
    console.error("[shopier/webhook] apply_topup failed:", err);
    if (paymentRow?.user_id) {
      await reconcileShopierTopupsForUser(paymentRow.user_id);
    }
  }

  return new NextResponse("success");
}

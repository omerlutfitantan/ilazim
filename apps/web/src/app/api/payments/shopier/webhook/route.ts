import { NextRequest, NextResponse } from "next/server";
import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentConfig } from "@/lib/integrations";

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
 * JSON payload içindeki `productid` alanı bizim ödeme kaydı UUID'imiz.
 * Başarıda tam olarak "success" metni dönmemiz gerekiyor.
 */
export async function POST(request: NextRequest) {
  const cfg = await getPaymentConfig();
  if (!cfg.osbUsername || !cfg.osbPassword) {
    // Credentials henüz tanımlı değil; isteği reddet
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

  // HMAC-SHA256(res + username, password)
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

  // Test siparişlerini atla
  if (payload.istest === 1 || payload.istest === "1") {
    return new NextResponse("success");
  }

  // productid = ödeme kaydı UUID'imiz
  const orderId = String(payload.productid ?? "");
  if (!orderId || !looksLikeUuid(orderId)) {
    // Bizim dışımızdaki siparişler — yoksay ama success döndür
    return new NextResponse("success");
  }

  const admin = createAdminClient();
  try {
    // apply_topup idempotent: aynı payment_id tekrar gelirse zaten tamamlandı döner
    await admin.rpc("apply_topup", { p_payment_id: orderId });
  } catch {
    // Loglama yapılabilir; Shopier retry edeceği için success dönmeye devam ediyoruz
  }

  return new NextResponse("success");
}

import { NextRequest, NextResponse } from "next/server";
import { getPaymentConfig } from "@/lib/integrations";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  const { secretKey: secret } = await getPaymentConfig();
  if (!secret) {
    return NextResponse.json({ error: "Sağlayıcı yok" }, { status: 503 });
  }
  const body = await request.json().catch(() => null);
  const paymentId = body?.paymentId ?? body?.conversationId;
  if (!paymentId || typeof paymentId !== "string") {
    return NextResponse.json({ error: "paymentId gerekli" }, { status: 400 });
  }
  const admin = createAdminClient();
  const { error } = await admin.rpc("apply_topup", { p_payment_id: paymentId });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

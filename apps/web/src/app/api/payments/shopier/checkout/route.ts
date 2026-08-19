import { NextRequest, NextResponse } from "next/server";
import { ShopierApiClient, ShopierPaymentFlow } from "@nopeion/shopier";
import { getPaymentConfig } from "@/lib/integrations";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");
  if (!paymentId) return NextResponse.json({ error: "paymentId gerekli" }, { status: 400 });

  const cfg = await getPaymentConfig();
  if (!cfg.pat || !cfg.shopSlug) {
    return NextResponse.json({ error: "Shopier yapılandırılmadı" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .select("id, user_id, amount, status")
    .eq("id", paymentId)
    .maybeSingle();

  if (payErr || !payment) {
    return NextResponse.json({ error: "Ödeme bulunamadı" }, { status: 404 });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.id !== payment.user_id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  if (payment.status !== "pending") {
    return NextResponse.json({ error: "Ödeme durumu uygun değil" }, { status: 409 });
  }

  try {
    const client = new ShopierApiClient({ pat: cfg.pat });
    const flow = new ShopierPaymentFlow({ client });

    // Shopier SVG kabul etmiyor; public/logo.png (200x200 PNG) kullanıyoruz.
    const logoUrl = `${siteUrl()}/logo.png`;
    const paymentLink = await flow.createPaymentLink({
      title: "Cüzdan yükleme",
      amount: String(Math.round(Number(payment.amount))),
      currency: "TRY",
      media: [{ type: "image" as const, url: logoUrl, placement: 1 }],
      orderId: payment.id,
      hostedCheckout: true,
      shopSlug: cfg.shopSlug,
    });

    return new NextResponse(paymentLink.checkoutHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // ShopierApiError'dan status + body al
    const status = (err as Record<string, unknown>)?.status;
    const body = (err as Record<string, unknown>)?.body;
    console.error("[shopier/checkout] error:", msg, "status:", status, "body:", JSON.stringify(body));
    return NextResponse.json(
      { error: "Shopier checkout başlatılamadı", detail: msg, status, body },
      { status: 502 }
    );
  }
}

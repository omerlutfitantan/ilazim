import { NextRequest, NextResponse } from "next/server";
import { ShopierApiClient, ShopierPaymentFlow } from "@nopeion/shopier";
import { getPaymentConfig } from "@/lib/integrations";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { siteUrl } from "@/lib/utils";

/**
 * Shopier checkout — kalıcı strateji:
 * Hosted checkout HTML (/s/shipping/{slug}) dinamik/custom ürünlerde
 * "ürün bulunamıyor" veriyor. Bunun yerine ürünü API ile oluşturup
 * product.url'e 302 yönlendiriyoruz (Shopier ürün ödeme sayfası).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const paymentId = searchParams.get("paymentId");
  if (!paymentId) return NextResponse.json({ error: "paymentId gerekli" }, { status: 400 });

  const cfg = await getPaymentConfig();
  if (!cfg.pat) {
    return NextResponse.json({ error: "Shopier yapılandırılmadı" }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: payment, error: payErr } = await supabase
    .from("payments")
    .select("id, user_id, amount, status, provider_ref")
    .eq("id", paymentId)
    .maybeSingle();

  if (payErr || !payment) {
    return NextResponse.json({ error: "Ödeme bulunamadı" }, { status: 404 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || user.id !== payment.user_id) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  if (payment.status !== "pending") {
    return NextResponse.json({ error: "Ödeme durumu uygun değil" }, { status: 409 });
  }

  try {
    // Daha önce oluşturulmuş ürün varsa tekrar oluşturma
    if (payment.provider_ref) {
      return NextResponse.redirect(`https://www.shopier.com/${payment.provider_ref}`, 302);
    }

    const client = new ShopierApiClient({ pat: cfg.pat });
    const flow = new ShopierPaymentFlow({ client });

    const logoUrl = `${siteUrl()}/logo.png`;
    const amount = String(Math.round(Number(payment.amount)));
    const short = payment.id.slice(0, 8);

    // hostedCheckout: false — shipping form yerine doğrudan ürün sayfası
    const paymentLink = await flow.createPaymentLink({
      title: `Cüzdan yükleme ${amount} TL (#${short})`,
      description: `Talepik cüzdan yükleme. Ödeme ref: ${payment.id}`,
      amount,
      currency: "TRY",
      media: [{ type: "image" as const, url: logoUrl, placement: 1 }],
      customNote: payment.id,
      productType: "digital",
      customListing: true,
      stockQuantity: 1,
      hostedCheckout: false,
    });

    const productId = String(paymentLink.productId);
    const paymentUrl = paymentLink.paymentUrl || `https://www.shopier.com/${productId}`;

    // OSB productid eşlemesi için provider_ref'e Shopier ürün id'sini yaz
    const admin = createAdminClient();
    await admin
      .from("payments")
      .update({
        provider_ref: productId,
        checkout_payload: {
          shopier_product_id: productId,
          payment_url: paymentUrl,
        },
      })
      .eq("id", payment.id)
      .eq("status", "pending");

    return NextResponse.redirect(paymentUrl, 302);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    const status = (err as Record<string, unknown>)?.status;
    const body = (err as Record<string, unknown>)?.body;
    console.error("[shopier/checkout] error:", msg, "status:", status, "body:", JSON.stringify(body));
    return NextResponse.json(
      { error: "Shopier checkout başlatılamadı", detail: msg, status, body },
      { status: 502 },
    );
  }
}

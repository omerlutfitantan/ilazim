import Link from "next/link";
import { getSettings } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/settings-form";

export default async function Page() {
  const settings = await getSettings();
  const supabase = await createClient();
  const { data: activeCampaigns } = await supabase
    .from("promo_campaigns")
    .select("id, name, credit_amount, bid_fee_discount_percent, discounted_offer_count")
    .eq("is_active", true)
    .eq("apply_on", "seller_approval");

  const s = settings ?? {
    bid_fee_amount: 29.9,
    new_seller_welcome_balance: 100,
    new_seller_discount_percent: 50,
    new_seller_discounted_offer_count: 5,
  };
  const cashOnly = s.new_seller_discount_percent === 0 && s.new_seller_discounted_offer_count === 0;
  const freeOffers =
    s.bid_fee_amount > 0
      ? Math.floor(Number(s.new_seller_welcome_balance) / Number(s.bid_fee_amount))
      : 0;

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl">Platform ayarları</h1>
      <p className="mb-6 max-w-xl text-sm text-muted-foreground">
        Tek birim: nakit cüzdan bakiyesi. Teklif ücreti her teklifte bakiyeden düşülür.
      </p>
      {cashOnly && (
        <p className="mb-4 max-w-xl rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm leading-6">
          Hoş geldin bakiyesi: onay sonrası{" "}
          <strong>{Number(s.new_seller_welcome_balance).toFixed(2)} TL</strong> nakit yüklenir — sabit ücret{" "}
          <strong>{Number(s.bid_fee_amount).toFixed(2)} TL</strong> ile yaklaşık{" "}
          <strong>{freeOffers} teklif</strong> karşılanır.
        </p>
      )}
      {(activeCampaigns ?? []).length > 0 &&
        (Number(s.new_seller_discount_percent) > 0 || Number(s.new_seller_discounted_offer_count) > 0) && (
          <p className="mb-4 max-w-xl rounded-2xl border border-amber-500/40 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-950">
            Aktif kampanya var; indirim/adet açıkken kampanya değerleri birleştirilir.{" "}
            <Link href="/admin/kampanyalar" className="underline underline-offset-4">
              Kampanyalar
            </Link>
          </p>
        )}
      <SettingsForm settings={s} />
    </div>
  );
}

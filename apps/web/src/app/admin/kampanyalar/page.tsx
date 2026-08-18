import { getSettings } from "@/lib/data";
import { SettingsForm } from "@/components/settings-form";

export default async function Page() {
  const settings = await getSettings();
  const s = settings ?? {
    bid_fee_amount: 29.9,
    new_seller_welcome_balance: 100,
    new_seller_discount_percent: 50,
    new_seller_discounted_offer_count: 5,
  };
  const welcome = Number(s.new_seller_welcome_balance);
  const fee = Number(s.bid_fee_amount);
  const cashOnly = s.new_seller_discount_percent === 0 && s.new_seller_discounted_offer_count === 0;
  const freeOffers = Number.isFinite(welcome) && fee > 0 ? Math.floor(welcome / fee) : 0;

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl">Kampanyalar</h1>
      <p className="mb-6 max-w-xl text-sm text-muted-foreground">
        Teklif ücreti, hoş geldin bakiyesi ve isteğe bağlı yüzde indirim. Onaylanan her satıcıya
        uygulanır.
      </p>
      {cashOnly && (
        <p className="mb-4 max-w-xl rounded-2xl border border-accent/40 bg-accent/10 px-4 py-3 text-sm leading-6">
          Hoş geldin bakiyesi: onay sonrası{" "}
          <strong>{Number.isFinite(welcome) ? welcome.toFixed(2) : "0.00"} TL</strong> nakit yüklenir —
          sabit ücret <strong>{Number.isFinite(fee) ? fee.toFixed(2) : "0.00"} TL</strong> ile yaklaşık{" "}
          <strong>{freeOffers} teklif</strong> karşılanır.
        </p>
      )}
      <SettingsForm settings={s} />
    </div>
  );
}

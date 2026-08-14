import { getSettings } from "@/lib/data";
import { SettingsForm } from "@/components/settings-form";

export default async function Page() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Platform ayarları</h1>
      <SettingsForm
        settings={
          settings ?? {
            bid_fee_amount: 29.9,
            new_seller_credit_amount: 100,
            new_seller_discount_percent: 50,
            new_seller_discounted_offer_count: 5,
          }
        }
      />
    </div>
  );
}

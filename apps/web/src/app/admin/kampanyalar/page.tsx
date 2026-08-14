import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "@/components/campaign-form";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("promo_campaigns").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Kampanyalar</h1>
      <CampaignForm />
      <ul className="mt-8 space-y-3">
        {(data ?? []).map((c) => (
          <li key={c.id} className="rounded-2xl border border-border bg-card p-4">
            <p className="font-medium">{c.name}</p>
            <p className="text-sm text-muted-foreground">
              +{c.credit_amount} TL kredi · %{c.bid_fee_discount_percent} indirim · {c.discounted_offer_count} teklif ·
              kullanılan {c.redeemed_count}/{c.max_redemptions ?? "∞"} · {c.is_active ? "aktif" : "pasif"}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

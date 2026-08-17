import { createClient } from "@/lib/supabase/server";
import { CampaignForm } from "@/components/campaign-form";
import { CampaignToggle } from "@/components/campaign-toggle";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("promo_campaigns").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Kampanyalar</h1>
      <CampaignForm />
      <ul className="mt-8 space-y-3">
        {(data ?? []).map((c) => (
          <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-border bg-card p-4">
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-sm text-muted-foreground">
                +{c.credit_amount} TL bakiye · %{c.bid_fee_discount_percent} indirim · {c.discounted_offer_count} teklif ·
                kullanılan {c.redeemed_count}/{c.max_redemptions ?? "∞"} · {c.is_active ? "aktif" : "pasif"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Platform ayarlarında indirim/adet 0 iken kampanya uygulanmaz; aksi halde değerler birleştirilir.
              </p>
            </div>
            <CampaignToggle id={c.id} isActive={c.is_active} />
          </li>
        ))}
      </ul>
    </div>
  );
}

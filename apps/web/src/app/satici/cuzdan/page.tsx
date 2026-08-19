import { redirect } from "next/navigation";
import { formatTry } from "@ilazim/shared";
import { getProfile, getSettings, DEFAULT_TOPUP_PRESETS } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { labelOf, walletTxLabel } from "@/lib/labels";
import type { WalletTxType } from "@ilazim/shared";
import { TopupButtons } from "@/components/topup-buttons";

export default async function WalletPage() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  const supabase = await createClient();
  const settings = await getSettings();
  const topupAmounts = settings.topup_presets?.length ? settings.topup_presets : DEFAULT_TOPUP_PRESETS;
  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();
  const { data: txs } = await supabase
    .from("wallet_transactions")
    .select("*")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);
  const { data: promos } = await supabase
    .from("seller_promos")
    .select("*")
    .eq("user_id", profile.id);

  return (
    <div>
      <h1 className="font-display text-4xl">Cüzdan</h1>
      <p className="mt-1 text-sm text-muted-foreground">Teklif ücretleri bu bakiyeden düşülür.</p>
      <div className="mt-8">
        <div className="rounded-2xl bg-primary p-6 text-primary-foreground md:max-w-sm">
          <p className="text-xs opacity-70">Kullanılabilir bakiye</p>
          <p className="font-display text-4xl">{formatTry(Number(wallet?.cash_balance ?? 0))}</p>
        </div>
      </div>

      {(promos ?? []).some((p) => p.remaining_discounted_offers > 0) && (
        <p className="mt-6 rounded-2xl bg-teal-soft p-4 text-sm">
          İndiriminiz aktif: kalan{" "}
          {promos?.reduce((a, p) => a + p.remaining_discounted_offers, 0)} teklifte yüzde{" "}
          {promos?.[0]?.discount_percent} indirim.
        </p>
      )}

      <h2 className="mt-10 font-display text-2xl">Bakiye yükle</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Shopier yapılandırılmazsa ödeme kaydı oluşur; bakiyeyi admin onaylar / yükler.
      </p>
      <TopupButtons amounts={topupAmounts} />

      <h2 className="mt-10 font-display text-2xl">Hareketler</h2>
      <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
        {(txs ?? []).length === 0 && (
          <li className="p-4 text-sm text-muted-foreground">Hareket yok.</li>
        )}
        {(txs ?? []).map((t) => (
          <li key={t.id} className="flex justify-between p-4 text-sm">
            <div>
              <p>{labelOf(walletTxLabel, t.type as WalletTxType)}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(t.created_at).toLocaleString("tr-TR")}
                {t.note ? ` · ${t.note}` : ""}
              </p>
            </div>
            <p className="font-medium">{formatTry(Number(t.amount))}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

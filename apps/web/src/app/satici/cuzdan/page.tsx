import { redirect } from "next/navigation";
import { formatTry, TOPUP_PRESETS } from "@ilazim/shared";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { TopupButtons } from "@/components/topup-buttons";

export default async function WalletPage() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  const supabase = await createClient();
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

  const labels: Record<string, string> = {
    topup: "Bakiye yükleme",
    bid_fee: "Teklif ücreti",
    credit_grant: "Kredi tanımı",
    credit_spend: "Kredi kullanımı",
    refund: "İade",
    adjustment: "Düzeltme",
  };

  return (
    <div>
      <h1 className="font-display text-4xl">Cüzdan ve hesap hareketleri</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-primary p-5 text-primary-foreground">
          <p className="text-xs opacity-70">Kullanılabilir</p>
          <p className="font-display text-3xl">{formatTry(Number(wallet?.available_balance ?? 0))}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Nakit</p>
          <p className="font-display text-3xl">{formatTry(Number(wallet?.cash_balance ?? 0))}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Kredi</p>
          <p className="font-display text-3xl">{formatTry(Number(wallet?.credit_balance ?? 0))}</p>
        </div>
      </div>

      {(promos ?? []).some((p) => p.remaining_discounted_offers > 0) && (
        <p className="mt-6 rounded-2xl bg-teal-soft p-4 text-sm">
          İlk üye indiriminiz aktif: kalan{" "}
          {promos?.reduce((a, p) => a + p.remaining_discounted_offers, 0)} teklifte yüzde{" "}
          {promos?.[0]?.discount_percent} indirim.
        </p>
      )}

      <h2 className="mt-10 font-display text-2xl">Bakiye yükle</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        iyzico anahtarları tanımlı değilse ödeme kaydı oluşur; bakiyeyi admin onaylar / yükler.
      </p>
      <TopupButtons amounts={[...TOPUP_PRESETS]} />

      <h2 className="mt-10 font-display text-2xl">Hareketler</h2>
      <ul className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
        {(txs ?? []).length === 0 && (
          <li className="p-4 text-sm text-muted-foreground">Hareket yok.</li>
        )}
        {(txs ?? []).map((t) => (
          <li key={t.id} className="flex justify-between p-4 text-sm">
            <div>
              <p>{labels[t.type] ?? t.type}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(t.created_at).toLocaleString("tr-TR")} · {t.balance_kind === "credit" ? "Kredi" : "Nakit"}
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

import Link from "next/link";
import { redirect } from "next/navigation";
import { formatTry } from "@ilazim/shared";
import { getProfile, getSettings } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function SaticiHome() {
  const profile = await getProfile();
  if (!profile) redirect("/giris?next=/satici");
  if (profile.role === "buyer") redirect("/satici/onboarding");

  const supabase = await createClient();
  const settings = await getSettings();
  const { data: wallet } = await supabase
    .from("wallets")
    .select("*")
    .eq("user_id", profile.id)
    .maybeSingle();
  const { data: myOffers } = await supabase
    .from("offers")
    .select("*, listings(title, slug, status, categories(slug))")
    .eq("seller_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Satıcı paneli</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Durum: {profile.seller_status ?? "—"} · Teklif ücreti {formatTry(Number(settings?.bid_fee_amount ?? 29.9))}
          </p>
        </div>
      </div>

      {profile.seller_status === "pending" && (
        <p className="mt-6 rounded-2xl bg-saffron/20 p-4 text-sm">
          Başvurunuz inceleniyor. Onay sonrası teklif verebilirsiniz.
        </p>
      )}

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <p className="text-xs text-muted-foreground">Kullanılabilir</p>
          <p className="font-display text-3xl">
            {formatTry(Number(wallet?.available_balance ?? 0))}
          </p>
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

      <h2 className="mt-12 font-display text-2xl">Açık işler</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        Hizmet talepleri seçtiğin hizmetlere göre. Ürünler herkese açık. Filtre için açık işlere gidin.
      </p>
      <p className="mt-4">
        <Button asChild>
          <Link href="/satici/ilanlar">Tüm Türkiye’deki açık işler</Link>
        </Button>
      </p>

      <h2 className="mt-12 font-display text-2xl">Son teklifleriniz</h2>
      <ul className="mt-4 space-y-2 text-sm">
        {(myOffers ?? []).map((o) => (
          <li key={o.id} className="flex justify-between border-b border-border py-3">
            <span>{(o.listings as { title?: string } | null)?.title}</span>
            <span>
              {formatTry(Number(o.amount))} · {o.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

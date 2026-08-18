import { createClient } from "@/lib/supabase/server";
import { formatTry } from "@ilazim/shared";

export default async function AdminHome() {
  const supabase = await createClient();
  const [{ count: users }, { count: listings }, { count: offers }, { count: pending }, { count: pendingReviews }] =
    await Promise.all([
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("listings").select("*", { count: "exact", head: true }),
      supabase.from("offers").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }).eq("seller_status", "pending"),
      supabase.from("reviews").select("*", { count: "exact", head: true }).eq("status", "pending"),
    ]);
  const { data: settings } = await supabase.from("platform_settings").select("*").eq("id", 1).single();

  return (
    <div>
      <h1 className="font-display text-4xl">Özet</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ["Kullanıcı", users ?? 0],
          ["İlan", listings ?? 0],
          ["Teklif", offers ?? 0],
          ["Bekleyen satıcı", pending ?? 0],
          ["Bekleyen yorum", pendingReviews ?? 0],
        ].map(([k, v]) => (
          <div key={String(k)} className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs text-muted-foreground">{k}</p>
            <p className="font-display text-3xl">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 text-sm text-muted-foreground">
        Sabit teklif ücreti: {formatTry(Number(settings?.bid_fee_amount ?? 0))}
      </p>
    </div>
  );
}

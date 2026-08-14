import Link from "next/link";
import { redirect } from "next/navigation";
import { formatTry } from "@ilazim/shared";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function Page() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  const supabase = await createClient();
  const { data } = await supabase
    .from("offers")
    .select("*, listings(title, slug, status, categories(slug))")
    .eq("seller_id", profile.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-4xl">Tekliflerim</h1>
      <ul className="mt-8 space-y-3">
        {(data ?? []).map((o) => {
          const listing = o.listings as {
            title?: string;
            slug?: string;
            status?: string;
            categories?: { slug?: string } | null;
          } | null;
          return (
            <li key={o.id} className="rounded-2xl border border-border bg-card p-4">
              <Link href={`/ilan/${listing?.categories?.slug}/${listing?.slug}`} className="font-medium underline">
                {listing?.title}
              </Link>
              <p className="mt-1 text-sm">
                {formatTry(Number(o.amount))} · teklif {o.status} · ilan {listing?.status}
              </p>
              <p className="text-xs text-muted-foreground">Kesilen ücret: {formatTry(Number(o.fee_charged))}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

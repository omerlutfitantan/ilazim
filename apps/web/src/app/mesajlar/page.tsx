import Link from "next/link";
import { redirect } from "next/navigation";
import { maskPersonName } from "@ilazim/shared";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";

export default async function MessagesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select(
      "id, buyer_id, seller_id, updated_at, listings(title), buyer:buyer_id(display_name, full_name), seller:seller_id(display_name)",
    )
    .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-4xl">Mesajlar</h1>
      <ul className="mt-8 space-y-2">
        {(data ?? []).length === 0 && (
          <li className="text-sm text-muted-foreground">Sohbet yok. Teklif sonrası sohbet açılır.</li>
        )}
        {(data ?? []).map((c) => {
          const other =
            profile.id === c.buyer_id
              ? (c.seller as { display_name?: string } | null)?.display_name
              : maskPersonName(
                  (c.buyer as { full_name?: string; display_name?: string } | null)?.full_name ||
                    (c.buyer as { display_name?: string } | null)?.display_name,
                );
          return (
            <li key={c.id}>
              <Link
                href={`/mesajlar/${c.id}`}
                className="block rounded-2xl border border-border bg-card p-4 hover:border-primary"
              >
                <p className="font-medium">{(c.listings as { title?: string } | null)?.title}</p>
                <p className="text-sm text-muted-foreground">{other}</p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

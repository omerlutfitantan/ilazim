import Link from "next/link";
import { redirect } from "next/navigation";
import { maskPersonName } from "@ilazim/shared";
import { getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { UserAvatar } from "@/components/ui/avatar";
import { formatTrDate } from "@/lib/labels";

export default async function MessagesPage() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  const supabase = await createClient();
  const { data } = await supabase
    .from("conversations")
    .select(
      "id, buyer_id, seller_id, updated_at, listings(title), buyer:buyer_id(display_name, full_name, avatar_url), seller:seller_id(display_name, avatar_url)",
    )
    .or(`buyer_id.eq.${profile.id},seller_id.eq.${profile.id}`)
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="font-display text-4xl">Mesajlar</h1>
      <ul className="mt-8 divide-y divide-border overflow-hidden rounded-[1.75rem] border border-border bg-card">
        {(data ?? []).length === 0 && (
          <li className="p-8 text-sm text-muted-foreground">Sohbet yok. Teklif sonrası sohbet açılır.</li>
        )}
        {(data ?? []).map((c) => {
          const mineIsBuyer = profile.id === c.buyer_id;
          const seller = c.seller as { display_name?: string; avatar_url?: string | null } | null;
          const buyer = c.buyer as {
            full_name?: string;
            display_name?: string;
            avatar_url?: string | null;
          } | null;
          const other = mineIsBuyer ? seller?.display_name : maskPersonName(buyer?.full_name || buyer?.display_name);
          const avatar = mineIsBuyer ? seller?.avatar_url : buyer?.avatar_url;
          return (
            <li key={c.id}>
              <Link href={`/mesajlar/${c.id}`} className="flex items-center gap-3 px-4 py-4 hover:bg-muted/60">
                <UserAvatar src={avatar} name={other} className="size-12 text-sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate font-medium">{other}</p>
                    <p className="shrink-0 text-[11px] text-muted-foreground">{formatTrDate(c.updated_at)}</p>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {(c.listings as { title?: string } | null)?.title}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

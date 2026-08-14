import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { GrantForm } from "@/components/grant-form";
import { formatTry } from "@ilazim/shared";
import { labelOf, paymentStatusLabel } from "@/lib/labels";
import type { PaymentStatus } from "@ilazim/shared";

export default async function Page() {
  const supabase = await createClient();
  const { data: wallets } = await supabase
    .from("wallets")
    .select("*, profiles:user_id(display_name)")
    .order("updated_at", { ascending: false });
  const { data: payments } = await supabase
    .from("payments")
    .select("*, profiles:user_id(display_name)")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Cüzdan işlemleri</h1>
      <GrantForm />
      <h2 className="mt-10 font-display text-xl">Bakiyeler</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {(wallets ?? []).map((w) => (
          <li key={w.id} className="flex justify-between rounded-xl border border-border bg-card px-4 py-3">
            <Link href={`/admin/kullanicilar/${w.user_id}`} className="underline">
              {(w.profiles as { display_name?: string } | null)?.display_name}
            </Link>
            <span>
              nakit {formatTry(Number(w.cash_balance))} · kredi {formatTry(Number(w.credit_balance))}
            </span>
          </li>
        ))}
      </ul>
      <h2 className="mt-10 font-display text-xl">Ödeme kayıtları</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {(payments ?? []).map((p) => (
          <li key={p.id} className="flex justify-between rounded-xl border border-border px-4 py-3">
            <span>
              <Link href={`/admin/kullanicilar/${p.user_id}`} className="underline">
                {(p.profiles as { display_name?: string } | null)?.display_name}
              </Link>{" "}
              · {labelOf(paymentStatusLabel, p.status as PaymentStatus)}
            </span>
            <span>{formatTry(Number(p.amount))}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { ShopierApiClient } from "@nopeion/shopier";
import { getPaymentConfig } from "@/lib/integrations";
import { createAdminClient } from "@/lib/supabase/admin";

type PendingPayment = {
  id: string;
  provider_ref: string | null;
  created_at: string;
};

/** Shopier OSB gelmezse: paid siparişleri API'den çekip provider_ref ile eşleştir. */
export async function reconcileShopierTopupsForUser(userId: string) {
  const cfg = await getPaymentConfig();
  if (!cfg.pat) return { applied: 0 };

  const admin = createAdminClient();
  const { data: pending } = await admin
    .from("payments")
    .select("id, provider_ref, created_at")
    .eq("user_id", userId)
    .eq("status", "pending")
    .not("provider_ref", "is", null)
    .returns<PendingPayment[]>();

  if (!pending?.length) return { applied: 0 };

  const paidProductIds = await fetchPaidShopierProductIds(
    cfg.pat,
    pending.map((p) => p.created_at),
  );
  if (!paidProductIds.size) return { applied: 0 };

  let applied = 0;
  for (const pay of pending) {
    if (!pay.provider_ref || !paidProductIds.has(pay.provider_ref)) continue;
    const { error } = await admin.rpc("apply_topup", { p_payment_id: pay.id });
    if (!error) applied += 1;
  }

  return { applied };
}

async function fetchPaidShopierProductIds(pat: string, createdAts: string[]) {
  const client = new ShopierApiClient({ pat });
  const oldest = createdAts.reduce((min, ts) => (ts < min ? ts : min), createdAts[0]);
  const dateStart = new Date(new Date(oldest).getTime() - 60 * 60 * 1000).toISOString();

  let orders: Array<{
    paymentStatus?: string;
    lineItems?: Array<{ productId?: string | number }>;
  }> = [];

  try {
    orders = (await client.orders.list({ dateStart, limit: 100 })) as typeof orders;
  } catch (err) {
    console.error("[shopier/reconcile] orders.list failed:", err);
    return new Set<string>();
  }

  const paid = new Set<string>();
  for (const order of orders) {
    if (order.paymentStatus !== "paid") continue;
    for (const item of order.lineItems ?? []) {
      if (item.productId != null) paid.add(String(item.productId));
    }
  }
  return paid;
}

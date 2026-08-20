import { NextResponse } from "next/server";
import { getProfile } from "@/lib/data";
import { reconcileShopierTopupsForUser } from "@/lib/payments/shopier-reconcile";
import { createClient } from "@/lib/supabase/server";

/** Oturum açmış kullanıcının bekleyen Shopier yüklemelerini sipariş API'si ile eşleştirir. */
export async function POST() {
  const profile = await getProfile();
  if (!profile) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { applied } = await reconcileShopierTopupsForUser(profile.id);

  const supabase = await createClient();
  const { data: wallet } = await supabase
    .from("wallets")
    .select("cash_balance")
    .eq("user_id", profile.id)
    .maybeSingle();

  return NextResponse.json({
    applied,
    balance: Number(wallet?.cash_balance ?? 0),
  });
}

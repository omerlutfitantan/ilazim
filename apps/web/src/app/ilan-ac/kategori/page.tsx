import { getCategories, getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { StepCategory } from "@/components/listing-steps";

export default async function Page() {
  const [categories, profile] = await Promise.all([getCategories(), getProfile()]);
  let blockedIds: string[] = [];
  if (profile) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("seller_categories")
      .select("category_id")
      .eq("user_id", profile.id);
    blockedIds = (data ?? []).map((r) => r.category_id);
  }
  return <StepCategory categories={categories} blockedIds={blockedIds} />;
}

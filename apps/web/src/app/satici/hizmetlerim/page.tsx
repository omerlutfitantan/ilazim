import { redirect } from "next/navigation";
import { getCategories, getMyServiceCategoryIds, getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { SellerCategoriesForm } from "@/components/seller-categories-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function Page() {
  const profile = await getProfile();
  if (!profile) redirect("/giris");
  if (profile.role === "buyer") redirect("/satici/onboarding");
  const supabase = await createClient();
  const [categories, selected, openMine] = await Promise.all([
    getCategories("service"),
    getMyServiceCategoryIds(profile.id),
    supabase
      .from("listings")
      .select("category_id")
      .eq("user_id", profile.id)
      .eq("kind", "service")
      .eq("status", "open"),
  ]);
  return (
    <div>
      <h1 className="font-display text-4xl">Hizmetlerim</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Verdiğin işler. Açık işlerde yalnızca bunları görürsün; bu kategorilerde kendin talep açamazsın.
      </p>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Kategoriler</CardTitle>
          <CardDescription>
            Seç, kaydet. Açık talebin olan kategori eklenemez.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SellerCategoriesForm
            categories={categories}
            selected={selected}
            blockedIds={[...new Set((openMine.data ?? []).map((r) => r.category_id))]}
          />
        </CardContent>
      </Card>
    </div>
  );
}

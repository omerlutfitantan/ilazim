import { createClient } from "@/lib/supabase/server";
import { CategoryAdminForm } from "@/components/category-admin-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { labelOf, listingKindLabel } from "@/lib/labels";
import type { ListingKind } from "@ilazim/shared";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("*").order("kind").order("sort_order");
  return (
    <div>
      <h1 className="font-display text-3xl">Kategoriler</h1>
      <p className="mt-1 mb-6 text-sm text-muted-foreground">
        Ad, kart metni ve SEO alanlarını buradan düzenleyin. Açıklama anasayfa kartında ve Google’da görünür.
      </p>
      <Card>
        <CardHeader>
          <CardTitle>Yeni kategori</CardTitle>
          <CardDescription>SEO alanlarını boş bırakırsanız addan üretilir; sonra buradan değiştirebilirsiniz.</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoryAdminForm />
        </CardContent>
      </Card>
      <ul className="mt-10 space-y-4">
        {(data ?? []).map((c) => (
          <li key={c.id} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {labelOf(listingKindLabel, c.kind as ListingKind)}
            </p>
            <p className="font-display text-xl">{c.name}</p>
            <p className="text-xs text-muted-foreground">/{c.slug}</p>
            <p className="mt-2 text-sm">{c.meta_title}</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{c.meta_description}</p>
            <CategoryAdminForm initial={c} />
          </li>
        ))}
      </ul>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCategories, getLocations, getProfile } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { OnboardingForm } from "@/components/onboarding-form";

export default async function Page() {
  const profile = await getProfile();
  if (!profile) redirect("/giris?next=/satici/onboarding");
  const supabase = await createClient();
  const [locs, serviceCategories, openMine] = await Promise.all([
    getLocations(),
    getCategories("service"),
    supabase
      .from("listings")
      .select("category_id")
      .eq("user_id", profile.id)
      .eq("kind", "service")
      .eq("status", "open"),
  ]);
  return (
    <div className="max-w-xl">
      <h1 className="font-display text-4xl">Satıcı ol</h1>
      <p className="mt-2 mb-8 text-sm text-muted-foreground">
        Onay sonrası cüzdanın açılır. Hizmetlerim’e eklediğin kategorilerde talep açamazsın; başka kategorilerde hizmet alabilirsin.
      </p>
      <OnboardingForm
        cities={locs.cities}
        districts={locs.districts}
        serviceCategories={serviceCategories}
        blockedIds={[...new Set((openMine.data ?? []).map((r) => r.category_id))]}
      />
    </div>
  );
}

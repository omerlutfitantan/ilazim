import Link from "next/link";
import { redirect } from "next/navigation";
import { JOB_RADIUS_KM, KIND_LABELS, formatTry, haversineKm, type ListingKind } from "@ilazim/shared";
import { getCategories, getProfile, getSettings, getMyServiceCategoryIds } from "@/lib/data";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HideListingButton } from "@/components/hide-listing-button";

type Loc = { lat?: number | null; lng?: number | null; name?: string | null };

function coords(loc: Loc | null | undefined): { lat: number; lng: number } | null {
  if (loc?.lat == null || loc?.lng == null) return null;
  return { lat: Number(loc.lat), lng: Number(loc.lng) };
}

export default async function OpenJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ scope?: string; radius?: string; kind?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect("/giris?next=/satici/ilanlar");
  if (profile.role === "buyer") redirect("/satici/onboarding");

  const { scope = "turkey", radius, kind = "all" } = await searchParams;
  const radiusKm = radius ? Number(radius) : null;
  const supabase = await createClient();
  const [settings, serviceIds, serviceCats] = await Promise.all([
    getSettings(),
    getMyServiceCategoryIds(profile.id),
    getCategories("service"),
  ]);
  const feeLabel = formatTry(Number(settings?.bid_fee_amount ?? 29.9));
  const myCatNames = serviceCats.filter((c) => serviceIds.includes(c.id)).map((c) => c.name);

  const { data: hiddenRows } = await supabase
    .from("seller_hidden_listings")
    .select("listing_id")
    .eq("seller_id", profile.id);
  const hiddenIds = new Set((hiddenRows ?? []).map((r) => r.listing_id));

  const { data: originRow } = profile.district_id
    ? await supabase.from("locations").select("lat, lng, name").eq("id", profile.district_id).maybeSingle()
    : profile.city_id
      ? await supabase.from("locations").select("lat, lng, name").eq("id", profile.city_id).maybeSingle()
      : { data: null };
  const origin = coords(originRow);

  const { data: raw } = await supabase
    .from("listings")
    .select(
      "*, categories(name, slug), city:city_id(name, lat, lng), district:district_id(name, lat, lng)",
    )
    .eq("status", "open")
    .neq("user_id", profile.id)
    .order("published_at", { ascending: false })
    .limit(200);

  let jobs = (raw ?? []).filter((l) => {
    if (hiddenIds.has(l.id)) return false;
    if (l.kind === "product") return kind !== "service";
    if (kind === "product") return false;
    return serviceIds.includes(l.category_id);
  });

  if (scope === "city" && profile.city_id) {
    jobs = jobs.filter((l) => l.city_id === profile.city_id);
  }
  if (scope === "district" && profile.district_id) {
    jobs = jobs.filter((l) => l.district_id === profile.district_id);
  }

  const withDistance = jobs.map((l) => {
    const pin = coords((l.district as Loc) ?? null) ?? coords((l.city as Loc) ?? null);
    const km =
      origin && pin ? Math.round(haversineKm(origin.lat, origin.lng, pin.lat, pin.lng) * 10) / 10 : null;
    return { ...l, km };
  });

  const visible =
    radiusKm && origin
      ? withDistance.filter((l) => l.km != null && l.km <= radiusKm)
      : withDistance;

  const qs = (next: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { scope, radius: radius ?? "", kind, ...next };
    if (merged.scope && merged.scope !== "turkey") p.set("scope", merged.scope);
    if (merged.radius) p.set("radius", merged.radius);
    if (merged.kind && merged.kind !== "all") p.set("kind", merged.kind);
    const s = p.toString();
    return s ? `?${s}` : "";
  };

  return (
    <div>
      <div>
        <h1 className="font-display text-4xl">Açık işler</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Hizmet talepleri yalnızca Hizmetlerim’de seçtiklerin. Ürün ilanları herkese açık. Varsayılan: tüm Türkiye.
        </p>
      </div>

      {serviceIds.length === 0 && (
        <p className="mt-6 rounded-2xl bg-accent/30 p-4 text-sm">
          Hizmet taleplerini görmek için Hizmetlerim’e kategori ekle.{" "}
          <Link href="/satici/hizmetlerim" className="underline">
            Hizmetlerim
          </Link>
        </p>
      )}

      <div className="mt-8 flex flex-wrap gap-2">
        {(
          [
            ["turkey", "Tüm Türkiye"],
            ["city", "Şehrim"],
            ["district", "İlçem"],
          ] as const
        ).map(([id, label]) => (
          <Link
            key={id}
            href={`/satici/ilanlar${qs({ scope: id })}`}
            className={`rounded-full px-4 py-2 text-sm font-medium ${
              scope === id ? "bg-ink text-white" : "bg-card"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href={`/satici/ilanlar${qs({ radius: "" })}`}
          className={`rounded-full px-4 py-2 text-sm ${!radiusKm ? "bg-ink text-white" : "bg-card"}`}
        >
          Mesafe: tümü
        </Link>
        {JOB_RADIUS_KM.map((km) => (
          <Link
            key={km}
            href={`/satici/ilanlar${qs({ radius: String(km) })}`}
            className={`rounded-full px-4 py-2 text-sm ${
              radiusKm === km ? "bg-ink text-white" : "bg-card"
            }`}
          >
            {km} km
          </Link>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {(
          [
            ["all", "Hepsi"],
            ["service", "Hizmet"],
            ["product", "Ürün"],
          ] as const
        ).map(([id, label]) => (
          <Link
            key={id}
            href={`/satici/ilanlar${qs({ kind: id })}`}
            className={`rounded-full px-4 py-2 text-sm ${
              kind === id ? "bg-ink text-white" : "bg-card"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {myCatNames.length > 0 && (
        <p className="mt-4 text-xs text-muted-foreground">
          Hizmetlerim: {myCatNames.join(", ")}
        </p>
      )}
      {scope === "city" && !profile.city_id && (
        <p className="mt-3 text-sm text-muted-foreground">Şehir filtresi için profilinize şehir ekleyin.</p>
      )}
      {scope === "district" && !profile.district_id && (
        <p className="mt-3 text-sm text-muted-foreground">İlçe filtresi için profilinize ilçe ekleyin.</p>
      )}
      {Boolean(radiusKm) && !origin && (
        <p className="mt-3 text-sm text-muted-foreground">
          Kilometre filtresi konumunuza göre çalışır. Satıcı profilinizde şehir/ilçe olmalı.
        </p>
      )}

      <ul className="mt-8 space-y-3">
        {visible.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-8 text-sm text-muted-foreground">
            Bu filtrede açık iş yok.
          </li>
        )}
        {visible.map((l) => (
          <li key={l.id} className="flex items-stretch rounded-2xl bg-card">
            <Link
              href={`/ilan/${(l.categories as { slug?: string } | null)?.slug}/${l.slug}`}
              className="group min-w-0 flex-1 p-4 hover:opacity-80"
            >
              <Badge variant={l.kind === "service" ? "service" : "product"}>
                {KIND_LABELS[l.kind as ListingKind]}
              </Badge>
              <p className="mt-1 font-medium">{l.title}</p>
              <p className="text-xs text-muted-foreground">
                {(l.city as { name?: string } | null)?.name}
                {(l.district as { name?: string } | null)?.name
                  ? ` / ${(l.district as { name?: string }).name}`
                  : ""}
                {l.km != null ? ` · ${l.km} km` : ""}
              </p>
            </Link>
            <div className="flex shrink-0 items-center gap-2 pr-3">
              <Button asChild size="sm">
                <Link href={`/ilan/${(l.categories as { slug?: string } | null)?.slug}/${l.slug}`}>
                  Teklif ver ({feeLabel})
                </Link>
              </Button>
              <HideListingButton listingId={l.id} stayOnPage />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

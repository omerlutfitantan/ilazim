import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured, siteUrl } from "@/lib/utils";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/hizmetler`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/urunler`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/nasil-calisir`, changeFrequency: "monthly", priority: 0.5 },
  ];
  if (!isSupabaseConfigured()) return staticRoutes;

  const supabase = await createClient();
  const [{ data: cats }, { data: sellers }] = await Promise.all([
    supabase.from("categories").select("kind, slug"),
    supabase.from("profiles").select("slug, updated_at").in("role", ["seller", "admin"]).not("slug", "is", null),
  ]);

  const catUrls =
    cats?.map((c) => ({
      url: `${base}/${c.kind === "service" ? "hizmetler" : "urunler"}/${c.slug}`,
      changeFrequency: "daily" as const,
      priority: 0.85,
    })) ?? [];

  const sellerUrls =
    sellers?.map((s) => ({
      url: `${base}/usta/${s.slug}`,
      lastModified: s.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })) ?? [];

  return [...staticRoutes, ...catUrls, ...sellerUrls];
}

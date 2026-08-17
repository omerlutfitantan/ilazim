import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/utils";
import type { ListingKind, LocationRow, ProfileRow } from "@/lib/database.types";

export async function getProfile() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  if (!user.email_confirmed_at) return null;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data as ProfileRow | null;
}

export async function getAuthUser() {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCategories(kind?: ListingKind, featured?: boolean) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let q = supabase.from("categories").select("*").order("sort_order");
  if (kind) q = q.eq("kind", kind);
  if (featured) q = q.eq("is_featured", true);
  const { data } = await q;
  return data ?? [];
}

export async function getMyServiceCategoryIds(userId: string) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  const { data } = await supabase.from("seller_categories").select("category_id").eq("user_id", userId);
  return (data ?? []).map((r) => r.category_id);
}

export async function getCategoryBySlug(kind: ListingKind, slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("kind", kind)
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

async function fetchAllLocations(supabase: Awaited<ReturnType<typeof createClient>>, type: "city" | "district") {
  const pageSize = 1000;
  const rows: LocationRow[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from("locations")
      .select("*")
      .eq("type", type)
      .order("name")
      .range(from, from + pageSize - 1);
    if (error) throw error;
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

export async function getLocations() {
  if (!isSupabaseConfigured()) return { cities: [], districts: [] };
  const supabase = await createClient();
  const [cities, districts] = await Promise.all([
    fetchAllLocations(supabase, "city"),
    fetchAllLocations(supabase, "district"),
  ]);
  return { cities, districts };
}

export async function getSettings() {
  const fallback = {
    bid_fee_amount: 29.9,
    new_seller_welcome_balance: 100,
    new_seller_discount_percent: 50,
    new_seller_discounted_offer_count: 5,
    currency: "TRY",
    site_name: "iLazım",
  };
  if (!isSupabaseConfigured()) return fallback;
  const supabase = await createClient();
  const { data } = await supabase.from("platform_settings").select("*").eq("id", 1).single();
  return data ?? fallback;
}

export async function getOpenListings(filters: {
  kind?: ListingKind;
  categoryId?: string;
  q?: string;
  limit?: number;
}) {
  if (!isSupabaseConfigured()) return [];
  const supabase = await createClient();
  let q = supabase
    .from("listings")
    .select(
      "*, categories(name, slug, kind), locations:city_id(name), district:district_id(name)",
    )
    .eq("status", "open")
    .order("published_at", { ascending: false })
    .limit(filters.limit ?? 24);
  if (filters.kind) q = q.eq("kind", filters.kind);
  if (filters.categoryId) q = q.eq("category_id", filters.categoryId);
  if (filters.q) q = q.ilike("title", `%${filters.q}%`);
  const { data } = await q;
  let rows = data ?? [];
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user && rows.length) {
    const { data: hidden } = await supabase
      .from("seller_hidden_listings")
      .select("listing_id")
      .eq("seller_id", user.id);
    const ids = new Set((hidden ?? []).map((h) => h.listing_id));
    if (ids.size) rows = rows.filter((l) => !ids.has(l.id));
  }
  return rows;
}

export async function getListingBySlug(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("listings")
    .select(
      "*, categories(name, slug, kind, h1), locations:city_id(name), district:district_id(name), profiles:user_id(full_name, display_name)",
    )
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getSellerBySlug(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, display_name, slug, bio, seller_headline, seller_type, city_id, avatar_url, locations:city_id(name)")
    .eq("slug", slug)
    .maybeSingle();
  if (!profile || profile.role === "buyer") return null;
  const { data: stats } = await supabase
    .from("seller_stats")
    .select("*")
    .eq("seller_id", profile.id)
    .maybeSingle();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, reviewer:reviewer_id(display_name, full_name), listings(title, slug, kind)")
    .eq("seller_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(20);
  const { data: jobs } = await supabase
    .from("offers")
    .select("id, listings(title, slug, kind, status, completed_at, categories(name, slug))")
    .eq("seller_id", profile.id)
    .eq("status", "accepted");
  const history = (jobs ?? []).filter((j) => {
    const listing = j.listings as { status?: string } | null;
    return listing && ["awarded", "completed"].includes(listing.status ?? "");
  });
  const { data: serviceAreas } = await supabase
    .from("seller_categories")
    .select("category_id, categories(name, slug)")
    .eq("user_id", profile.id);
  return {
    profile,
    stats,
    reviews: reviews ?? [],
    jobs: history,
    serviceAreas: serviceAreas ?? [],
  };
}

export async function getSellerStatsMap(sellerIds: string[]) {
  if (!sellerIds.length || !isSupabaseConfigured()) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.from("seller_stats").select("*").in("seller_id", sellerIds);
  return new Map((data ?? []).map((s) => [s.seller_id, s]));
}

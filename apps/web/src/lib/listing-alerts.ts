import { KIND_LABELS, type ListingKind } from "@ilazim/shared";
import { getEmailConfig } from "@/lib/integrations";
import { createAdminClient } from "@/lib/supabase/admin";
import { listingAlertEmail, sendEmail } from "@/lib/email";

export async function sendListingMatchEmails(listingId: string) {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  const { apiKey } = await getEmailConfig();
  if (!apiKey) return;
  const admin = createAdminClient();
  const { data: listing } = await admin
    .from("listings")
    .select("id, title, description, kind, slug, categories(name, slug), city:city_id(name), district:district_id(name)")
    .eq("id", listingId)
    .maybeSingle();
  if (!listing) return;

  const { data: recipients, error } = await admin.rpc("listing_match_recipients", {
    p_listing_id: listingId,
  });
  if (error || !recipients?.length) return;

  const city = (listing.city as { name?: string } | null)?.name;
  const district = (listing.district as { name?: string } | null)?.name;
  const location = [city, district].filter(Boolean).join(" / ") || "Türkiye";
  const catSlug = (listing.categories as { slug?: string } | null)?.slug ?? "ilan";
  const href = `/ilan/${catSlug}/${listing.slug}`;
  const kindLabel = KIND_LABELS[listing.kind as ListingKind];
  const mail = listingAlertEmail({
    title: listing.title,
    location,
    description: listing.description,
    href,
    kindLabel,
  });

  await Promise.allSettled(
    recipients.slice(0, 80).map((r: { email?: string | null }) =>
      r.email
        ? sendEmail({
            to: r.email,
            subject: mail.subject,
            html: mail.html,
            text: mail.text,
          })
        : Promise.resolve(),
    ),
  );
}

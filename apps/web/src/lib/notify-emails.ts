import { formatTry, maskPersonName } from "@ilazim/shared";
import { createAdminClient } from "@/lib/supabase/admin";
import { newMessageEmail, offerReceivedEmail, sendEmail } from "@/lib/email";

function canSend() {
  return Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.RESEND_API_KEY);
}

async function emailOf(userId: string) {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(userId);
  return data.user?.email ?? null;
}

function snippet(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= 160) return clean;
  return `${clean.slice(0, 157)}…`;
}

export async function sendOfferReceivedEmail(input: {
  listingId: string;
  amount: number;
  message: string;
  sellerId: string;
}) {
  if (!canSend()) return;
  try {
    const admin = createAdminClient();
    const { data: listing } = await admin
      .from("listings")
      .select("id, title, user_id, slug, categories(slug)")
      .eq("id", input.listingId)
      .maybeSingle();
    if (!listing || listing.user_id === input.sellerId) return;

    const to = await emailOf(listing.user_id);
    if (!to) return;

    const [{ data: seller }, { data: conv }] = await Promise.all([
      admin.from("profiles").select("display_name").eq("id", input.sellerId).maybeSingle(),
      admin
        .from("conversations")
        .select("id")
        .eq("listing_id", input.listingId)
        .eq("seller_id", input.sellerId)
        .maybeSingle(),
    ]);

    const href = conv?.id ? `/mesajlar/${conv.id}` : "/hesabim";
    const mail = offerReceivedEmail({
      listingTitle: listing.title,
      amount: formatTry(input.amount),
      sellerName: seller?.display_name || "Bir satıcı",
      message: snippet(input.message),
      href,
    });
    await sendEmail({ to, ...mail });
  } catch {
    /* teklif kaydı mail yüzünden düşmesin */
  }
}

export async function sendNewMessageEmail(input: {
  conversationId: string;
  senderId: string;
  body: string;
}) {
  if (!canSend()) return;
  try {
    const admin = createAdminClient();
    const { data: conv } = await admin
      .from("conversations")
      .select("id, buyer_id, seller_id, listing_id")
      .eq("id", input.conversationId)
      .maybeSingle();
    if (!conv) return;

    const recipientId = input.senderId === conv.buyer_id ? conv.seller_id : conv.buyer_id;
    if (!recipientId || recipientId === input.senderId) return;

    const to = await emailOf(recipientId);
    if (!to) return;

    const [{ data: sender }, { data: listing }] = await Promise.all([
      admin.from("profiles").select("display_name, full_name").eq("id", input.senderId).maybeSingle(),
      admin.from("listings").select("title").eq("id", conv.listing_id).maybeSingle(),
    ]);

    const fromLabel =
      input.senderId === conv.seller_id
        ? sender?.display_name || "Bir satıcı"
        : maskPersonName(sender?.full_name || sender?.display_name);

    const listingTitle = listing?.title ?? "İlan";
    const mail = newMessageEmail({
      listingTitle,
      fromLabel,
      snippet: snippet(input.body),
      href: `/mesajlar/${input.conversationId}`,
    });
    await sendEmail({ to, ...mail });
  } catch {
    /* mesaj kaydı mail yüzünden düşmesin */
  }
}

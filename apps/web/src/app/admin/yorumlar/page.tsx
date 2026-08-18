import { createClient } from "@/lib/supabase/server";
import { StarRating } from "@/components/star-rating";
import { ReviewModerationButtons } from "@/components/review-moderation-buttons";
import { Badge } from "@/components/ui/badge";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select(
      "id, rating, comment, status, created_at, profiles:seller_id(display_name), reviewer:reviewer_id(display_name), listings(title)",
    )
    .order("created_at", { ascending: false })
    .limit(80);

  const pending = (data ?? []).filter((r) => r.status === "pending");
  const rest = (data ?? []).filter((r) => r.status !== "pending");

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl">Yorumlar</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        Yeni yorumlar yayına girmeden önce burada onaylanır. Sahte yorumlar silinir; puana yansımaz.
      </p>

      <h2 className="font-display text-xl">Onay bekleyen</h2>
      <ul className="mt-3 space-y-3">
        {pending.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Bekleyen yorum yok.
          </li>
        )}
        {pending.map((r) => (
          <li key={r.id} className="rounded-2xl border border-accent/40 bg-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="saffron">Onay bekliyor</Badge>
              <StarRating value={r.rating} size="sm" />
            </div>
            <p className="mt-2 text-sm">{r.comment}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {(r.reviewer as { display_name?: string } | null)?.display_name} →{" "}
              {(r.profiles as { display_name?: string } | null)?.display_name} ·{" "}
              {(r.listings as { title?: string } | null)?.title}
            </p>
            <ReviewModerationButtons reviewId={r.id} pending />
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-display text-xl">Yayındaki yorumlar</h2>
      <ul className="mt-3 space-y-3">
        {rest.length === 0 && (
          <li className="text-sm text-muted-foreground">Yayında yorum yok.</li>
        )}
        {rest.map((r) => (
          <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
            <StarRating value={r.rating} size="sm" />
            <p className="mt-2 text-sm">{r.comment}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {(r.profiles as { display_name?: string } | null)?.display_name} ·{" "}
              {(r.listings as { title?: string } | null)?.title}
            </p>
            <ReviewModerationButtons reviewId={r.id} pending={false} />
          </li>
        ))}
      </ul>
    </div>
  );
}

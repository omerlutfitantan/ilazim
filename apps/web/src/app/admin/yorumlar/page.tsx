import { createClient } from "@/lib/supabase/server";
import { StarRating } from "@/components/star-rating";
import { DeleteReviewButton } from "@/components/delete-review-button";

export default async function Page() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, created_at, profiles:seller_id(display_name), listings(title)")
    .order("created_at", { ascending: false })
    .limit(80);
  return (
    <div>
      <h1 className="mb-6 font-display text-3xl">Yorumlar</h1>
      <ul className="space-y-3">
        {(data ?? []).map((r) => (
          <li key={r.id} className="rounded-2xl border border-border bg-card p-4">
            <StarRating value={r.rating} size="sm" />
            <p className="mt-2 text-sm">{r.comment}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {(r.profiles as { display_name?: string } | null)?.display_name} ·{" "}
              {(r.listings as { title?: string } | null)?.title}
            </p>
            <div className="mt-3">
              <DeleteReviewButton reviewId={r.id} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

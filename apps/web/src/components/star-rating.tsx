import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function StarRating({
  value,
  count,
  size = "md",
}: {
  value: number;
  count?: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(value * 10) / 10;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              size === "sm" ? "size-3.5" : "size-4",
              i < Math.round(value) ? "fill-saffron text-saffron" : "text-border",
            )}
          />
        ))}
      </span>
      <span className="text-sm font-medium tabular-nums">{rounded.toFixed(1)}</span>
      {typeof count === "number" && (
        <span className="text-xs text-muted-foreground">({count})</span>
      )}
    </span>
  );
}

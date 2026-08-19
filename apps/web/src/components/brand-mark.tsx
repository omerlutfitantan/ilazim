import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({
  href = "/",
  className,
  markClassName,
  wordmarkClassName,
}: {
  href?: string;
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "grid size-8 place-items-center rounded-lg bg-accent text-[11px] font-bold text-ink",
          markClassName,
        )}
      >
        tP
      </span>
      <span className={cn("font-display text-[1.35rem] leading-none", wordmarkClassName)}>Talepik</span>
    </Link>
  );
}

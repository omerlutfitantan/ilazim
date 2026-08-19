"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/satici", label: "Özet", match: (p: string) => p === "/satici" },
  { href: "/satici/cuzdan", label: "Cüzdan", match: (p: string) => p.startsWith("/satici/cuzdan") },
  { href: "/satici/tekliflerim", label: "Tekliflerim", match: (p: string) => p.startsWith("/satici/tekliflerim") },
  { href: "/satici/ilanlar", label: "Açık işler", match: (p: string) => p.startsWith("/satici/ilanlar") },
  { href: "/satici/hizmetlerim", label: "Hizmetlerim", match: (p: string) => p.startsWith("/satici/hizmetlerim") },
];

export function SellerNav() {
  const path = usePathname();
  if (path.startsWith("/satici/onboarding")) return null;
  return (
    <nav className="mb-8 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] md:mb-10 md:flex-wrap [&::-webkit-scrollbar]:hidden">
      {LINKS.map((l) => {
        const on = l.match(path);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap",
              on ? "bg-ink text-white" : "border border-border bg-card hover:border-ink/40",
            )}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/satici", label: "Özet", match: (p: string) => p === "/satici" },
  { href: "/satici/ilanlar", label: "Açık işler", match: (p: string) => p.startsWith("/satici/ilanlar") },
  { href: "/satici/hizmetlerim", label: "Hizmetlerim", match: (p: string) => p.startsWith("/satici/hizmetlerim") },
  { href: "/satici/tekliflerim", label: "Tekliflerim", match: (p: string) => p.startsWith("/satici/tekliflerim") },
  { href: "/satici/profil", label: "Profil", match: (p: string) => p.startsWith("/satici/profil") },
  { href: "/satici/cuzdan", label: "Cüzdan", match: (p: string) => p.startsWith("/satici/cuzdan") },
];

export function SellerNav() {
  const path = usePathname();
  if (path.startsWith("/satici/onboarding")) return null;
  return (
    <nav className="mb-10 flex flex-wrap gap-2">
      {LINKS.map((l) => {
        const on = l.match(path);
        return (
          <Link
            key={l.href}
            href={l.href}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
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

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const STEPS = [
  { href: "/ilan-ac", label: "Tür", n: "01" },
  { href: "/ilan-ac/kategori", label: "Kategori", n: "02" },
  { href: "/ilan-ac/detay", label: "Detay", n: "03" },
  { href: "/ilan-ac/konum", label: "Konum", n: "04" },
  { href: "/ilan-ac/iletisim", label: "Bütçe", n: "05" },
  { href: "/ilan-ac/hesap", label: "Giriş", n: "06" },
];

export function ListingWizardShell({
  authed,
  children,
}: {
  authed: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const steps = STEPS.map((s, i) =>
    i === 5 && authed ? { ...s, href: "/ilan-ac/yayinla", label: "Yayınla" } : s,
  );
  const current = Math.max(
    0,
    pathname.startsWith("/ilan-ac/kayit") || pathname.startsWith("/ilan-ac/hesap") || pathname === "/ilan-ac/yayinla"
      ? 5
      : steps.findIndex((s) => pathname === s.href || (s.href !== "/ilan-ac" && pathname.startsWith(s.href))),
  );

  if (pathname === "/ilan-ac/yayinla") {
    return <div className="mx-auto max-w-lg px-4 py-16">{children}</div>;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-12 lg:py-16">
      <aside className="lg:col-span-4">
        <p className="text-[13px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
          İlan aç
        </p>
        <h1 className="mt-2 font-display text-4xl leading-none">Adım adım</h1>
        <ol className="mt-8 space-y-1">
          {steps.map((s, i) => {
            const active = i === current;
            const done = i < current;
            return (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className={cn(
                    "flex items-baseline gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active && "bg-ink text-white",
                    done && !active && "text-foreground",
                    !done && !active && "text-muted-foreground",
                  )}
                >
                  <span className={cn("font-display text-lg", active && "text-accent")}>{s.n}</span>
                  <span className="font-medium">{s.label}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>
      <div className="lg:col-span-8">
        <div className="rounded-[1.75rem] border border-border bg-card p-6 md:p-10">{children}</div>
      </div>
    </div>
  );
}

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
    return <div className="mx-auto max-w-lg px-4 py-10 md:py-16">{children}</div>;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-12 lg:gap-10 lg:py-16">
      <aside className="lg:col-span-4">
        <p className="hidden text-[13px] font-medium tracking-[0.18em] text-muted-foreground uppercase lg:block">
          İlan aç
        </p>
        <h1 className="mt-2 hidden font-display text-4xl leading-none lg:block">Adım adım</h1>
        <p className="font-display text-2xl lg:hidden">
          {steps[current]?.n} · {steps[current]?.label}
        </p>
        <ol className="-mx-4 mt-4 flex gap-1 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:mx-0 lg:mt-8 lg:block lg:space-y-1 lg:overflow-visible lg:px-0 [&::-webkit-scrollbar]:hidden">
          {steps.map((s, i) => {
            const active = i === current;
            const done = i < current;
            return (
              <li key={s.href} className="shrink-0">
                <Link
                  href={s.href}
                  className={cn(
                    "flex items-baseline gap-2 rounded-xl px-3 py-2.5 text-sm transition-colors lg:gap-3",
                    active && "bg-ink text-white",
                    done && !active && "text-foreground",
                    !done && !active && "text-muted-foreground",
                  )}
                >
                  <span className={cn("font-display text-base lg:text-lg", active && "text-accent")}>{s.n}</span>
                  <span className="hidden font-medium lg:inline">{s.label}</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </aside>
      <div className="lg:col-span-8">
        <div className="rounded-[1.5rem] border border-border bg-card p-5 md:rounded-[1.75rem] md:p-10">{children}</div>
      </div>
    </div>
  );
}

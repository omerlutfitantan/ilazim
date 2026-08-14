import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getProfile } from "@/lib/data";

const links = [
  ["/admin", "Özet"],
  ["/admin/kullanicilar", "Kullanıcılar"],
  ["/admin/kategoriler", "Kategoriler"],
  ["/admin/ilanlar", "İlanlar"],
  ["/admin/yorumlar", "Yorumlar"],
  ["/admin/cuzdan", "Cüzdan"],
  ["/admin/kampanyalar", "Kampanyalar"],
  ["/admin/ayarlar", "Ayarlar"],
] as const;

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") redirect("/hesabim");
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside className="hidden w-48 shrink-0 md:block">
        <p className="mb-4 font-display text-xl">Admin</p>
        <nav className="flex flex-col gap-1 text-sm">
          {links.map(([href, label]) => (
            <Link key={href} href={href} className="rounded-lg px-3 py-2 hover:bg-muted">
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

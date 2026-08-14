import type { ReactNode } from "react";
import { SellerNav } from "@/components/seller-nav";

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <SellerNav />
      {children}
    </div>
  );
}

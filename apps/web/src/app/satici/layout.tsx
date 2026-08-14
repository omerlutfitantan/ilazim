import type { ReactNode } from "react";
import { getProfile } from "@/lib/data";
import { getDesk, canUseSellerDesk } from "@/lib/desk";
import { SellerNav } from "@/components/seller-nav";
import { DeskSwitch } from "@/components/desk-switch";

export default async function SellerLayout({ children }: { children: ReactNode }) {
  const profile = await getProfile();
  const desk = await getDesk(profile);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {profile && (
        <div className="mb-6 flex justify-end">
          <DeskSwitch desk={desk} canSell={canUseSellerDesk(profile)} />
        </div>
      )}
      <SellerNav />
      {children}
    </div>
  );
}

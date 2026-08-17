"use client";

import { useTransition } from "react";
import { toggleCampaignAction } from "@/actions";
import { Button } from "@/components/ui/button";

export function CampaignToggle({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <Button
      type="button"
      variant={isActive ? "outline" : "default"}
      size="sm"
      disabled={pending}
      onClick={() => {
        start(async () => {
          await toggleCampaignAction(id, !isActive);
        });
      }}
    >
      {isActive ? "Pasifleştir" : "Aktifleştir"}
    </Button>
  );
}

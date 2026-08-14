"use client";

import { switchDeskAction } from "@/actions";
import { Button } from "@/components/ui/button";

export function DeskSwitch({
  desk,
  canSell,
}: {
  desk: "buyer" | "seller";
  canSell: boolean;
}) {
  const next = desk === "seller" ? "buyer" : "seller";
  const label =
    desk === "seller"
      ? "Hizmet alıcı hesabına geç"
      : canSell
        ? "Hizmet veren hesabına geç"
        : "Satıcı ol";

  return (
    <form action={switchDeskAction}>
      <input type="hidden" name="desk" value={next} />
      <Button type="submit" variant="outline" size="sm">
        {label}
      </Button>
    </form>
  );
}

"use client";

import { acceptOfferAction, cancelListingAction, completeListingAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";

export function AcceptOfferButton({
  offerId,
  size = "default",
}: {
  offerId: string;
  size?: "default" | "sm";
}) {
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <Button
      type="button"
      size={size}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await acceptOfferAction(offerId);
          if (r.error) toast.error(r.error);
          else {
            toast.success("Teklif seçildi. İlan yeni tekliflere kapandı.");
            router.refresh();
          }
        })
      }
    >
      {pending ? "Seçiliyor…" : "Teklifi seç"}
    </Button>
  );
}

export function ListingActions({
  listingId,
  status,
}: {
  listingId: string;
  status: string;
}) {
  const [pending, start] = useTransition();

  return (
    <div className="flex gap-2">
      {status === "open" && (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await cancelListingAction(listingId);
              if (r.error) toast.error(r.error);
            })
          }
        >
          İptal
        </Button>
      )}
      {status === "awarded" && (
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await completeListingAction(listingId);
              if (r.error) toast.error(r.error);
              else toast.success("İş tamamlandı");
            })
          }
        >
          Tamamlandı
        </Button>
      )}
    </div>
  );
}

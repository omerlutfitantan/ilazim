"use client";

import { acceptOfferAction, cancelListingAction, completeListingAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { toast } from "sonner";

export function ListingActions({
  listingId,
  status,
  acceptOfferId,
}: {
  listingId: string;
  status: string;
  acceptOfferId?: string;
}) {
  const [pending, start] = useTransition();

  if (acceptOfferId) {
    return (
      <Button
        size="sm"
        className="mt-2"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await acceptOfferAction(acceptOfferId);
            if (r.error) toast.error(r.error);
            else toast.success("Teklif seçildi. İlan yeni tekliflere kapandı.");
          })
        }
      >
        Teklifi seç
      </Button>
    );
  }

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

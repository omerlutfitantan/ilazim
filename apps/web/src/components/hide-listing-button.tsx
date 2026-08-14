"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { hideListingAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function HideListingButton({
  listingId,
  stayOnPage = false,
  labeled = false,
}: {
  listingId: string;
  stayOnPage?: boolean;
  labeled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const router = useRouter();

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size={labeled ? (stayOnPage ? "sm" : "default") : "icon"}
        aria-label="İlanı sil"
        onClick={() => setOpen(true)}
      >
        <Trash2 />
        {labeled ? "Sil" : null}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Son çağrı</DialogTitle>
          </DialogHeader>
          <p className="text-sm leading-6 text-muted-foreground">
            Bu ilanı silerseniz bu işe bir daha teklif veremezsiniz. İlan size bir daha
            görünmez.
          </p>
          <p className="mt-3 text-sm font-medium">Yine de silmek istiyor musunuz?</p>
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Vazgeç
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const r = await hideListingAction(listingId);
                  if (r.error) {
                    toast.error(r.error);
                    return;
                  }
                  toast.success("İlan listenizden silindi.");
                  setOpen(false);
                  if (stayOnPage) router.refresh();
                  else {
                    router.push("/satici/ilanlar");
                    router.refresh();
                  }
                })
              }
            >
              Evet, sil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

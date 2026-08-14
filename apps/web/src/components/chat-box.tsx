"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { sendMessageAction, acceptOfferAction } from "@/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RevealContact } from "@/components/reveal-contact";
import type { MessageRow } from "@/lib/database.types";
import { toast } from "sonner";

export function ChatBox({
  conversationId,
  userId,
  initial,
  listingId,
  offerId,
  listingStatus,
  isBuyer,
  canRevealPhone,
}: {
  conversationId: string;
  userId: string;
  initial: MessageRow[];
  listingId: string;
  offerId?: string | null;
  listingStatus: string;
  isBuyer: boolean;
  canRevealPhone: boolean;
}) {
  const [messages, setMessages] = useState(initial);
  const [state, action, pending] = useActionState(sendMessageAction, null);
  const [selecting, start] = useTransition();

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`conv:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as MessageRow]);
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId]);

  return (
    <div className="mt-6">
      <div className="mb-4 flex flex-wrap gap-2">
        {isBuyer && listingStatus === "open" && offerId && (
          <Button
            type="button"
            disabled={selecting}
            onClick={() =>
              start(async () => {
                const r = await acceptOfferAction(offerId);
                if (r.error) toast.error(r.error);
                else toast.success("Teklif seçildi. İlan yeni tekliflere kapandı.");
              })
            }
          >
            Teklifi seç
          </Button>
        )}
        {canRevealPhone && <RevealContact listingId={listingId} />}
      </div>
      <ul className="space-y-2">
        {messages.map((m) => (
          <li
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.sender_id === userId ? "ml-auto bg-primary text-primary-foreground" : "bg-card border border-border"
            }`}
          >
            {m.body}
          </li>
        ))}
      </ul>
      <form action={action} className="mt-4 flex gap-2">
        <input type="hidden" name="conversationId" value={conversationId} />
        <Input name="body" required placeholder="Mesaj yazın" />
        <Button type="submit" disabled={pending}>
          Gönder
        </Button>
      </form>
      {state && "error" in state && state.error && (
        <p className="mt-2 text-sm text-destructive">{state.error}</p>
      )}
    </div>
  );
}

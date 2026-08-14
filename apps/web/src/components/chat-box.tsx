"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Check, CheckCheck } from "lucide-react";
import { sendMessageAction, acceptOfferAction, markConversationReadAction } from "@/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { MessageRow } from "@/lib/database.types";
import { toast } from "sonner";

export function ChatBox({
  conversationId,
  userId,
  initial,
  offerId,
  listingStatus,
  isBuyer,
}: {
  conversationId: string;
  userId: string;
  initial: MessageRow[];
  offerId?: string | null;
  listingStatus: string;
  isBuyer: boolean;
}) {
  const [messages, setMessages] = useState(initial);
  const [state, action, pending] = useActionState(sendMessageAction, null);
  const [selecting, start] = useTransition();
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(initial);
  }, [initial]);

  useEffect(() => {
    void markConversationReadAction(conversationId);
  }, [conversationId]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
          const row = payload.new as MessageRow;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
          if (row.sender_id !== userId) void markConversationReadAction(conversationId);
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          const row = payload.new as MessageRow;
          setMessages((prev) => prev.map((m) => (m.id === row.id ? { ...m, read_at: row.read_at } : m)));
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [conversationId, userId]);

  return (
    <div className="mt-6">
      {isBuyer && listingStatus === "open" && offerId && (
        <div className="mb-4">
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
        </div>
      )}
      <ul className="space-y-2">
        {messages.map((m) => {
          const mine = m.sender_id === userId;
          return (
            <li
              key={m.id}
              className={cn(
                "max-w-[80%] rounded-2xl px-4 py-2 text-sm whitespace-pre-wrap",
                mine ? "ml-auto bg-primary text-primary-foreground" : "bg-card border border-border",
              )}
            >
              {m.body}
              {mine && (
                <span className="mt-1 flex justify-end" title={m.read_at ? "Görüldü" : "İletildi"}>
                  {m.read_at ? (
                    <CheckCheck className="size-3.5 text-sky-300" />
                  ) : (
                    <Check className="size-3.5 opacity-60" />
                  )}
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div ref={bottom} />
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

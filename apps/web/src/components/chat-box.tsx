"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, CheckCheck, Send } from "lucide-react";
import { sendMessageAction, markConversationReadAction } from "@/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { MessageRow } from "@/lib/database.types";

function msgTime(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

function dayLabel(value: string) {
  return new Intl.DateTimeFormat("tr-TR", { dateStyle: "medium" }).format(new Date(value));
}

function sameDay(a: string, b: string) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}

export function ChatBox({
  conversationId,
  userId,
  initial,
}: {
  conversationId: string;
  userId: string;
  initial: MessageRow[];
}) {
  const [messages, setMessages] = useState(initial);
  const [state, action, pending] = useActionState(sendMessageAction, null);
  const bottom = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
    if (state && "ok" in state) formRef.current?.reset();
  }, [state]);

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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
        {messages.length === 0 && (
          <p className="py-16 text-center text-sm text-muted-foreground">Henüz mesaj yok. Yazmaya başlayın.</p>
        )}
        <ul className="space-y-2">
          {messages.map((m, i) => {
            const mine = m.sender_id === userId;
            const prev = messages[i - 1];
            const showDay = i === 0 || !prev || !sameDay(prev.created_at, m.created_at);
            return (
              <li key={m.id}>
                {showDay && (
                  <p className="my-4 text-center text-[11px] tracking-wide text-muted-foreground uppercase">
                    {dayLabel(m.created_at)}
                  </p>
                )}
                <div className={cn("flex", mine ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[78%] px-3.5 py-2 text-[15px] leading-6 whitespace-pre-wrap shadow-sm",
                      mine
                        ? "rounded-2xl rounded-br-md bg-ink text-white"
                        : "rounded-2xl rounded-bl-md border border-border bg-white",
                    )}
                  >
                    {m.body}
                    <span
                      className={cn(
                        "mt-1 flex items-center justify-end gap-1 text-[10px]",
                        mine ? "text-white/55" : "text-muted-foreground",
                      )}
                    >
                      {msgTime(m.created_at)}
                      {mine &&
                        (m.read_at ? (
                          <CheckCheck className="size-3.5 text-sky-300" />
                        ) : (
                          <Check className="size-3.5 opacity-70" />
                        ))}
                    </span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={bottom} />
      </div>
      <form
        ref={formRef}
        action={action}
        className="flex items-end gap-2 border-t border-border bg-card px-3 py-3"
      >
        <input type="hidden" name="conversationId" value={conversationId} />
        <textarea
          name="body"
          required
          rows={1}
          placeholder="Mesaj yazın"
          className="max-h-32 min-h-11 flex-1 resize-none rounded-2xl border border-border bg-white px-4 py-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onInput={(e) => {
            const el = e.currentTarget;
            el.style.height = "auto";
            el.style.height = `${Math.min(el.scrollHeight, 128)}px`;
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
        />
        <Button type="submit" size="icon" disabled={pending} aria-label="Gönder" className="size-11 shrink-0 rounded-full">
          <Send />
        </Button>
      </form>
      {state && "error" in state && state.error && (
        <p className="px-4 pb-3 text-sm text-destructive">{state.error}</p>
      )}
    </div>
  );
}

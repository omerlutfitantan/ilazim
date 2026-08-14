import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChatBox } from "@/components/chat-box";
import { UserAvatar } from "@/components/ui/avatar";
import type { MessageRow } from "@/lib/database.types";
import type { ReactNode } from "react";

export function ChatPanel({
  conversationId,
  userId,
  initial,
  title,
  subtitle,
  listingHref,
  avatarSrc,
  avatarName,
  actions,
  banner,
}: {
  conversationId: string;
  userId: string;
  initial: MessageRow[];
  title: string;
  subtitle: string;
  listingHref?: string | null;
  avatarSrc?: string | null;
  avatarName?: string | null;
  actions?: ReactNode;
  banner?: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col md:px-4 md:py-6">
      <div className="flex h-[calc(100dvh-8.25rem-env(safe-area-inset-bottom,0px))] min-h-[28rem] flex-col overflow-hidden border-y border-border bg-card md:h-[min(78dvh,760px)] md:min-h-[520px] md:rounded-[1.75rem] md:border md:shadow-[0_20px_50px_-28px_rgba(12,12,12,0.35)]">
        <header className="flex items-start gap-3 border-b border-border bg-card px-4 py-3">
          <Link
            href="/mesajlar"
            className="mt-1 grid size-9 shrink-0 place-items-center rounded-full hover:bg-muted"
            aria-label="Sohbet listesi"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <UserAvatar src={avatarSrc} name={avatarName} className="mt-0.5 size-11 text-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium">{subtitle}</p>
            {listingHref ? (
              <Link href={listingHref} className="block truncate text-xs text-muted-foreground underline-offset-2 hover:underline">
                {title}
              </Link>
            ) : (
              <p className="truncate text-xs text-muted-foreground">{title}</p>
            )}
          </div>
          {actions && <div className="flex max-w-[46%] shrink-0 flex-col items-end gap-2">{actions}</div>}
        </header>
        {banner}
        <div className="flex min-h-0 flex-1 flex-col bg-[#f6f3ec]">
          <ChatBox conversationId={conversationId} userId={userId} initial={initial} />
        </div>
      </div>
    </div>
  );
}

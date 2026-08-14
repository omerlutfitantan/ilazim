"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { resendVerificationAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { DraftSummary } from "@/components/listing-steps";

export default function DogrulaClient() {
  const params = useSearchParams();
  const email = params.get("email") ?? "";
  const next = params.get("next") || "/hesabim";
  const [state, action, pending] = useActionState(resendVerificationAction, null);

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="rounded-[1.75rem] border border-border bg-card p-8 md:p-10">
        <Mail className="size-8 text-ink" />
        <h1 className="mt-4 font-display text-4xl">E-postanı doğrula</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {email ? (
            <>
              <strong className="text-foreground">{email}</strong> adresine bir bağlantı gönderdik.
              Tıklamadan üyelik açılmaz. İlan özetiniz burada durur; doğrulayınca yayınlanır.
            </>
          ) : (
            <>Gelen kutundaki doğrulama bağlantısına tıklamadan üye olamazsın.</>
          )}
        </p>
        <div className="mt-6">
          <DraftSummary />
        </div>
        <form action={action} className="mt-8 space-y-3">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
          {state && "error" in state && state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state && "ok" in state && (
            <p className="text-sm text-primary">Yeniden gönderildi. Spam klasörüne de bak.</p>
          )}
          <Button type="submit" variant="outline" className="w-full" disabled={pending || !email}>
            {pending ? "Gönderiliyor…" : "Maili yeniden gönder"}
          </Button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { requestPasswordResetAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

export default function Page() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, null);
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-[1.75rem] border border-border bg-card p-8">
        <h1 className="font-display text-4xl">Şifre sıfırla</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">
          Kayıtlı e-postana bir bağlantı göndeririz. Yalnızca doğrulanmış hesaplar şifre yeniler.
        </p>
        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input id="email" name="email" type="email" required className="mt-1" />
          </div>
          {state && "error" in state && state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          {state && "ok" in state && <p className="text-sm text-primary">Mail gönderildi. Gelen kutunu kontrol et.</p>}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Gönderiliyor…" : "Bağlantı gönder"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm">
          <Link href="/giris" className="underline">
            Girişe dön
          </Link>
        </p>
      </div>
    </div>
  );
}

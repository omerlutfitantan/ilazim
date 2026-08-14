"use client";

import { useActionState } from "react";
import { updatePasswordAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Page() {
  const [state, action, pending] = useActionState(updatePasswordAction, null);
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-[1.75rem] border border-border bg-card p-8">
        <h1 className="font-display text-4xl">Yeni şifre</h1>
        <p className="mt-2 mb-6 text-sm text-muted-foreground">Maildeki bağlantıdan geldin. Yeni şifreni yaz.</p>
        <form action={action} className="space-y-4">
          <div>
            <Label htmlFor="password">Yeni şifre</Label>
            <Input id="password" name="password" type="password" required minLength={8} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="passwordConfirm">Şifre tekrar</Label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              required
              minLength={8}
              className="mt-1"
            />
          </div>
          {state && "error" in state && state.error && (
            <p className="text-sm text-destructive">{state.error}</p>
          )}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Kaydediliyor…" : "Şifreyi güncelle"}
          </Button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { grantBalanceAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoneyInput } from "@/components/money-input";

export function GrantForm({ userId }: { userId?: string }) {
  const [state, action, pending] = useActionState(grantBalanceAction, null);
  return (
    <form action={action} className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-2">
      {userId ? (
        <input type="hidden" name="userId" value={userId} />
      ) : (
        <div className="md:col-span-2">
          <Label>Kullanıcı UUID</Label>
          <Input name="userId" required className="mt-1" />
        </div>
      )}
      <div className="md:col-span-2">
        <Label>Bakiye (TL)</Label>
        <MoneyInput name="amount" required className="mt-1" />
      </div>
      <div className="md:col-span-2">
        <Label>Not</Label>
        <Input name="note" placeholder="Admin yüklemesi" className="mt-1" />
      </div>
      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive md:col-span-2">{state.error}</p>
      )}
      {state && "ok" in state && (
        <p className="text-sm text-primary md:col-span-2">Nakit bakiyeye yüklendi.</p>
      )}
      <Button type="submit" disabled={pending} className="md:col-span-2">
        Bakiye yükle
      </Button>
    </form>
  );
}

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
      <div>
        <Label>Tutar</Label>
        <MoneyInput name="amount" required className="mt-1" />
      </div>
      <div>
        <Label>Tür</Label>
        <select name="kind" className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm">
          <option value="credit">Kredi</option>
          <option value="cash">Nakit</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <Label>Not</Label>
        <Input name="note" className="mt-1" />
      </div>
      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state && "ok" in state && <p className="text-sm text-primary">Yüklendi.</p>}
      <Button type="submit" disabled={pending}>
        Yükle
      </Button>
    </form>
  );
}

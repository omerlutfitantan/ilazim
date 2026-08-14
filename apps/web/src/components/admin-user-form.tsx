"use client";

import { useActionState } from "react";
import { adminUpdateUserAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileRow } from "@/lib/database.types";

export function AdminUserForm({ profile }: { profile: ProfileRow }) {
  const [state, action, pending] = useActionState(adminUpdateUserAction, null);
  return (
    <form action={action} className="grid gap-4 md:grid-cols-2">
      <input type="hidden" name="userId" value={profile.id} />
      <div>
        <Label>Ad soyad</Label>
        <Input name="fullName" defaultValue={profile.full_name ?? ""} required minLength={2} className="mt-1" />
      </div>
      <div>
        <Label>Görünen ad</Label>
        <Input name="displayName" defaultValue={profile.display_name ?? ""} required minLength={2} className="mt-1" />
      </div>
      <div>
        <Label>Telefon</Label>
        <Input name="phone" defaultValue={profile.phone ?? ""} className="mt-1" />
      </div>
      <div>
        <Label>Rol</Label>
        <select
          name="role"
          defaultValue={profile.role}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
        >
          <option value="buyer">Alıcı</option>
          <option value="seller">Satıcı</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      <div>
        <Label>Satıcı durumu</Label>
        <select
          name="sellerStatus"
          defaultValue={profile.seller_status ?? ""}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
        >
          <option value="">Yok</option>
          <option value="pending">İncelemede</option>
          <option value="approved">Onaylı</option>
          <option value="rejected">Reddedildi</option>
          <option value="suspended">Askıda</option>
        </select>
      </div>
      <div>
        <Label>Satıcı türü</Label>
        <select
          name="sellerType"
          defaultValue={profile.seller_type ?? ""}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
        >
          <option value="">Yok</option>
          <option value="service">Hizmet</option>
          <option value="product">Ürün</option>
          <option value="both">Hizmet ve ürün</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <Label>Satıcı başlığı</Label>
        <Input name="sellerHeadline" defaultValue={profile.seller_headline ?? ""} className="mt-1" />
      </div>
      <div className="md:col-span-2">
        <Label>Hakkında</Label>
        <Textarea name="bio" defaultValue={profile.bio ?? ""} className="mt-1 min-h-24" />
      </div>
      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive md:col-span-2">{state.error}</p>
      )}
      {state && "ok" in state && <p className="text-sm text-primary md:col-span-2">Kaydedildi.</p>}
      <Button type="submit" disabled={pending} className="md:col-span-2">
        {pending ? "Kaydediliyor…" : "Kullanıcıyı güncelle"}
      </Button>
    </form>
  );
}

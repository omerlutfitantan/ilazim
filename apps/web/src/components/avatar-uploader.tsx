"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { saveAvatarUrlAction } from "@/actions";
import { compressAvatar } from "@/lib/compress-image";
import { createClient } from "@/lib/supabase/client";
import { publicStorageUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";

export function AvatarUploader({
  userId,
  avatarUrl,
  name,
}: {
  userId: string;
  avatarUrl: string | null;
  name: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function pick() {
    inputRef.current?.click();
  }

  function onFile(file: File | undefined) {
    if (!file) return;
    start(async () => {
      try {
        const { blob, ext } = await compressAvatar(file);
        const supabase = createClient();
        const path = `${userId}/avatar.${ext}`;
        await supabase.storage.from("avatars").remove([`${userId}/avatar.webp`, `${userId}/avatar.jpg`]);
        const { error } = await supabase.storage.from("avatars").upload(path, blob, {
          upsert: true,
          contentType: blob.type,
          cacheControl: "3600",
        });
        if (error) throw error;
        const url = `${publicStorageUrl("avatars", path)}?v=${Date.now()}`;
        const saved = await saveAvatarUrlAction(url);
        if (saved.error) throw new Error(saved.error);
        setPreview(url);
        toast.success("Profil resmi güncellendi");
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Yükleme başarısız");
      }
    });
  }

  function remove() {
    start(async () => {
      const supabase = createClient();
      await supabase.storage.from("avatars").remove([`${userId}/avatar.webp`, `${userId}/avatar.jpg`]);
      const saved = await saveAvatarUrlAction(null);
      if (saved.error) {
        toast.error(saved.error);
        return;
      }
      setPreview("");
      toast.success("Profil resmi kaldırıldı");
    });
  }

  const shown = preview === "" ? null : (preview ?? avatarUrl);

  return (
    <div className="flex items-center gap-4">
      <UserAvatar src={shown} name={name} className="size-20 text-lg" />
      <div className="space-y-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            onFile(file);
          }}
        />
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={pick} disabled={pending}>
            {pending ? "İşleniyor…" : "Fotoğraf yükle"}
          </Button>
          {shown && (
            <Button type="button" size="sm" variant="outline" onClick={remove} disabled={pending}>
              Kaldır
            </Button>
          )}
        </div>
        <p className="max-w-xs text-xs text-muted-foreground">
          Kare kırpılır, 256 px WebP’ye düşürülür. Sunucuda birkaç on kilobayt yer kaplar.
        </p>
      </div>
    </div>
  );
}

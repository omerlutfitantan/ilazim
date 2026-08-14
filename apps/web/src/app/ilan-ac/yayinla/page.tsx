"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { publishListingAction } from "@/actions";
import { clearDraft, isDraftPublishable, readDraft, writeDraft, type ListingDraft } from "@/lib/listing-draft";

export default function Page() {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<ListingDraft | null>(null);
  const [state, action] = useActionState(publishListingAction, null);
  const submitted = useRef(false);

  useEffect(() => {
    const d = readDraft();
    if (!isDraftPublishable(d)) {
      router.replace("/ilan-ac");
      return;
    }
    setDraft(d);
  }, [router]);

  useEffect(() => {
    if (!draft || submitted.current) return;
    submitted.current = true;
    formRef.current?.requestSubmit();
  }, [draft]);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      clearDraft();
      router.replace("/hesabim");
    }
  }, [state, router]);

  useEffect(() => {
    if (state && "error" in state && state.error && draft) {
      writeDraft(draft);
      submitted.current = false;
    }
  }, [state, draft]);

  if (state && "error" in state && state.error && draft) {
    return (
      <div className="text-center">
        <h1 className="font-display text-4xl">Yayınlanamadı</h1>
        <p className="mt-4 text-sm text-destructive">{state.error}</p>
      </div>
    );
  }

  if (!draft) return null;

  return (
    <div className="text-center">
      <p className="text-[13px] font-medium tracking-[0.18em] text-muted-foreground uppercase">İlan</p>
      <h1 className="mt-2 font-display text-4xl">Yayınlanıyor…</h1>
      <p className="mt-4 text-sm text-muted-foreground">Taslağınız kaydediliyor.</p>
      <form ref={formRef} action={action} className="hidden">
        <input name="kind" defaultValue={draft.kind} />
        <input name="categoryId" defaultValue={draft.categoryId} />
        <input name="title" defaultValue={draft.title} />
        <input name="description" defaultValue={draft.description} />
        <input name="cityId" defaultValue={draft.cityId} />
        {draft.districtId && <input name="districtId" defaultValue={draft.districtId} />}
        {draft.budgetMin && <input name="budgetMin" defaultValue={draft.budgetMin} />}
        {draft.budgetMax && <input name="budgetMax" defaultValue={draft.budgetMax} />}
        {draft.showPhone && <input name="showPhone" defaultValue="on" />}
        {draft.phone && <input name="phone" defaultValue={draft.phone} />}
        <input name="stay" defaultValue="1" />
      </form>
    </div>
  );
}

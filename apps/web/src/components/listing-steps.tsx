"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Hammer, ShoppingBag } from "lucide-react";
import { KIND_LABELS, normalizeTrPhone, type ListingKind } from "@ilazim/shared";
import { isDraftPublishable, readDraft, writeDraft } from "@/lib/listing-draft";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MoneyInput } from "@/components/money-input";
import { PhoneInput } from "@/components/phone-input";
import { cn } from "@/lib/utils";

type Cat = { id: string; name: string; kind: ListingKind };
type Loc = { id: string; name: string; parent_id: string | null; type: string };

export function StepKind({ initialKind }: { initialKind?: ListingKind }) {
  const router = useRouter();
  const [kind, setKind] = useState<ListingKind>(initialKind ?? "service");

  useEffect(() => {
    if (initialKind) setKind(initialKind);
  }, [initialKind]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        writeDraft({ kind, categoryId: undefined, categoryName: undefined });
        router.push("/ilan-ac/kategori");
      }}
    >
      <p className="text-sm text-muted-foreground">Ne arıyorsunuz?</p>
      <h2 className="mt-1 font-display text-2xl md:text-3xl">Hizmet mi, ürün mü?</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {(
          [
            {
              id: "service" as const,
              Icon: Hammer,
              hint: "Temizlik, tadilat, tamirat, nakliyat…",
            },
            {
              id: "product" as const,
              Icon: ShoppingBag,
              hint: "Bisiklet, elektronik, mobilya…",
            },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setKind(item.id)}
            className={cn(
              "rounded-2xl border p-6 text-left transition-colors",
              kind === item.id
                ? "border-ink bg-ink text-white"
                : "border-border hover:border-ink/40",
            )}
          >
            <item.Icon className={cn("size-6", kind === item.id ? "text-accent" : "text-ink")} />
            <p className="mt-4 font-display text-2xl">{KIND_LABELS[item.id]}</p>
            <p className={cn("mt-1 text-sm", kind === item.id ? "text-white/60" : "text-muted-foreground")}>
              {item.hint}
            </p>
          </button>
        ))}
      </div>
      <Button type="submit" className="mt-8">
        Devam
      </Button>
    </form>
  );
}

export function StepCategory({
  categories,
  blockedIds = [],
}: {
  categories: Cat[];
  blockedIds?: string[];
}) {
  const router = useRouter();
  const [kind, setKind] = useState<ListingKind | "">("");
  const [categoryId, setCategoryId] = useState("");
  const blocked = new Set(blockedIds);

  useEffect(() => {
    const d = readDraft();
    if (!d.kind) {
      router.replace("/ilan-ac");
      return;
    }
    setKind(d.kind);
    setCategoryId(d.categoryId && !blocked.has(d.categoryId) ? d.categoryId : "");
  }, [router, blockedIds]);

  const filtered = categories.filter((c) => c.kind === kind);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const cat = filtered.find((c) => c.id === categoryId);
        if (!cat || blocked.has(cat.id)) return;
        writeDraft({ categoryId: cat.id, categoryName: cat.name });
        router.push("/ilan-ac/detay");
      }}
    >
      <p className="text-sm text-muted-foreground">
        {kind ? KIND_LABELS[kind] : "…"}
      </p>
      <h2 className="mt-1 font-display text-2xl md:text-3xl">Kategori seçin</h2>
      {kind === "service" && blocked.size > 0 && (
        <p className="mt-2 text-sm text-muted-foreground">
          Hizmetlerim’e eklediğin kategorilerde talep açamazsın. Başka kategorilerde hizmet alabilirsin.
        </p>
      )}
      <div className="mt-8 grid gap-2 sm:grid-cols-2">
        {filtered.map((c) => {
          const locked = blocked.has(c.id);
          return (
            <button
              key={c.id}
              type="button"
              disabled={locked}
              onClick={() => setCategoryId(c.id)}
              className={cn(
                "rounded-xl border px-4 py-3 text-left text-sm font-medium",
                locked && "cursor-not-allowed opacity-40",
                !locked && categoryId === c.id && "border-ink bg-ink text-white",
                !locked && categoryId !== c.id && "border-border bg-background",
              )}
            >
              {c.name}
              {locked ? " · veriyorsunuz" : ""}
            </button>
          );
        })}
      </div>
      <Button type="submit" className="mt-8" disabled={!categoryId || blocked.has(categoryId)}>
        Devam
      </Button>
    </form>
  );
}

export function StepDetail() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const d = readDraft();
    if (!d.kind || !d.categoryId) {
      router.replace("/ilan-ac");
      return;
    }
    setTitle(d.title ?? "");
    setDescription(d.description ?? "");
  }, [router]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        writeDraft({ title: title.trim(), description: description.trim() });
        router.push("/ilan-ac/konum");
      }}
    >
      <p className="text-sm text-muted-foreground">Talebiniz</p>
      <h2 className="mt-1 font-display text-2xl md:text-3xl">Ne lazım, yazın</h2>
      <div>
        <Label htmlFor="title">Başlık</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          minLength={8}
          required
          className="mt-1"
          placeholder="Örn. Kadıköy 3+1 ev derin temizlik"
        />
      </div>
      <div>
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          minLength={20}
          required
          className="mt-1 min-h-40"
          placeholder="Metrekare, zaman, malzeme, teslim… ne kadar net yazarsanız o kadar isabetli teklif gelir."
        />
      </div>
      <Button type="submit">Devam</Button>
    </form>
  );
}

export function StepLocation({ cities, districts }: { cities: Loc[]; districts: Loc[] }) {
  const router = useRouter();
  const [cityId, setCityId] = useState("");
  const [districtId, setDistrictId] = useState("");

  useEffect(() => {
    const d = readDraft();
    if (!d.title) {
      router.replace("/ilan-ac/detay");
      return;
    }
    setCityId(d.cityId ?? "");
    setDistrictId(d.districtId ?? "");
  }, [router]);

  const cityDistricts = districts.filter((d) => d.parent_id === cityId);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const city = cities.find((c) => c.id === cityId);
        const district = cityDistricts.find((d) => d.id === districtId);
        writeDraft({
          cityId,
          cityName: city?.name,
          districtId: districtId || null,
          districtName: district?.name ?? null,
        });
        router.push("/ilan-ac/iletisim");
      }}
    >
      <p className="text-sm text-muted-foreground">Nerede?</p>
      <h2 className="mt-1 font-display text-2xl md:text-3xl">Şehir ve ilçe</h2>
      <div>
        <Label>Şehir</Label>
        <select
          required
          value={cityId}
          onChange={(e) => {
            setCityId(e.target.value);
            setDistrictId("");
          }}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
        >
          <option value="">Seçin</option>
          {cities.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label>İlçe</Label>
        <select
          required
          value={districtId}
          onChange={(e) => setDistrictId(e.target.value)}
          className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3 text-sm"
        >
          <option value="">Seçin</option>
          {cityDistricts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit">Devam</Button>
    </form>
  );
}

export function StepContact({ authed, defaultPhone }: { authed: boolean; defaultPhone?: string | null }) {
  const router = useRouter();
  const [budgetMin, setBudgetMin] = useState("");
  const [budgetMax, setBudgetMax] = useState("");
  const [showPhone, setShowPhone] = useState(false);
  const [phone, setPhone] = useState(() => normalizeTrPhone(defaultPhone) ?? "");

  useEffect(() => {
    const d = readDraft();
    if (!d.cityId || !d.districtId) {
      router.replace("/ilan-ac/konum");
      return;
    }
    setBudgetMin(d.budgetMin ?? "");
    setBudgetMax(d.budgetMax ?? "");
    setShowPhone(Boolean(d.showPhone));
    setPhone(normalizeTrPhone(d.phone ?? defaultPhone) ?? "");
  }, [router, defaultPhone]);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        writeDraft({ budgetMin, budgetMax, showPhone, phone: normalizeTrPhone(phone) ?? "" });
        router.push(authed ? "/ilan-ac/yayinla" : "/ilan-ac/hesap");
      }}
    >
      <p className="text-sm text-muted-foreground">Son bilgiler</p>
      <h2 className="mt-1 font-display text-2xl md:text-3xl">Bütçe ve telefon</h2>
      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <Label>Min bütçe (TL)</Label>
          <MoneyInput optional className="mt-1" value={budgetMin} onValueChange={setBudgetMin} />
        </div>
        <div>
          <Label>Max bütçe (TL)</Label>
          <MoneyInput optional className="mt-1" value={budgetMax} onValueChange={setBudgetMax} />
        </div>
      </div>
      <label className="flex items-start gap-3 rounded-2xl border border-border bg-background p-4 text-sm">
        <input
          type="checkbox"
          checked={showPhone}
          onChange={(e) => setShowPhone(e.target.checked)}
          className="mt-1 size-4"
        />
        <span>
          <span className="font-medium">Telefonum teklif verenlere açılsın</span>
          <span className="mt-1 block text-muted-foreground">
            Numara yalnızca teklif ücretini ödeyen satıcıya “İletişimi gör” ile açılır.
          </span>
        </span>
      </label>
      <div>
        <Label htmlFor="phone">Telefon</Label>
        <PhoneInput id="phone" value={phone} onValueChange={setPhone} className="mt-1" />
      </div>
      <Button type="submit">{authed ? "İlanı yayınla" : "Giriş yap"}</Button>
    </form>
  );
}

export function DraftSummary() {
  const [draft, setDraft] = useState<ReturnType<typeof readDraft>>({});
  useEffect(() => setDraft(readDraft()), []);
  if (!isDraftPublishable(draft)) return null;
  return (
    <div className="rounded-2xl bg-ink p-5 text-white">
      <p className="text-[11px] font-medium tracking-[0.16em] text-accent uppercase">İlan özeti</p>
      <p className="mt-2 font-display text-xl leading-tight">{draft.title}</p>
      <p className="mt-2 text-sm text-white/60">
        {draft.categoryName} · {[draft.cityName, draft.districtName].filter(Boolean).join(" / ")}
      </p>
      <p className="mt-3 line-clamp-4 text-sm leading-6 text-white/80">{draft.description}</p>
    </div>
  );
}

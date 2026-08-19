import Link from "next/link";
import { Check } from "lucide-react";
import { SignInForm, SignUpForm } from "@/components/auth-forms";
import { DraftSummary } from "@/components/listing-steps";
import type { LocOption } from "@/components/city-district-fields";

const LOGIN_POINTS = [
  "Doğrulanmış hesapla teklif ve mesaj",
  "İlanların ve cüzdanın tek yerde",
  "Telefon yalnızca ücretli tekliften sonra",
];

const SIGNUP_POINTS = [
  "E-posta doğrulanmadan üye olunamaz",
  "Aynı hesapla hem talep açar hem teklif verirsin",
  "Verdiğin hizmet kategorisinde kendin talep açamazsın",
];

function InkPanel({
  kicker,
  title,
  points,
}: {
  kicker: string;
  title: string;
  points: string[];
}) {
  return (
    <div className="flex flex-col justify-between rounded-[1.75rem] bg-ink p-8 text-white md:p-10">
      <div>
        <p className="text-[13px] font-medium tracking-[0.18em] text-accent uppercase">{kicker}</p>
        <h1 className="mt-4 font-display text-3xl leading-[0.95] md:text-5xl">{title}</h1>
        <ul className="mt-8 space-y-3">
          {points.map((p) => (
            <li key={p} className="flex gap-3 text-sm leading-6 text-white/75">
              <Check className="mt-0.5 size-4 shrink-0 text-accent" />
              {p}
            </li>
          ))}
        </ul>
      </div>
      <p className="mt-10 text-xs text-white/40">Talepik · teklif gelsin</p>
    </div>
  );
}

export function AuthScreen({
  mode,
  next,
  cities = [],
  districts = [],
}: {
  mode: "giris" | "kayit";
  next?: string;
  cities?: LocOption[];
  districts?: LocOption[];
}) {
  const adminGate = Boolean(next?.startsWith("/admin"));
  const otherHref =
    mode === "giris"
      ? `/kayit${next ? `?next=${encodeURIComponent(next)}` : ""}`
      : `/giris${next ? `?next=${encodeURIComponent(next)}` : ""}`;

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-12 lg:py-16">
      <div className="order-2 lg:order-1 lg:col-span-5">
        {mode === "giris" ? (
          <InkPanel
            kicker={adminGate ? "Admin" : "Giriş"}
            title={adminGate ? "Panel için admin hesabıyla gir." : "Hesabın varsa buradan gir."}
            points={
              adminGate
                ? [
                    "Admin paneli herkese açık değil",
                    "Önce doğrulanmış admin hesabıyla giriş",
                    "Alıcı veya satıcı hesabı panele giremez",
                  ]
                : LOGIN_POINTS
            }
          />
        ) : (
          <InkPanel
            kicker="Kayıt"
            title="Yeni hesap. Önce e-posta doğrulaması."
            points={SIGNUP_POINTS}
          />
        )}
      </div>
      <div className="order-1 lg:order-2 lg:col-span-7">
        <div className="rounded-[1.5rem] border border-border bg-card p-5 md:rounded-[1.75rem] md:p-10">
          <h2 className="font-display text-2xl md:text-3xl">
            {adminGate && mode === "giris" ? "Admin girişi" : mode === "giris" ? "Giriş yap" : "Hesap oluştur"}
          </h2>
          <p className="mt-2 mb-8 text-sm text-muted-foreground">
            {adminGate && mode === "giris"
              ? "Bu sayfa paneli korur. Admin olarak giriş yapınca /admin açılır."
              : mode === "giris"
                ? "Doğrulanmış e-posta ve şifrenle devam et. Hesabın yoksa kayıt ayrı bir adımdır."
                : "Üyelik ancak maildeki bağlantıya tıklayınca açılır. Aynı hesap hem hizmet alır hem verir."}
          </p>
          {next?.includes("/ilan-ac") && (
            <div className="mb-8">
              <DraftSummary />
            </div>
          )}
          {mode === "giris" ? <SignInForm next={next} /> : <SignUpForm next={next} cities={cities} districts={districts} />}
        </div>
        {!adminGate && (
          <Link
            href={otherHref}
            className="mt-4 flex items-center justify-between rounded-[1.75rem] border border-border bg-background px-6 py-5 transition-colors hover:border-ink"
          >
            <span>
              <span className="block text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
                {mode === "giris" ? "Hesabın yok" : "Zaten üyeyim"}
              </span>
              <span className="mt-1 block font-display text-xl">
                {mode === "giris" ? "Kayıt ol" : "Giriş yap"}
              </span>
            </span>
            <span className="text-sm underline underline-offset-4">
              {mode === "giris" ? "Kayıt" : "Giriş"}
            </span>
          </Link>
        )}
      </div>
    </div>
  );
}

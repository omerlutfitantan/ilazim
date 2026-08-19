"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, FileText, Megaphone, Star, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    icon: FileText,
    number: "01",
    title: "İlan aç",
    body: "Hizmet veya ürün kategorisini seç, ihtiyacını adım adım anlat. Son adımda e-posta doğrulaması gerekir. Alıcılar için ücretsizdir; ilan 14 gün boyunca yayında kalır.",
  },
  {
    icon: Megaphone,
    number: "02",
    title: "Teklifler gelsin",
    body: "Onaylı satıcılar cüzdanlarından sabit bir teklif ücreti ödeyerek başvurur. Hizmet verenler yalnızca kendi kategorilerindeki ilanları görür; ürün ilanları tüm satıcılara açıktır. Profillerini, yorumlarını ve puanlarını görebilirsin.",
  },
  {
    icon: Star,
    number: "03",
    title: "Seç ve bitir",
    body: "Kazananı sen seçersin. Seçimden sonra ilan yeni tekliflere kapanır. İş tamamlanınca satıcıyı puanlayabilir ve yorum yazabilirsin.",
  },
  {
    icon: Wallet,
    number: "04",
    title: "Süre dolarsa iade",
    body: "14 gün içinde teklif seçilmezse ilan otomatik olarak kapanır ve teklif veren tüm satıcıların ödediği ücret cüzdanlarına iade edilir. Yeni bir ilan açman yeterli.",
  },
];

const FAQS: { q: string; a: string }[] = [
  {
    q: "İlan açmak ücretli mi?",
    a: "Hayır. Hizmet veya ürün ihtiyacını yayımlamak tamamen ücretsizdir. Yalnızca teklif veren satıcılar sabit bir ücret öder.",
  },
  {
    q: "İlanım ne kadar süre yayında kalır?",
    a: "Her ilan yayımlandıktan itibaren 14 gün boyunca açık kalır. Bu süre içinde teklif seçmezsen ilan otomatik olarak kapanır.",
  },
  {
    q: "Teklif ücreti iade edilir mi?",
    a: "Teklif ücreti iki durumda iade edilir: (1) İlan süresi 14 günde dolduğunda teklif seçilmemiş olduğu için teklif veren tüm satıcılara ücret iade edilir. (2) Başka bir durum için iade yapılmaz; teklif verilmesi, başka teklifin seçilmesi veya ilanın ilan sahibi tarafından iptal edilmesi iade sebebi değildir.",
  },
  {
    q: "Teklifim reddedilirse para iade alır mıyım?",
    a: "Hayır. Teklif ücreti, başvuru hakkının kullanılması karşılığı alınır; reddin ardından iade edilmez. İade yalnızca ilan süresinin dolmasıyla otomatik olarak gerçekleşir.",
  },
  {
    q: "Teklifimi geri çekebilir miyim?",
    a: "İlan sahibi henüz bir teklif seçmemişse teklifini geri çekebilirsin; ancak bu durumda ücret iadesi yapılmaz.",
  },
  {
    q: "Kaç teklife başvurabilir miyim?",
    a: "İstediğin kadar farklı ilana teklif verebilirsin. Her teklif için ayrı bir ücret ödenir.",
  },
  {
    q: "İlan sahibi ilanı iptal ederse ne olur?",
    a: "İlan sahibi ilanı manuel olarak iptal ederse teklif verenler ücretsiz ücret iadesi almaz; bu durum iade kapsamı dışındadır. Yalnızca 14 günlük süre sonunda teklif seçilmemesi iade hakkı doğurur.",
  },
  {
    q: "Süresi dolan ilanı yenileyebilir miyim?",
    a: "Hayır, süresi dolan ilanlar yenilenemez. Yeni bir ilan açman gerekir.",
  },
  {
    q: "Satıcı nasıl olunur?",
    a: "Kayıt olduktan sonra satıcı başvuru formunu doldur. Başvurun onaylandığında cüzdanına hoş geldin bakiyesi yüklenir ve teklif vermeye başlayabilirsin.",
  },
  {
    q: "İletişim bilgilerim herkese görünür mü?",
    a: "Hayır. Telefon numaranı yalnızca teklif ücreti ödemiş satıcılar 'İletişimi gör' düğmesiyle görebilir. Herkese açık ilan sayfasında kişisel bilgin görünmez.",
  },
];

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border last:border-0">
      <button
        className="flex w-full items-center justify-between gap-4 py-5 text-left font-medium leading-snug"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{q}</span>
        <ChevronDown
          className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200", open && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "overflow-hidden text-[15px] leading-7 text-muted-foreground transition-all duration-300",
          open ? "max-h-96 pb-5 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        {a}
      </div>
    </div>
  );
}

export function NasilCalisirClient() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      {/* Header */}
      <p className="text-[13px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
        Talepik
      </p>
      <h1 className="mt-3 font-display text-5xl">Nasıl çalışır</h1>
      <p className="mt-4 text-[15px] leading-7 text-muted-foreground">
        İhtiyacını anlat, teklifler gelsin — ilan açmak ücretsiz, teklif seçimi sana ait.
      </p>

      {/* Steps */}
      <ol className="relative mt-14 space-y-0">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isLast = idx === STEPS.length - 1;
          return (
            <li key={step.number} className="relative flex gap-6">
              {/* connector line */}
              {!isLast && (
                <div className="absolute top-10 left-5 h-full w-px bg-border" aria-hidden />
              )}
              {/* icon */}
              <div className="relative z-10 mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-ink">
                <Icon className="size-4" strokeWidth={2.2} />
              </div>
              <div className={`${isLast ? "pb-0" : "pb-10"} min-w-0`}>
                <p className="text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">{step.number}</p>
                <p className="mt-0.5 font-display text-2xl">{step.title}</p>
                <p className="mt-2 text-[15px] leading-7 text-muted-foreground">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>

      {/* FAQ */}
      <div className="mt-20">
        <h2 className="font-display text-3xl">Sık sorulan sorular</h2>
        <div className="mt-6 divide-y divide-border rounded-2xl border border-border px-6">
          {FAQS.map((item) => (
            <Accordion key={item.q} q={item.q} a={item.a} />
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-14 flex flex-wrap gap-3">
        <Link
          href="/ilan-ac"
          className="inline-flex h-11 items-center rounded-xl bg-ink px-5 text-sm font-semibold text-accent transition-all hover:bg-ink/80"
        >
          Hemen ilan aç →
        </Link>
        <Link
          href="/sartlar"
          className="inline-flex h-11 items-center rounded-xl border border-border px-5 text-sm font-semibold transition-all hover:bg-muted"
        >
          Kullanım koşulları
        </Link>
      </div>
    </div>
  );
}

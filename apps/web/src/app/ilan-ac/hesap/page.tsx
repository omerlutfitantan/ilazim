import { redirect } from "next/navigation";
import Link from "next/link";
import { getProfile } from "@/lib/data";
import { DraftSummary } from "@/components/listing-steps";
import { SignInForm } from "@/components/auth-forms";

export default async function Page() {
  const profile = await getProfile();
  if (profile) redirect("/ilan-ac/yayinla");

  return (
    <div>
      <p className="text-sm text-muted-foreground">6 / 6</p>
      <h2 className="mt-1 font-display text-3xl">Giriş yap</h2>
      <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
        İlanınız kayıtlı duruyor. Giriş yapınca yayınlanır. Hesabınız yoksa kayıt olun; yazdıklarınız
        silinmez.
      </p>
      <div className="mt-6">
        <DraftSummary />
      </div>
      <div className="mt-8">
        <SignInForm next="/ilan-ac/yayinla" compact />
      </div>
      <Link
        href="/ilan-ac/kayit"
        className="mt-6 flex items-center justify-between rounded-2xl border border-border px-5 py-4 hover:border-ink"
      >
        <span>
          <span className="block text-[11px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
            Hesabım yok
          </span>
          <span className="mt-1 block font-display text-xl">Kayıt ol</span>
        </span>
        <span className="text-sm underline underline-offset-4">Kayıt</span>
      </Link>
    </div>
  );
}

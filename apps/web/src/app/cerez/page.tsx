import Link from "next/link";
import { CookiePageCta } from "@/components/cookie-banner";

export const metadata = { title: "Çerez politikası" };

export default function Page() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 text-[15px] leading-7">
      <h1 className="font-display text-4xl">Çerez politikası</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        6698 sayılı KVKK ve 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun çerçevesinde.
        Son güncelleme: 14 Ağustos 2026.
      </p>

      <h2 className="mt-10 font-display text-2xl">1. Nedir?</h2>
      <p className="mt-3 text-muted-foreground">
        Çerez, tarayıcınıza bırakılan küçük bir metin dosyasıdır. iLazım; oturumu açık tutmak, güvenliği
        sağlamak ve (onayınız varsa) tercihlerinizi hatırlamak için çerez kullanır. Reklam ağı veya üçüncü
        taraf izleme çerezi şu an kullanılmaz.
      </p>

      <h2 className="mt-10 font-display text-2xl">2. Onay</h2>
      <p className="mt-3 text-muted-foreground">
        Zorunlu çerezler, sitenin çalışması ve sözleşmenin ifası için KVKK md. 5/2-c kapsamında onay
        aranmadan kullanılır. Tercih çerezleri ancak “Kabul et” derseniz yazılır. Kararınızı dilediğiniz an
        footer’daki “Çerez ayarları” ile değiştirebilirsiniz. Onay kaydı{" "}
        <span className="text-foreground">ilazim_consent</span> çerezinde tutulur.
      </p>

      <h2 className="mt-10 font-display text-2xl">3. Kullandığımız çerezler</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-border">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead className="bg-muted/60 text-xs tracking-wide uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Ad</th>
              <th className="px-4 py-3 font-medium">Tür</th>
              <th className="px-4 py-3 font-medium">Süre</th>
              <th className="px-4 py-3 font-medium">Amaç</th>
            </tr>
          </thead>
          <tbody className="text-muted-foreground">
            <tr className="border-t border-border">
              <td className="px-4 py-3 font-medium text-foreground">ilazim_consent</td>
              <td className="px-4 py-3">Zorunlu</td>
              <td className="px-4 py-3">1 yıl</td>
              <td className="px-4 py-3">Çerez tercihini saklar</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-4 py-3 font-medium text-foreground">sb-*-auth-token ve benzeri</td>
              <td className="px-4 py-3">Zorunlu</td>
              <td className="px-4 py-3">Oturum</td>
              <td className="px-4 py-3">Giriş, güvenlik, hesap</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-4 py-3 font-medium text-foreground">ilazim_desk</td>
              <td className="px-4 py-3">Tercih</td>
              <td className="px-4 py-3">1 yıl</td>
              <td className="px-4 py-3">Alıcı / hizmet veren masası</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-4 py-3 font-medium text-foreground">ilazim_welcome</td>
              <td className="px-4 py-3">Tercih</td>
              <td className="px-4 py-3">1 yıl</td>
              <td className="px-4 py-3">Karşılama afişinin kapatıldığını hatırlar</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 font-display text-2xl">4. Yerel depolama</h2>
      <p className="mt-3 text-muted-foreground">
        İlan taslağı tarayıcınızda <span className="text-foreground">ilazim_listing_draft</span> anahtarıyla
        saklanır. Bu bir çerez değildir; ilanı tamamlamanız için cihazınızda kalır ve sunucuya çerez olarak
        gönderilmez.
      </p>

      <h2 className="mt-10 font-display text-2xl">5. Analitik ve pazarlama</h2>
      <p className="mt-3 text-muted-foreground">
        Şu an reklam, yeniden pazarlama veya üçüncü taraf analitik çerezi yerleştirilmez. Eklenirse yalnızca
        “Kabul et” tercihinden sonra ve bu sayfa güncellenerek devreye alınır.
      </p>

      <h2 className="mt-10 font-display text-2xl">6. Yönetim</h2>
      <p className="mt-3 text-muted-foreground">
        Tarayıcı ayarlarından çerezleri silebilirsiniz; zorunlu çerezler silinirse giriş yapmanız gerekebilir.
        KVKK md. 11 haklarınız ve başvurular için{" "}
        <Link href="/kvkk" className="underline underline-offset-4">
          aydınlatma metni
        </Link>{" "}
        ve{" "}
        <a className="underline underline-offset-4" href="mailto:kvkk@ilazim.com">
          kvkk@ilazim.com
        </a>
        .
      </p>
      <CookiePageCta />
    </article>
  );
}

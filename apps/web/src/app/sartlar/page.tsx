import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Kullanım koşulları" };

export default function Page() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 text-[15px] leading-7">
      <h1 className="font-display text-4xl">Kullanım koşulları</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        6098 sayılı TBK, 6563 sayılı Elektronik Ticaretin Düzenlenmesi Hakkında Kanun ve 6502 sayılı TKHK
        çerçevesinde
      </p>

      <h2 className="mt-10 font-display text-2xl">1. Taraflar ve nitelik</h2>
      <p className="mt-3 text-muted-foreground">
        Talepik, hizmet veya ürün talebi yayımlayanlar ile teklif verenler arasında elektronik ortamda aracılık
        eden bir platformdur. Asıl edim ilişkisi ilan sahibi ile teklifi seçilen satıcı arasındadır. Platform,
        işin ifasından, ürünün ayıbından veya tarafların beyanlarından sorumlu tutulamaz; TBK md. 502 vd.
        anlamında komisyon aracısı gibi hareket eder.
      </p>

      <h2 className="mt-10 font-display text-2xl">2. Üyelik ve roller</h2>
      <p className="mt-3 text-muted-foreground">
        Kayıt varsayılan olarak talep sahibi (alıcı) hesabı oluşturur. Hizmet vermek veya ürün satmak için
        satıcı onayı gerekir. 18 yaşını doldurmamış kişiler üye olamaz. Hesap bilgilerinin doğruluğu üyeye
        aittir.
      </p>

      <h2 className="mt-10 font-display text-2xl">3. Teklif ücreti ve iade koşulları</h2>
      <p className="mt-3 text-muted-foreground">
        Satıcı, her teklifte Platform'un duyurduğu sabit ücreti peşinen öder. Bu ücret komisyon yüzdesi
        değildir; teklif hakkının kullanılması karşılığıdır.
      </p>
      <p className="mt-3 text-muted-foreground">
        <strong className="text-foreground">3.1 İade yapılmayan haller —</strong> Teklif ücreti kural olarak
        iade edilmez. Başka teklifin seçilmesi, ilanın ilan sahibi tarafından herhangi bir nedenle iptal
        edilmesi, işin gerçekleşmemesi, tarafların karşılıklı vazgeçmesi veya hesabın kapatılması iade sebebi
        sayılmaz. Cüzdan bakiyesi kullanıldığında da iade edilmez.
      </p>
      <p className="mt-3 text-muted-foreground">
        <strong className="text-foreground">3.2 İadenin mümkün olduğu tek hal: ilan süresinin dolması —</strong>{" "}
        İlan sahibinin 14 (on dört) günlük ilan süresi içinde hiçbir teklifi seçmemesi hâlinde, söz konusu
        ilana teklif vermiş tüm satıcıların ödediği teklif ücretleri, sistemin ilanı otomatik olarak
        "Süresi doldu" statüsüne almasının ardından herhangi bir başvuru gerekmeksizin ilgili satıcıların
        Platform cüzdanına iade edilir. Bu iade, Platform bakiyesi olarak yansıtılır; nakit olarak çekilemez.
      </p>

      <h2 className="mt-10 font-display text-2xl">4. İlan süresi ve yenileme yasağı</h2>
      <p className="mt-3 text-muted-foreground">
        Her ilan, yayımlanma tarihinden itibaren <strong className="text-foreground">14 (on dört) gün</strong>{" "}
        boyunca açık kalır. Bu süre zarfında teklif seçilmezse ilan otomatik olarak "Süresi doldu" statüsüne
        alınır, yayından kaldırılır ve yeni teklif kabul etmez.{" "}
        <strong className="text-foreground">Süresi dolan ilan hiçbir surette yenilenemez.</strong> İlan sahibi,
        ihtiyacı devam ediyorsa yeni bir ilan açmakla yükümlüdür. Platform, ilan süresi konusunda ilan sahibine
        ayrıca bildirimde bulunma yükümlülüğü taşımaz; sürenin takibi ilan sahibine aittir.
      </p>

      <h2 className="mt-10 font-display text-2xl">5. İletişim bilgisi</h2>
      <p className="mt-3 text-muted-foreground">
        İlan sahibi telefonunun teklif verenlere açılıp açılmayacağını seçer. Seçilse bile numara herkese açık
        ilanda görünmez. Telefon ancak teklif ücreti tahsil edildikten sonra "İletişimi gör" ile açılır ve
        aranabilir. Ücret ödenmeden Platform üzerinden telefon paylaşımı yapılmaz. Satıcı, alıcının adını ve
        soyadının yalnızca baş harfini görür.
      </p>

      <h2 className="mt-10 font-display text-2xl">6. Teklif seçimi ve ilanın kapanması</h2>
      <p className="mt-3 text-muted-foreground">
        İlan sahibi, teklif verenlerin profillerini, puanlı yorumlarını ve geçmiş işlerini inceleme hakkına
        sahiptir. Bir teklif seçildiğinde ilan yayından kalkar ve yeni tekliflere kapanır. Seçimden sonra alıcı
        satıcıyı puanlayabilir ve yorum yazabilir.
      </p>

      <h2 className="mt-10 font-display text-2xl">7. Yorumlar</h2>
      <p className="mt-3 text-muted-foreground">
        Yalnızca hizmeti veya ürünü alan, seçtiği satıcıyı puanlar. Alıcılar puanlanmaz. Yanıltıcı, teşvikle
        yazılmış, sahte veya üçüncü kişi adına bırakılmış yorumlar tespit edildiğinde silinir; hesap askıya
        alınabilir. Platform, TKHK ve haksız rekabet kuralları çerçevesinde içeriği kaldırma hakkını saklı tutar.
      </p>

      <h2 className="mt-10 font-display text-2xl">8. Yasaklar</h2>
      <p className="mt-3 text-muted-foreground">
        Yasa dışı ürün ve hizmet, sahte ilan, başkasının kimliği, ücret kaçırmak için platform dışı yönlendirme
        (teklif vermeden iletişim dayatması), nefret ve müstehcen içerik yasaktır.
      </p>

      <h2 className="mt-10 font-display text-2xl">9. Sorumluluk ve uyuşmazlık</h2>
      <p className="mt-3 text-muted-foreground">
        Platform kesintisiz hizmet taahhüt etmez. Uyuşmazlıklarda Türkiye Cumhuriyeti hukuku uygulanır;
        yetkili mahkeme ve icra daireleri, tüketici işlemlerinde 6502 sayılı Kanun ve ilgili yönetmeliklere
        tabidir. Tüketici hakem heyetleri ve Tüketici Mahkemesi yolları saklıdır.
      </p>

      <h2 className="mt-10 font-display text-2xl">10. Değişiklik</h2>
      <p className="mt-3 text-muted-foreground">
        Koşullar Platform'da yayımlanarak güncellenebilir. Kullanıma devam, güncel metnin kabulü anlamına gelir.
      </p>

      <h2 className="mt-10 font-display text-2xl">11. Çerezler</h2>
      <p className="mt-3 text-muted-foreground">
        Çerez kullanımı{" "}
        <Link href="/cerez" className="underline underline-offset-4">
          çerez politikasına
        </Link>{" "}
        tabidir.
      </p>
    </article>
  );
}

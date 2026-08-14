export const metadata = { title: "KVKK Aydınlatma Metni" };

export default function Page() {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 text-[15px] leading-7">
      <h1 className="font-display text-4xl">Kişisel Verilerin Korunması Aydınlatma Metni</h1>
      <p className="mt-2 text-sm text-muted-foreground">6698 sayılı KVKK md. 10</p>

      <h2 className="mt-10 font-display text-2xl">1. Veri sorumlusu</h2>
      <p className="mt-3 text-muted-foreground">
        iLazım platformu (“Platform”) kişisel verilerinizi 6698 sayılı Kişisel Verilerin Korunması Kanunu
        (“KVKK”) kapsamında veri sorumlusu sıfatıyla işler. Başvurularınız için:{" "}
        <a className="underline" href="mailto:kvkk@ilazim.com">
          kvkk@ilazim.com
        </a>
      </p>

      <h2 className="mt-10 font-display text-2xl">2. İşlenen veriler</h2>
      <ul className="mt-3 list-disc space-y-1 pl-5 text-muted-foreground">
        <li>Kimlik: ad, soyad, hesap adı</li>
        <li>İletişim: e-posta, telefon (paylaşmayı seçtiğinizde)</li>
        <li>İşlem: ilan, teklif, mesaj, cüzdan ve ödeme kayıtları</li>
        <li>Değerlendirme: puan ve yorum</li>
        <li>Teknik: oturum, IP ve güvenlik logları</li>
      </ul>

      <h2 className="mt-10 font-display text-2xl">3. Amaç ve hukuki sebep</h2>
      <p className="mt-3 text-muted-foreground">
        Veriler; üyelik sözleşmesinin kurulması ve ifası (KVKK md. 5/2-c), aracılık hizmetinin sunulması,
        teklif ücretinin tahsili, güvenliğin sağlanması, yasal yükümlülükler (md. 5/2-ç) ve meşru menfaat
        (md. 5/2-f; dolandırıcılığın önlenmesi, sahte yorumun tespiti) kapsamında işlenir. Telefon numarası,
        ilan sahibinin açık tercihi ve yalnızca teklif ücretini ödemiş satıcıya gösterilmek üzere işlenir.
      </p>

      <h2 className="mt-10 font-display text-2xl">4. Aktarım</h2>
      <p className="mt-3 text-muted-foreground">
        Altyapı için bulut hizmet sağlayıcılarına (barındırma, kimlik doğrulama, ödeme) aktarım yapılabilir.
        Yurt dışı aktarım varsa KVKK md. 9 ve Kurul kararlarına uygun güvenceler aranır. Satıcıya telefon,
        yalnızca ücretli teklif sonrası ve sizin izninizle açılır; herkese açık ilanda numara yayınlanmaz.
        Satıcılar alıcının soyadını tam görmez; ad ve soyadın baş harfi gösterilir.
      </p>

      <h2 className="mt-10 font-display text-2xl">5. Saklama</h2>
      <p className="mt-3 text-muted-foreground">
        Veriler, işleme amacının gerektirdiği ve 6563 sayılı Elektronik Ticaretin Düzenlenmesi, 213 sayılı
        VUK ile ilgili mevzuattaki saklama süreleri kadar tutulur; süre bitiminde silinir, yok edilir veya
        anonim hale getirilir.
      </p>

      <h2 className="mt-10 font-display text-2xl">6. Haklarınız (KVKK md. 11)</h2>
      <p className="mt-3 text-muted-foreground">
        Verilerinizin işlenip işlenmediğini öğrenme, düzeltme, silme, aktarılan üçüncü kişileri bilme, itiraz
        ve zararın giderilmesini talep etme haklarına sahipsiniz. Başvuru, Veri Sorumlusuna Başvuru Usul ve
        Esasları Hakkında Tebliğ’e uygun olarak yazılı veya kayıtlı e-posta ile yapılır. Yanıt en geç 30 gün
        içinde verilir. Şikâyet için Kişisel Verileri Koruma Kurulu’na başvurabilirsiniz.
      </p>
    </article>
  );
}

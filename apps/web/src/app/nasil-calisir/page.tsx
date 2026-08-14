export const metadata = { title: "Nasıl çalışır" };

export default function Page() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20">
      <p className="text-[13px] font-medium tracking-[0.18em] text-muted-foreground uppercase">
        iLazım
      </p>
      <h1 className="mt-3 font-display text-5xl">Nasıl çalışır</h1>
      <ol className="mt-12 space-y-10">
        <li>
          <p className="font-display text-2xl">1. İlan aç</p>
          <p className="mt-2 leading-7 text-muted-foreground">
            Hizmet veya ürün seç, adım adım yaz. En sonda giriş veya kayıt; e-posta doğrulanmadan
            üyelik ve ilan tamamlanmaz. Alıcı için ücretsiz.
          </p>
        </li>
        <li>
          <p className="font-display text-2xl">2. Teklifler gelsin</p>
          <p className="mt-2 leading-7 text-muted-foreground">
            Onaylı satıcılar cüzdanlarından sabit bir ücret ödeyerek teklif verir. Hizmet verenler
            yalnızca profilinde seçtiği alanlardaki talepleri görür; ürün ilanları herkese açıktır.
            Yıldızlarını ve yorumlarını görürsün.
          </p>
        </li>
        <li>
          <p className="font-display text-2xl">3. Seç, bitir, puanla</p>
          <p className="mt-2 leading-7 text-muted-foreground">
            Kazananı sen seçersin. İş bitince yalnızca satıcı puanlanır.
          </p>
        </li>
      </ol>
    </div>
  );
}

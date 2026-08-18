import { IntegrationsForm } from "@/components/integrations-form";
import { getAdminIntegrations } from "@/lib/integrations";

export default async function Page() {
  const saved = await getAdminIntegrations();
  const env = {
    resend: Boolean(process.env.RESEND_API_KEY),
    iyzico: Boolean(process.env.IYZICO_API_KEY && process.env.IYZICO_SECRET_KEY),
    emailFrom: process.env.EMAIL_FROM ?? "",
  };

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl">Ayarlar</h1>
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        E-posta, ödeme ve Google servisleri. Anahtarlar yalnızca sunucuda tutulur; boş gizli alan
        mevcut kaydı silmez. Panel boşsa ortam değişkenleri yedek olarak kullanılır.
      </p>
      {!saved ? (
        <p className="rounded-2xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm">
          Entegrasyon tablosu okunamadı. Veritabanı şeması güncellenmeden bu sayfa kaydedilemez.
        </p>
      ) : (
        <IntegrationsForm saved={saved} env={env} />
      )}
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { updateIntegrationsAction } from "@/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AdminIntegrations } from "@/lib/integration-types";

function SecretField({
  name,
  label,
  saved,
  envFallback,
}: {
  name: string;
  label: string;
  saved: boolean;
  envFallback: boolean;
}) {
  const hint = saved
    ? "Kayıtlı — değiştirmek için yeni anahtar yazın"
    : envFallback
      ? "Veritabanında yok; ortam değişkeni kullanılıyor"
      : "Henüz tanımlı değil";
  return (
    <div>
      <Label>{label}</Label>
      <Input name={name} type="password" autoComplete="off" className="mt-1" placeholder={hint} />
      <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
    </div>
  );
}

export function IntegrationsForm({
  saved,
  env,
}: {
  saved: AdminIntegrations;
  env: {
    resend: boolean;
    shopier: boolean;
    emailFrom: string;
  };
}) {
  const [state, action, pending] = useActionState(updateIntegrationsAction, null);

  return (
    <form action={action} className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>E-posta</CardTitle>
          <CardDescription>
            Resend anahtarı ve gönderen adresi. Tüm mailler (kayıt, şifre, teklif, mesaj) sitedeki iLazım
            şablonuyla gider. Boş anahtar kayıtlı değeri korur; adres boşsa ortam değişkeni kullanılır.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label>Gönderen (EMAIL_FROM)</Label>
            <Input
              name="emailFrom"
              defaultValue={saved.email_from ?? ""}
              placeholder={env.emailFrom || "iLazım <noreply@ilazim.online>"}
              className="mt-1"
            />
          </div>
          <SecretField
            name="resendApiKey"
            label="Resend API anahtarı"
            saved={saved.resend_api_key_set}
            envFallback={env.resend}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ödeme (Shopier)</CardTitle>
          <CardDescription>
            Kartla bakiye yükleme için Shopier PAT + Webhook. Boş bırakılan gizli alanlar mevcut kaydı
            silmez.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <SecretField
            name="shopierPat"
            label="Shopier PAT"
            saved={saved.shopier_pat_set}
            envFallback={env.shopier}
          />
          <div>
            <Label>Shopier shop slug</Label>
            <Input
              name="shopierShopSlug"
              defaultValue={saved.shopier_shop_slug ?? ""}
              placeholder={env.shopier ? "(ortam değişkeninden geliyor)" : "örn: ilazimshop"}
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Shopier panelinde “mağaza/URL” kısmından bulunur.
            </p>
          </div>
          <SecretField
            name="shopierWebhookToken"
            label="Shopier Webhook token"
            saved={saved.shopier_webhook_token_set}
            envFallback={env.shopier}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Google servisleri</CardTitle>
          <CardDescription>
            Search Console doğrulama her zaman meta etikete yazılır. Analytics / GTM / Ads yalnızca
            ziyaretçi çerezlerde “Tümünü kabul et” dedikten sonra yüklenir.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div>
            <Label>Google Tag Manager (GTM-…)</Label>
            <Input
              name="gtmContainerId"
              defaultValue={saved.gtm_container_id ?? ""}
              placeholder="GTM-XXXXXXX"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Google Analytics 4 (G-…)</Label>
            <Input
              name="gaMeasurementId"
              defaultValue={saved.ga_measurement_id ?? ""}
              placeholder="G-XXXXXXXX"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              GTM doluysa Analytics buradan ayrıca yüklenmez; GA’yı GTM içinden yayınlayın.
            </p>
          </div>
          <div>
            <Label>Google Ads (AW-…)</Label>
            <Input
              name="googleAdsId"
              defaultValue={saved.google_ads_id ?? ""}
              placeholder="AW-XXXXXXXX"
              className="mt-1"
            />
          </div>
          <div>
            <Label>Search Console doğrulama</Label>
            <Input
              name="googleSiteVerification"
              defaultValue={saved.google_site_verification ?? ""}
              placeholder="google-site-verification içeriği"
              className="mt-1"
            />
            <p className="mt-1 text-xs text-muted-foreground">
              HTML etiketi yöntemindeki content değeri. Sayfa kaynağına meta olarak eklenir.
            </p>
          </div>
        </CardContent>
      </Card>

      {state && "error" in state && state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
      {state && "ok" in state && <p className="text-sm text-primary">Kaydedildi.</p>}
      <Button type="submit" disabled={pending} className="w-fit">
        Entegrasyonları kaydet
      </Button>
    </form>
  );
}

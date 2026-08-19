import { siteUrl } from "@/lib/utils";

const INK = "#0c0c0c";
const CREAM = "#f3f3ef";
const ACCENT = "#c8f04b";
const MUTED = "#5b5b55";
const CARD = "#ffffff";

export function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

export type SiteEmailInput = {
  preview: string;
  eyebrow?: string;
  heading: string;
  lines: string[];
  extraHtml?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footnote?: string;
};

function absUrl(href: string) {
  if (!href) return siteUrl();
  if (href.startsWith("http://") || href.startsWith("https://") || href.startsWith("{{")) return href;
  return `${siteUrl()}${href.startsWith("/") ? href : `/${href}`}`;
}

export function renderSiteEmail(input: SiteEmailInput) {
  const ctaHref = input.ctaUrl ? absUrl(input.ctaUrl) : "";
  const linesHtml = input.lines
    .filter(Boolean)
    .map(
      (line) =>
        `<p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:${INK}">${escapeHtml(line)}</p>`,
    )
    .join("");
  const button =
    input.ctaLabel && ctaHref
      ? `<p style="margin:28px 0 0">
        <a href="${ctaHref}" style="display:inline-block;background:${INK};color:${ACCENT};text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:700;font-size:14px;letter-spacing:0.01em">
          ${escapeHtml(input.ctaLabel)}
        </a>
      </p>`
      : "";
  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${escapeHtml(input.heading)}</title>
</head>
<body style="margin:0;padding:0;background:${CREAM};">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(input.preview)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" bgcolor="${CREAM}" style="background:${CREAM};margin:0;padding:0">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%">
          <tr>
            <td bgcolor="${INK}" style="background:${INK};padding:20px 24px;border-radius:16px 16px 0 0">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="background:${ACCENT};color:${INK};font-family:Arial,sans-serif;font-size:11px;font-weight:700;width:32px;height:32px;text-align:center;border-radius:8px">tP</td>
                  <td style="padding-left:10px;font-family:Arial,sans-serif;font-size:22px;font-weight:700;color:${CREAM};letter-spacing:-0.03em">Talepik</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td bgcolor="${ACCENT}" style="background:${ACCENT};height:4px;font-size:0;line-height:0">&nbsp;</td>
          </tr>
          <tr>
            <td bgcolor="${CARD}" style="background:${CARD};padding:28px 24px 32px;font-family:Arial,Helvetica,sans-serif;color:${INK}">
              ${
                input.eyebrow
                  ? `<p style="margin:0 0 8px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:${MUTED}">${escapeHtml(input.eyebrow)}</p>`
                  : ""
              }
              <h1 style="margin:0 0 16px;font-size:26px;line-height:1.2;letter-spacing:-0.03em">${escapeHtml(input.heading)}</h1>
              ${linesHtml}
              ${input.extraHtml ?? ""}
              ${button}
              ${
                input.footnote
                  ? `<p style="margin:22px 0 0;font-size:12px;line-height:1.6;color:${MUTED}">${escapeHtml(input.footnote)}</p>`
                  : ""
              }
            </td>
          </tr>
          <tr>
            <td style="padding:18px 8px 0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:${MUTED};text-align:center">
              Ne lazimsa, teklif gelsin.<br />
              <a href="${escapeHtml(siteUrl())}" style="color:${INK};text-decoration:none">${escapeHtml(siteUrl().replace(/^https?:\/\//, ""))}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    "Talepik",
    "",
    input.heading,
    "",
    ...input.lines.filter(Boolean),
    input.ctaLabel && ctaHref ? `\n${input.ctaLabel}: ${ctaHref}` : "",
    input.footnote ?? "",
    "",
    siteUrl(),
  ]
    .filter((part) => part !== "")
    .join("\n");

  return { html, text };
}

export function authEmailCopy(type: string, input: { url: string; token?: string; newEmail?: string }) {
  switch (type) {
    case "recovery":
      return {
        subject: "Sifreni yenile - Talepik",
        preview: "Sifre sifirlama baglantIn hazIr.",
        eyebrow: "Hesap",
        heading: "Sifreni yenile",
        lines: [
          "Bu istegi sen yaptIysan asagIdaki dugmeyle yeni sifre belirle.",
          "Istemezsen bu maili yok say; sifren degismez.",
        ],
        ctaLabel: "Yeni sifre belirle",
        ctaUrl: input.url,
        footnote: input.token ? `Kod: ${input.token}` : undefined,
      };
    case "magiclink":
      return {
        subject: "Giris baglantIn - Talepik",
        preview: "Tek tikla Talepik'e gir.",
        eyebrow: "Hesap",
        heading: "Giris baglantIn hazIr",
        lines: ["Bu baglantI kIsa sure gecerli ve bir kez kullanIlIr."],
        ctaLabel: "Talepik'e gir",
        ctaUrl: input.url,
      };
    case "invite":
      return {
        subject: "Talepik'e davet edildin",
        preview: "HesabInI olusturmak icin davetini ac.",
        eyebrow: "Davet",
        heading: "Seni bekliyoruz",
        lines: ["HesabInI olusturmak icin daveti kabul et."],
        ctaLabel: "Daveti kabul et",
        ctaUrl: input.url,
      };
    case "email_change":
      return {
        subject: "Yeni e-postanI dogrula - Talepik",
        preview: "E-posta degisikligini onayla.",
        eyebrow: "Hesap",
        heading: "Yeni adresini dogrula",
        lines: [
          input.newEmail
            ? `Yeni adres: ${input.newEmail}`
            : "E-posta degisikligini onaylamak icin asagIdaki dugmeyi kullan.",
        ],
        ctaLabel: "Adresi dogrula",
        ctaUrl: input.url,
        footnote: "Bu istegi sen yapmadIysan maili yok say.",
      };
    case "signup":
    case "email":
    default:
      return {
        subject: "E-postanI dogrula - Talepik",
        preview: "HesabInI acmak icin e-postanI dogrula.",
        eyebrow: "Hos geldin",
        heading: "E-postanI dogrula",
        lines: [
          "Talepik'e kayIt oldun. HesabIn acIlsIn diye bu adresi dogrula.",
          "Baglantl bir sure sonra gecersiz olur.",
        ],
        ctaLabel: "E-postamI dogrula",
        ctaUrl: input.url,
        footnote: input.token ? `Kod: ${input.token}` : undefined,
      };
  }
}

export function authActionEmail(type: string, input: { url: string; token?: string; newEmail?: string }) {
  const copy = authEmailCopy(type, input);
  const rendered = renderSiteEmail(copy);
  return { subject: copy.subject, html: rendered.html, text: rendered.text };
}

export function supabaseAuthTemplateHtml(type: string) {
  const copy = authEmailCopy(type, { url: "{{ .ConfirmationURL }}", token: "{{ .Token }}" });
  return renderSiteEmail(copy).html;
}
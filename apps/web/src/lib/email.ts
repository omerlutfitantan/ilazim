import { getEmailConfig } from "@/lib/integrations";
import { siteUrl } from "@/lib/utils";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(input: SendEmailInput) {
  const { apiKey: key, from } = await getEmailConfig();
  if (!key) return { skipped: true as const };
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`E-posta gönderilemedi: ${res.status} ${body}`);
  }
  return { skipped: false as const };
}

export function listingAlertEmail(input: {
  title: string;
  location: string;
  description: string;
  href: string;
  kindLabel: string;
}) {
  const url = `${siteUrl()}${input.href}`;
  const subject = `Yeni ${input.kindLabel}: ${input.title} — ${input.location}`;
  const text = [
    input.title,
    `Konum: ${input.location}`,
    "",
    input.description,
    "",
    `İlanı açmak için: ${url}`,
  ].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#666">iLazım</p>
      <h1 style="font-size:22px;line-height:1.3">${escapeHtml(input.title)}</h1>
      <p style="color:#444"><strong>Konum:</strong> ${escapeHtml(input.location)}</p>
      <p style="white-space:pre-wrap;line-height:1.6">${escapeHtml(input.description)}</p>
      <p style="margin-top:28px">
        <a href="${url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px">
          İlana git ve teklif ver
        </a>
      </p>
    </div>
  `;
  return { subject, html, text };
}

export function offerReceivedEmail(input: {
  listingTitle: string;
  amount: string;
  sellerName: string;
  message: string;
  href: string;
}) {
  return simpleEmail({
    subject: `İlanınıza yeni teklif: ${input.listingTitle}`,
    heading: "Yeni teklifiniz var",
    lines: [
      `${input.sellerName}, “${input.listingTitle}” ilanınıza ${input.amount} teklif verdi.`,
      input.message ? `Teklif notu: ${input.message}` : "",
      "Sohbetten teklifi inceleyip seçebilirsiniz.",
    ].filter(Boolean),
    ctaLabel: "Teklifi ve sohbeti aç",
    href: input.href,
  });
}

export function newMessageEmail(input: {
  listingTitle: string;
  fromLabel: string;
  snippet: string;
  href: string;
}) {
  return simpleEmail({
    subject: `Yeni mesajınız var — ${input.listingTitle}`,
    heading: "Yeni mesajınız var",
    lines: [
      `${input.fromLabel}, “${input.listingTitle}” sohbetinde size yazdı.`,
      input.snippet,
    ],
    ctaLabel: "Mesajı aç",
    href: input.href,
  });
}

function simpleEmail(input: {
  subject: string;
  heading: string;
  lines: string[];
  ctaLabel: string;
  href: string;
}) {
  const url = `${siteUrl()}${input.href}`;
  const text = [...input.lines, "", `${input.ctaLabel}: ${url}`].join("\n");
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#111">
      <p style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#666">iLazım</p>
      <h1 style="font-size:22px;line-height:1.3">${escapeHtml(input.heading)}</h1>
      ${input.lines
        .map((line) => `<p style="white-space:pre-wrap;line-height:1.6;color:#333">${escapeHtml(line)}</p>`)
        .join("")}
      <p style="margin-top:28px">
        <a href="${url}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 18px;border-radius:12px">
          ${escapeHtml(input.ctaLabel)}
        </a>
      </p>
    </div>
  `;
  return { subject: input.subject, html, text };
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

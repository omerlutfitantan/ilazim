import { getEmailConfig } from "@/lib/integrations";
import { authActionEmail as buildAuthEmail, escapeHtml, renderSiteEmail } from "@/lib/email-template";

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
  const subject = `Yeni ${input.kindLabel}: ${input.title} — ${input.location}`;
  const { html, text } = renderSiteEmail({
    preview: subject,
    eyebrow: `Yeni ${input.kindLabel}`,
    heading: input.title,
    lines: [`Konum: ${input.location}`],
    extraHtml: `<p style="margin:0 0 12px;font-size:15px;line-height:1.65;color:#0c0c0c;white-space:pre-wrap">${escapeHtml(input.description)}</p>`,
    ctaLabel: "İlana git ve teklif ver",
    ctaUrl: input.href,
  });
  return { subject, html, text };
}

export function offerReceivedEmail(input: {
  listingTitle: string;
  amount: string;
  sellerName: string;
  message: string;
  href: string;
}) {
  const subject = `İlanınıza yeni teklif: ${input.listingTitle}`;
  const { html, text } = renderSiteEmail({
    preview: subject,
    eyebrow: "Teklif",
    heading: "Yeni teklifin var",
    lines: [
      `${input.sellerName}, “${input.listingTitle}” ilanına ${input.amount} teklif verdi.`,
      input.message ? `Teklif notu: ${input.message}` : "",
      "Sohbetten inceleyip seçebilirsin.",
    ],
    ctaLabel: "Teklifi ve sohbeti aç",
    ctaUrl: input.href,
  });
  return { subject, html, text };
}

export function newMessageEmail(input: {
  listingTitle: string;
  fromLabel: string;
  snippet: string;
  href: string;
}) {
  const subject = `Yeni mesajın var — ${input.listingTitle}`;
  const { html, text } = renderSiteEmail({
    preview: subject,
    eyebrow: "Mesaj",
    heading: "Yeni mesajın var",
    lines: [
      `${input.fromLabel}, “${input.listingTitle}” sohbetinde yazdı.`,
      input.snippet,
    ],
    ctaLabel: "Mesajı aç",
    ctaUrl: input.href,
  });
  return { subject, html, text };
}

export function authActionEmail(type: string, input: { url: string; token?: string; newEmail?: string }) {
  return buildAuthEmail(type, input);
}

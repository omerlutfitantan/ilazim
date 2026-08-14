import { siteUrl } from "@/lib/utils";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendEmail(input: SendEmailInput) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { skipped: true as const };
  const from = process.env.EMAIL_FROM ?? "iLazım <noreply@ilazim.com>";
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

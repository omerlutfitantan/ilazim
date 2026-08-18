import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { authActionEmail, sendEmail } from "@/lib/email";

type HookBody = {
  user?: { email?: string; new_email?: string };
  email_data?: {
    token?: string;
    token_hash?: string;
    redirect_to?: string;
    email_action_type?: string;
    token_new?: string;
    token_hash_new?: string;
    old_email?: string;
  };
};

function hookSecret() {
  return process.env.AUTH_HOOK_SECRET ?? process.env.SEND_EMAIL_HOOK_SECRET ?? "";
}

function verifyStandardWebhook(payload: string, request: NextRequest, secret: string) {
  const raw = secret.replace(/^v1,/, "").replace(/^whsec_/, "");
  const key = Buffer.from(raw, "base64");
  const id = request.headers.get("webhook-id") ?? "";
  const timestamp = request.headers.get("webhook-timestamp") ?? "";
  const header = request.headers.get("webhook-signature") ?? "";
  if (!id || !timestamp || !header) return false;
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${payload}`).digest("base64");
  return header.split(" ").some((part) => {
    const value = part.trim().replace(/^v1,/, "");
    const a = Buffer.from(value);
    const b = Buffer.from(expected);
    return a.length === b.length && timingSafeEqual(a, b);
  });
}

function confirmationUrl(email: HookBody["email_data"]) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base || !email?.token_hash || !email.email_action_type) return "";
  const params = new URLSearchParams({
    token: email.token_hash,
    type: email.email_action_type,
    redirect_to: email.redirect_to || `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/`,
  });
  return `${base}/auth/v1/verify?${params.toString()}`;
}

export async function POST(request: NextRequest) {
  const secret = hookSecret();
  if (!secret) {
    return NextResponse.json({ error: "hook secret yok" }, { status: 503 });
  }
  const payload = await request.text();
  if (!verifyStandardWebhook(payload, request, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let body: HookBody;
  try {
    body = JSON.parse(payload) as HookBody;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const to = body.user?.email;
  const type = body.email_data?.email_action_type || "signup";
  const url = confirmationUrl(body.email_data);
  if (!to || !url) {
    return NextResponse.json({ error: "eksik alan" }, { status: 400 });
  }

  const mail = authActionEmail(type, {
    url,
    token: body.email_data?.token,
    newEmail: body.user?.new_email,
  });
  const result = await sendEmail({ to, ...mail });
  if (result.skipped) {
    return NextResponse.json({ error: "e-posta sağlayıcısı yok" }, { status: 503 });
  }
  return NextResponse.json({});
}

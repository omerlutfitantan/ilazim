import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import type { EmailOtpType } from "@supabase/supabase-js";

function safePath(raw: string | null, fallback: string) {
  if (!raw) return fallback;
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const intent = searchParams.get("intent");
  const next = safePath(searchParams.get("next"), "/hesabim");
  const isRecovery = type === "recovery" || intent === "recovery" || next.startsWith("/sifre-yenile");

  const pending: Array<{ name: string; value: string; options?: Record<string, unknown> }> = [];
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            pending.push({ name, value, options: options as Record<string, unknown> | undefined }),
          );
        },
      },
    },
  );

  let error: { message?: string } | null = null;
  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } else if (tokenHash && type) {
    const result = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    error = result.error;
  } else {
    return NextResponse.redirect(`${origin}/giris`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let destination = `${origin}${next}`;
  if (error || (user && !user.email_confirmed_at && !isRecovery)) {
    const qs = user?.email ? `?email=${encodeURIComponent(user.email)}` : "";
    destination = `${origin}/dogrula${qs}`;
  } else if (isRecovery) {
    destination = `${origin}/sifre-yenile`;
  } else {
    await supabase.auth.signOut();
    const verified = new URL(`${origin}/dogrula`);
    verified.searchParams.set("verified", "1");
    if (next && next !== "/hesabim" && next !== "/dogrula") {
      verified.searchParams.set("next", next);
    }
    destination = verified.toString();
  }

  const response = NextResponse.redirect(destination);
  pending.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
  return response;
}

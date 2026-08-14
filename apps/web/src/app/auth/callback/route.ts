import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next") ?? "/hesabim";
  const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/hesabim";
  if (!code) return NextResponse.redirect(`${origin}/giris`);

  const response = NextResponse.redirect(`${origin}${next}`);
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
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || (data.user && !data.user.email_confirmed_at && next !== "/sifre-yenile")) {
    return NextResponse.redirect(
      `${origin}/dogrula${data.user?.email ? `?email=${encodeURIComponent(data.user.email)}` : ""}`,
    );
  }
  return response;
}

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

function isVerified(user: { email_confirmed_at?: string | null } | null) {
  return Boolean(user?.email_confirmed_at);
}

function isProtectedPath(path: string) {
  return (
    path.startsWith("/hesabim") ||
    path.startsWith("/satici") ||
    path.startsWith("/admin") ||
    path.startsWith("/mesajlar") ||
    path === "/ilan-ac/yayinla"
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("YOUR_PROJECT")) {
    return response;
  }

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const path = request.nextUrl.pathname;
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const otpType = request.nextUrl.searchParams.get("type");
  const authCode = request.nextUrl.searchParams.get("code");
  if (path !== "/auth/callback" && ((tokenHash && otpType) || authCode)) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/auth/callback";
    return NextResponse.redirect(redirect);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const verified = isVerified(user);
  const isProtected = isProtectedPath(path);

  if (user && !verified && isProtected) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/dogrula";
    if (user.email) redirect.searchParams.set("email", user.email);
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  if (!user && isProtected) {
    const redirect = request.nextUrl.clone();
    redirect.pathname = "/giris";
    redirect.searchParams.set("next", path);
    return NextResponse.redirect(redirect);
  }

  if (verified && (path === "/giris" || path === "/kayit")) {
    const next = request.nextUrl.searchParams.get("next");
    const redirect = request.nextUrl.clone();
    redirect.pathname = next?.startsWith("/") && !next.startsWith("//") ? next : "/hesabim";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  if (verified && path.startsWith("/dogrula") && request.nextUrl.searchParams.get("verified") !== "1") {
    const next = request.nextUrl.searchParams.get("next");
    const redirect = request.nextUrl.clone();
    redirect.pathname = next?.startsWith("/") && !next.startsWith("//") ? next : "/hesabim";
    redirect.search = "";
    return NextResponse.redirect(redirect);
  }

  if (verified && path.startsWith("/admin")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user!.id)
      .single();
    if (profile?.role !== "admin") {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/hesabim";
      return NextResponse.redirect(redirect);
    }
  }

  if (verified && path.startsWith("/satici") && !path.startsWith("/satici/onboarding")) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role, seller_status")
      .eq("id", user!.id)
      .single();
    if (profile?.role === "buyer") {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/satici/onboarding";
      return NextResponse.redirect(redirect);
    }
  }

  return response;
}

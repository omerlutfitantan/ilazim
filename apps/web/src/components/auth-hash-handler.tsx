"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function AuthHashHandler() {
  const router = useRouter();

  useEffect(() => {
    const hash = window.location.hash?.replace(/^#/, "");
    if (!hash) return;
    const params = new URLSearchParams(hash);
    const accessToken = params.get("access_token");
    const refreshToken = params.get("refresh_token");
    const type = params.get("type");
    if (!accessToken || !refreshToken) return;

    const supabase = createClient();
    void (async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
      if (error) {
        router.replace("/dogrula");
        return;
      }
      if (type === "recovery") {
        router.replace("/sifre-yenile");
        return;
      }
      if (type === "signup" || type === "email" || type === "invite" || type === "email_change") {
        await supabase.auth.signOut();
        router.replace("/dogrula?verified=1");
        return;
      }
      router.replace("/hesabim");
    })();
  }, [router]);

  return null;
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const url = window.location.href;

      // ✅ Google OAuth (PKCE) rientra con ?code=...
      if (url.includes("?code=")) {
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) {
          router.replace(`/login?err=${encodeURIComponent(error.message)}`);
          return;
        }
      }

      // pulisci URL e vai alla home
      window.history.replaceState(null, "", "/");
      router.replace("/");
    })();
  }, [router]);

  return <p style={{ padding: 16 }}>Accesso in corso…</p>;
}


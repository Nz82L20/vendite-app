"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const url = window.location.href;

      // PKCE: rientri con ?code=...
      if (url.includes("?code=")) {
        const { error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) {
          router.replace(`/login?err=${encodeURIComponent(error.message)}`);
          return;
        }
      }

      // pulizia URL e redirect
      window.history.replaceState(null, "", "/");
      router.replace("/");
    })();
  }, [router]);

  return <p style={{ padding: 16 }}>Accesso in corso…</p>;
}

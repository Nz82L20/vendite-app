"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");

      // Google OAuth (PKCE) -> arriva con ?code=...
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          router.replace(`/login?err=${encodeURIComponent(error.message)}`);
          return;
        }
      } else {
        // Magic link (o altri) -> assicura persistenza
        await supabase.auth.getSession();
      }

      // Pulisci e vai alla home
      window.history.replaceState(null, "", "/");
      router.replace("/");
    })();
  }, [router]);

  return <p style={{ padding: 16 }}>Accesso in corso…</p>;
}

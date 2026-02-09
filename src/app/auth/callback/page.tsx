"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // pulisci hash dall'URL
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      // forza lettura sessione
      await supabase.auth.getSession();
      router.replace("/");
    })();
  }, [router]);

  return <p style={{ padding: 16 }}>Accesso in corso…</p>;
}

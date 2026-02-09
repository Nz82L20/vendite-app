"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // Lascia a supabase il tempo di salvare la sessione, poi pulisci URL
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }
      // Verifica sessione (opzionale, ma utile)
      await supabase.auth.getSession();
      router.replace("/");
    })();
  }, [router]);

  return <p style={{ padding: 16 }}>Accesso in corso…</p>;
}

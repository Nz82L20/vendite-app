"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // ✅ Pulisce hash/query in URL dopo callback
      if (window.location.hash) {
        window.history.replaceState(null, "", window.location.pathname);
      }

      // ✅ forza lettura sessione dal browser
      const { data } = await supabase.auth.getSession();

      // se sessione ok -> home, altrimenti login
      if (data.session) router.replace("/");
      else router.replace("/login");
    })();
  }, [router]);

  return <p style={{ padding: 16 }}>Accesso in corso…</p>;
}

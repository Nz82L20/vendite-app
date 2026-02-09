"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    (async () => {
      // Supabase gestisce il token dalla URL
      await supabase.auth.getSession();
      router.replace("/");
    })();
  }, [router]);

  return <p style={{ padding: 16 }}>Accesso in corso...</p>;
}

"use client";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function BlockedPage() {
  const router = useRouter();

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <div style={{ maxWidth: 520, margin: "40px auto", padding: 16 }}>
      <h1>Accesso non abilitato</h1>
      <p>La tua email non è ancora attiva. Contatta l’amministratore.</p>
      <button onClick={logout}>Esci</button>
    </div>
  );
}

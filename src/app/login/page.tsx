"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendLink() {
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Accesso</h1>
      <p>Inserisci email e ricevi il link di accesso.</p>

      <input
        style={{ width: "100%", padding: 12, fontSize: 16 }}
        placeholder="email@esempio.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button
        style={{ width: "100%", padding: 12, marginTop: 12, fontSize: 16 }}
        onClick={sendLink}
        disabled={!email}
      >
        Invia magic link
      </button>

      {sent && <p style={{ marginTop: 12 }}>Link inviato! Controlla la posta.</p>}
      {error && <p style={{ marginTop: 12, color: "red" }}>{error}</p>}
    </div>
  );
}

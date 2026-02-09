"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // ✅ Dominio "stabile" per far funzionare il link anche con PC spento (production)
  // In locale userai comunque localhost automaticamente.
  const redirectBase = useMemo(() => {
    if (typeof window === "undefined") return "https://vendite-app.vercel.app";
    const host = window.location.host;
    const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");
    return isLocal ? window.location.origin : "https://vendite-app.vercel.app";
  }, []);

  async function sendLink() {
    setError(null);
    setSent(false);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    try {
      setLoadingEmail(true);

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          // 🔥 manda SEMPRE al sito pubblico in produzione
          emailRedirectTo: `${redirectBase}/auth/callback`,
        },
      });

      if (error) setError(error.message);
      else setSent(true);
    } finally {
      setLoadingEmail(false);
    }
  }

  async function loginGoogle() {
    setError(null);
    setSent(false);

    try {
      setLoadingGoogle(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // dopo Google torna qui
          redirectTo: `${redirectBase}/auth/callback`,
        },
      });

      if (error) setError(error.message);
    } finally {
      setLoadingGoogle(false);
    }
  }

  const canSubmit = email.trim().includes("@") && !loadingEmail && !loadingGoogle;

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Accesso</h1>
      <p>Accedi con Google oppure ricevi un magic link via email.</p>

      {/* ✅ Google */}
      <button
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          marginTop: 12,
          cursor: loadingGoogle ? "not-allowed" : "pointer",
        }}
        onClick={loginGoogle}
        disabled={loadingGoogle || loadingEmail}
      >
        {loadingGoogle ? "Apro Google…" : "Accedi con Google"}
      </button>

      <hr style={{ margin: "16px 0", opacity: 0.3 }} />

      {/* ✅ Magic link */}
      <input
        style={{ width: "100%", padding: 12, fontSize: 16 }}
        placeholder="email@esempio.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoComplete="email"
      />

      <button
        style={{
          width: "100%",
          padding: 12,
          marginTop: 12,
          fontSize: 16,
          cursor: canSubmit ? "pointer" : "not-allowed",
        }}
        onClick={sendLink}
        disabled={!canSubmit}
      >
        {loadingEmail ? "Invio in corso…" : "Invia magic link"}
      </button>

      {sent && (
        <p style={{ marginTop: 12 }}>
          Link inviato! Controlla la posta (anche spam) e aprilo dal telefono o PC.
        </p>
      )}

      {error && <p style={{ marginTop: 12, color: "red" }}>{error}</p>}
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  // ✅ In produzione deve puntare al dominio pubblico stabile (funziona anche con PC spento)
  // In locale usa localhost.
  const redirectBase = useMemo(() => {
    if (typeof window === "undefined") return "https://vendite-app.vercel.app";
    const host = window.location.host;
    const isLocal = host.includes("localhost") || host.startsWith("127.0.0.1");
    return isLocal ? window.location.origin : "https://vendite-app.vercel.app";
  }, []);

  async function sendMagicLink() {
    setError(null);
    setSent(false);

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;

    try {
      setLoadingEmail(true);

      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          // 🔥 redirect su Vercel (mobile + pc spento ok)
          emailRedirectTo: `${redirectBase}/auth/callback`,
        },
      });

      if (error) {
        setError(error.message);
        return;
      }

      setSent(true);
    } finally {
      setLoadingEmail(false);
    }
  }

  async function signInWithGoogle() {
    setError(null);
    setSent(false);

    try {
      setLoadingGoogle(true);

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          // Torna sempre al callback (prod o local)
          redirectTo: `${redirectBase}/auth/callback`,
        },
      });

      if (error) setError(error.message);
      // Se non c'è errore, il browser viene reindirizzato a Google automaticamente
    } finally {
      setLoadingGoogle(false);
    }
  }

  const emailOk = email.trim().includes("@");
  const disabledAll = loadingEmail || loadingGoogle;

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Accesso</h1>
      <p>Accedi con Google oppure ricevi un link via email.</p>

      {/* ✅ Google */}
      <button
        style={{
          width: "100%",
          padding: 12,
          fontSize: 16,
          marginTop: 12,
          cursor: disabledAll ? "not-allowed" : "pointer",
        }}
        onClick={signInWithGoogle}
        disabled={disabledAll}
      >
        {loadingGoogle ? "Apro Google…" : "Accedi con Google"}
      </button>

      <div style={{ margin: "16px 0", opacity: 0.4, textAlign: "center" }}>
        — oppure —
      </div>

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
          cursor: !emailOk || disabledAll ? "not-allowed" : "pointer",
        }}
        onClick={sendMagicLink}
        disabled={!emailOk || disabledAll}
      >
        {loadingEmail ? "Invio in corso…" : "Invia magic link"}
      </button>

      {sent && (
        <p style={{ marginTop: 12 }}>
          Link inviato! Controlla la posta (anche spam) e aprilo dal telefono o PC.
        </p>
      )}

      {error && <p style={{ marginTop: 12, color: "red" }}>{error}</p>}

      <p style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
        Redirect: <code>{redirectBase}/auth/callback</code>
      </p>
    </div>
  );
}

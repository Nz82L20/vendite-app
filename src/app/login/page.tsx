"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

function usernameToEmail(username: string) {
  const u = username.trim().toLowerCase();
  const safe = u.replace(/[^a-z0-9._-]/g, ""); // pulizia minima
  return `${safe}@vendite.local`;
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setError(null);

    const u = username.trim();
    if (u.length < 3) return setError("Username non valido.");
    if (password.length < 6) return setError("Password non valida.");

    const email = usernameToEmail(u);

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // niente signup: se non esiste o password errata -> messaggio secco
        setError("Credenziali non valide.");
        return;
      }

      router.replace("/");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Accesso</h1>
      <p>Inserisci username e password.</p>

      <input
        style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 12 }}
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoComplete="username"
      />

      <input
        style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 12 }}
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        autoComplete="current-password"
      />

      <button
        style={{ width: "100%", padding: 12, marginTop: 12, fontSize: 16 }}
        onClick={signIn}
        disabled={loading}
      >
        {loading ? "Accesso..." : "Entra"}
      </button>

      {error && <p style={{ marginTop: 12, color: "red" }}>{error}</p>}
    </div>
  );
}

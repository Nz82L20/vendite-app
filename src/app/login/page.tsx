"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

function usernameToEmail(username: string): string {
  const u = username.trim().toLowerCase();
  return `${u}@vendite.local`;
}

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);

    const email = usernameToEmail(username);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.replace("/");
  }

  return (
    <div style={{ maxWidth: 420, margin: "40px auto", padding: 16 }}>
      <h1>Accesso</h1>
      <p>Inserisci username e password.</p>

      <input
        style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 10 }}
        placeholder="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        autoCapitalize="none"
        autoCorrect="off"
      />

      <input
        style={{ width: "100%", padding: 12, fontSize: 16, marginTop: 10 }}
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button
        style={{ width: "100%", padding: 12, marginTop: 12, fontSize: 16 }}
        onClick={handleLogin}
        disabled={loading || !username || !password}
      >
        {loading ? "Accesso..." : "Entra"}
      </button>

      {error && <p style={{ marginTop: 12, color: "red" }}>{error}</p>}
    </div>
  );
}

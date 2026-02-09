"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { requireActiveProfile } from "@/lib/auth";

type Profile = {
  id: string;
  email: string | null;
  role: "admin" | "user";
  active: boolean;
  created_at: string;
};

export default function AdminPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    const check = await requireActiveProfile();
    if (!check.ok) return router.replace("/login");
    if (check.role !== "admin") return router.replace("/");

    const { data, error } = await supabase
      .from("profiles")
      .select("id,email,role,active,created_at")
      .order("created_at", { ascending: false });

    if (error) setErr(error.message);
    else setProfiles((data ?? []) as Profile[]);
  }

  async function invite() {
    setErr(null);
    const email = inviteEmail.trim().toLowerCase();
    if (!email.includes("@")) {
      setErr("Email non valida.");
      return;
    }

    // 1) Crea un profilo “autorizzato” anche se l’utente non si è ancora registrato.
    // Per farlo in modo pulito, usiamo una strategia semplice:
    // - L’utente si registra col magic link -> trigger crea profilo con active=false
    // - Qui l’admin deve solo attivarlo quando appare
    //
    // Quindi: per invito “vero”, basta mandare il magic link manualmente dalla pagina login.
    // Ma qui possiamo “pre-autorizzare” salvando email in un record speciale?
    //
    // Supabase non permette creare auth.users da client con anon key.
    // Soluzione robusta: invito utenti tramite Admin API (service role) da endpoint server.
    //
    // Per ora qui facciamo la cosa corretta: chiamiamo un endpoint server /api/admin/invite

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setErr(j.error ?? "Errore invito.");
      return;
    }

    setInviteEmail("");
    await load();
  }

  async function setActive(id: string, active: boolean) {
    setErr(null);
    const { error } = await supabase.from("profiles").update({ active }).eq("id", id);
    if (error) setErr(error.message);
    else await load();
  }

  async function setRole(id: string, role: "admin" | "user") {
    setErr(null);
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) setErr(error.message);
    else await load();
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: 16 }}>
      <h1>Admin</h1>
      <button onClick={() => router.push("/")}>← Home</button>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
        <h2>Invita utente</h2>
        <p style={{ opacity: 0.7 }}>
          Inserisci l’email: l’utente riceverà un magic link e verrà creato/attivato automaticamente.
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{ flex: 1, padding: 12, fontSize: 16 }}
            placeholder="email@esempio.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
          />
          <button onClick={invite} disabled={!inviteEmail}>Invita</button>
        </div>
        {err && <p style={{ color: "red" }}>{err}</p>}
      </div>

      <h2 style={{ marginTop: 16 }}>Utenti</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {profiles.map((p) => (
          <div key={p.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontWeight: 700 }}>{p.email ?? "(senza email)"}</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              Ruolo: {p.role} — Attivo: {String(p.active)}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
              <button onClick={() => setActive(p.id, !p.active)}>
                {p.active ? "Disattiva" : "Attiva"}
              </button>
              <button onClick={() => setRole(p.id, p.role === "admin" ? "user" : "admin")}>
                Rendi {p.role === "admin" ? "User" : "Admin"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

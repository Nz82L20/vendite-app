"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { requireActiveProfile } from "@/lib/auth";
import { useRouter } from "next/navigation";

type RecentSale = {
  id: string;
  amount: number;
  created_at: string;
  created_by_email: string | null;
};

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [email, setEmail] = useState<string>("");
  const [todayTotal, setTodayTotal] = useState<number>(0);
  const [monthTotal, setMonthTotal] = useState<number>(0);
  const [recent, setRecent] = useState<RecentSale[]>([]);
  const [amount, setAmount] = useState<string>("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canGoAdmin = useMemo(() => role === "admin", [role]);

  async function loadDashboard() {
    setErr(null);

    const check = await requireActiveProfile();

    if (!check.ok) {
      if (check.reason === "not_logged") router.replace("/login");
      else if (check.reason === "inactive") router.replace("/blocked");
      else if (check.reason === "no_profile") router.replace("/login");
      return;
    }

    setRole(check.role);
    setEmail(check.email ?? "");

    const { data, error } = await supabase.rpc("dashboard_summary", {
      limit_count: 20,
    });

    if (error) {
      setErr(error.message);
      return;
    }

    setTodayTotal(Number(data?.today_total ?? 0));
    setMonthTotal(Number(data?.month_total ?? 0));
    setRecent((data?.recent_sales ?? []) as RecentSale[]);
  }

  async function addSale() {
    setErr(null);

    const { data: sessionData } = await supabase.auth.getSession();
    const session = sessionData.session;

    if (!session) {
      router.replace("/login");
      return;
    }

    const value = Number(amount.replace(",", "."));
    if (!Number.isFinite(value) || value <= 0) {
      setErr("Importo non valido.");
      return;
    }

    const { error } = await supabase.from("sales").insert({
      amount: value,
      created_by: session.user.id,
    });

    if (error) {
      setErr(error.message);
      return;
    }

    setAmount("");
    await loadDashboard();
  }

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      await loadDashboard();
      setLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p style={{ padding: 16 }}>Caricamento…</p>;

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16 }}>
      <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Connesso:</div>
          <div style={{ fontSize: 14 }}>{email}</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {canGoAdmin && <button onClick={() => router.push("/admin")}>Admin</button>}
          <button onClick={() => router.push("/export")}>Export</button>
          <button onClick={logout}>Esci</button>
        </div>
      </div>

      <h1 style={{ marginTop: 16 }}>Vendite</h1>

      <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
        <div style={{ flex: 1, padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Totale Oggi</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{todayTotal.toFixed(2)} €</div>
        </div>
        <div style={{ flex: 1, padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Totale Mese</div>
          <div style={{ fontSize: 26, fontWeight: 700 }}>{monthTotal.toFixed(2)} €</div>
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
        <div style={{ fontSize: 14, opacity: 0.7 }}>Inserisci vendita</div>
        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            style={{ flex: 1, padding: 12, fontSize: 18 }}
            placeholder="Importo (es. 12.50)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
          />
          <button style={{ padding: "12px 16px", fontSize: 16 }} onClick={addSale}>
            Salva
          </button>
        </div>
        {err && <p style={{ color: "red", marginTop: 8 }}>{err}</p>}
      </div>

      <h2 style={{ marginTop: 16 }}>Ultime vendite</h2>
      <div style={{ display: "grid", gap: 8 }}>
        {recent.map((s) => (
          <div key={s.id} style={{ padding: 12, border: "1px solid #eee", borderRadius: 12 }}>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{Number(s.amount).toFixed(2)} €</div>
            <div style={{ fontSize: 13, opacity: 0.7 }}>
              {new Date(s.created_at).toLocaleString("it-IT")} — {s.created_by_email ?? "—"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

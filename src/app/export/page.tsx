"use client";

import { useRouter } from "next/navigation";

export default function ExportPage() {
  const router = useRouter();

  return (
    <div style={{ maxWidth: 520, margin: "0 auto", padding: 16 }}>
      <h1>Export Excel</h1>
      <button onClick={() => router.push("/")}>← Home</button>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        <a href="/api/export?range=today" style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
          Scarica Excel Oggi
        </a>
        <a href="/api/export?range=month" style={{ padding: 12, border: "1px solid #ddd", borderRadius: 12 }}>
          Scarica Excel Mese
        </a>
      </div>
    </div>
  );
}

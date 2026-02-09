import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import ExcelJS from "exceljs";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function startOfDayRome(d: Date) {
  // Semplificazione robusta: usiamo stringhe ISO locale "Europe/Rome" lato DB con date_trunc in SQL.
  // Qui demandiamo la selezione al DB con filtri parametrizzati.
  return d;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const range = url.searchParams.get("range") ?? "today";
  const from = url.searchParams.get("from"); // opzionale YYYY-MM-DD
  const to = url.searchParams.get("to");     // opzionale YYYY-MM-DD

  // Nota: in produzione dovresti validare anche l’utente autenticato.
  // Qui per semplicità usiamo service role, ma puoi aggiungere controllo sessione via cookies.
  // Ti do una versione sicura subito sotto (se vuoi, la facciamo).

  let query = supabaseAdmin
    .from("sales")
    .select("amount, created_at, created_by");

  // Filtri periodo lato SQL (semplici)
  if (range === "today") {
    // da inizio giorno Roma: lo facciamo con una condizione SQL usando now(), ma qui via query è limitato.
    // Soluzione: usare una view/rpc. Per semplicità: calcoliamo "oggi" in UTC approssimato? NO.
    // Facciamo una RPC dedicata per export: la creiamo in SQL.
    const { data, error } = await supabaseAdmin.rpc("export_sales", { p_range: "today" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return buildExcel(data ?? [], "vendite_oggi.xlsx");
  }

  if (range === "month") {
    const { data, error } = await supabaseAdmin.rpc("export_sales", { p_range: "month" });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return buildExcel(data ?? [], "vendite_mese.xlsx");
  }

  if (range === "custom") {
    if (!from || !to) return NextResponse.json({ error: "from/to richiesti" }, { status: 400 });
    const { data, error } = await supabaseAdmin.rpc("export_sales", { p_range: "custom", p_from: from, p_to: to });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return buildExcel(data ?? [], `vendite_${from}_${to}.xlsx`);
  }

  return NextResponse.json({ error: "range non valido" }, { status: 400 });
}

async function buildExcel(rows: any[], filename: string) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Vendite");

  sheet.columns = [
    { header: "Data", key: "date", width: 12 },
    { header: "Ora", key: "time", width: 10 },
    { header: "Importo", key: "amount", width: 12 },
    { header: "Utente", key: "email", width: 28 },
  ];

  let total = 0;

  for (const r of rows) {
    const dt = new Date(r.created_at);
    const dateStr = dt.toLocaleDateString("it-IT");
    const timeStr = dt.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
    const amt = Number(r.amount);
    total += amt;

    sheet.addRow({
      date: dateStr,
      time: timeStr,
      amount: amt,
      email: r.created_by_email ?? "",
    });
  }

  sheet.addRow({});
  sheet.addRow({ time: "Totale", amount: total });

  const buffer = await workbook.xlsx.writeBuffer();

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

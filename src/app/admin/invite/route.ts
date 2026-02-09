import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Email non valida." }, { status: 400 });
    }

    // 1) Crea/Invita utente su Supabase Auth e manda magic link
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback`,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // 2) Attiva profilo (quando l’utente clicca il link, trigger creerà profilo anche.
    // Qui proviamo a fare upsert sul profilo se esiste già.
    if (data.user?.id) {
      await supabaseAdmin.from("profiles").upsert({
        id: data.user.id,
        email,
        role: "user",
        active: true,
      });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Errore server." }, { status: 500 });
  }
}

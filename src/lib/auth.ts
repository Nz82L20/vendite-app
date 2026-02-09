import { supabase } from "@/lib/supabaseClient";

export async function requireActiveProfile() {
  const { data: sessionData } = await supabase.auth.getSession();
  const session = sessionData.session;

  if (!session) return { ok: false as const, reason: "not_logged" };

  const { data, error } = await supabase
    .from("profiles")
    .select("role, active, email")
    .eq("id", session.user.id)
    .single();

  // se manca profilo -> non buttare su /blocked, ma su /login o una pagina setup
  if (error || !data) return { ok: false as const, reason: "no_profile" };

  if (!data.active) return { ok: false as const, reason: "inactive" };

  return {
    ok: true as const,
    role: data.role as "admin" | "user",
    email: data.email ?? session.user.email ?? "",
  };
}

import { supabase } from "@/lib/supabaseClient";

export async function requireActiveProfile() {
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    return { ok: false as const, reason: "not_logged" };
  }

  const user = sessionData.session.user;

  const { data, error } = await supabase
    .from("profiles")
    .select("role, active, email")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    return { ok: false as const, reason: "no_profile" };
  }

  if (!data.active) {
    return { ok: false as const, reason: "inactive" };
  }

  return {
    ok: true as const,
    role: data.role as "admin" | "user",
    email: data.email,
  };
}

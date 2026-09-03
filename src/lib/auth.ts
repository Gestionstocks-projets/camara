import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";

/**
 * Lit la session courante puis le profil (rôle, nom) correspondant.
 * `cache()` évite de refaire la requête plusieurs fois pour un même rendu.
 */
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
});

/** À utiliser dans les Server Components de `(app)` : redirige vers /login
 * si aucune session (filet de sécurité, le middleware le fait déjà). */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login");
  return profile;
}

/** À utiliser sur les pages réservées au propriétaire (Fournisseurs,
 * Gérants, Paramètres). */
export async function requireOwner(): Promise<Profile> {
  const profile = await requireProfile();
  if (profile.role !== "owner") redirect("/dashboard");
  return profile;
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { clientSchema, quickClientSchema } from "./schema";
import type { Client } from "@/types";

export interface ClientFormState {
  error?: string;
}

function readInput(formData: FormData) {
  return clientSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    email: formData.get("email") || undefined,
    city: formData.get("city") || undefined,
  });
}

export async function createClientRecord(
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  await requireProfile();
  const parsed = readInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").insert(parsed.data);
  if (error) {
    return { error: "Impossible de créer le client." };
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export async function updateClientRecord(
  id: string,
  _prevState: ClientFormState,
  formData: FormData,
): Promise<ClientFormState> {
  await requireProfile();
  const parsed = readInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").update(parsed.data).eq("id", id);
  if (error) {
    return { error: "Impossible de modifier le client." };
  }

  revalidatePath("/clients");
  revalidatePath(`/clients/${id}`);
  redirect(`/clients/${id}`);
}

export interface DeleteState {
  error?: string;
}

export async function deleteClientRecord(id: string): Promise<DeleteState> {
  await requireProfile();
  const supabase = await createSupabaseClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return {
        error: "Impossible de supprimer un client ayant des achats enregistrés.",
      };
    }
    return { error: "Impossible de supprimer ce client." };
  }

  revalidatePath("/clients");
  redirect("/clients");
}

export interface QuickCreateState {
  error?: string;
  client?: Pick<Client, "id" | "first_name" | "last_name">;
}

/** Création rapide depuis le flux de vente (prompt 08) — ne redirige pas. */
export async function createClientQuick(
  _prevState: QuickCreateState,
  formData: FormData,
): Promise<QuickCreateState> {
  await requireProfile();
  const parsed = quickClientSchema.safeParse({
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    phone: formData.get("phone") || undefined,
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("clients")
    .insert(parsed.data)
    .select("id, first_name, last_name")
    .single();

  if (error || !data) {
    return { error: "Impossible de créer le client." };
  }

  revalidatePath("/clients");
  return { client: data };
}

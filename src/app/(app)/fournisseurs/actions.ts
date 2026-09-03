"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/auth";
import { supplierSchema } from "./schema";

export interface SupplierFormState {
  error?: string;
}

function readInput(formData: FormData) {
  return supplierSchema.safeParse({
    name: formData.get("name"),
    phone: formData.get("phone") || undefined,
    whatsapp: formData.get("whatsapp") || undefined,
    city: formData.get("city") || undefined,
    notes: formData.get("notes") || undefined,
  });
}

export async function createSupplier(
  _prevState: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  await requireOwner();
  const parsed = readInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").insert(parsed.data);
  if (error) {
    return { error: "Impossible de créer le fournisseur." };
  }

  revalidatePath("/fournisseurs");
  redirect("/fournisseurs");
}

export async function updateSupplier(
  id: string,
  _prevState: SupplierFormState,
  formData: FormData,
): Promise<SupplierFormState> {
  await requireOwner();
  const parsed = readInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("suppliers")
    .update(parsed.data)
    .eq("id", id);
  if (error) {
    return { error: "Impossible de modifier le fournisseur." };
  }

  revalidatePath("/fournisseurs");
  revalidatePath(`/fournisseurs/${id}`);
  redirect(`/fournisseurs/${id}`);
}

export interface DeleteState {
  error?: string;
}

export async function deleteSupplier(id: string): Promise<DeleteState> {
  await requireOwner();
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) {
    return { error: "Impossible de supprimer ce fournisseur." };
  }

  revalidatePath("/fournisseurs");
  redirect("/fournisseurs");
}

/** Lecture légère réutilisée par le formulaire "Ajouter un téléphone"
 * (prompt 07) — accessible à owner ET manager (lecture seule des noms). */
export async function listSupplierOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("suppliers")
    .select("id, name")
    .order("name");
  return data ?? [];
}

export interface QuickSupplierState {
  error?: string;
  supplier?: { id: string; name: string };
}

/** Création rapide depuis le formulaire "Ajouter un téléphone" (prompt 07) —
 * réservée au propriétaire (le module Fournisseurs est owner-only) ; ne
 * redirige pas, contrairement à `createSupplier`. */
export async function createSupplierQuick(
  _prevState: QuickSupplierState,
  formData: FormData,
): Promise<QuickSupplierState> {
  await requireOwner();
  const parsed = readInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .insert(parsed.data)
    .select("id, name")
    .single();

  if (error || !data) {
    return { error: "Impossible de créer le fournisseur." };
  }

  revalidatePath("/fournisseurs");
  return { supplier: data };
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { accessorySchema, accessoryUpdateWithoutPurchaseSchema } from "./schema";

export interface AccessoryFormState {
  error?: string;
}

function readInput(formData: FormData) {
  return accessorySchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    compatible_with: formData.get("compatible_with") || undefined,
    supplier_id: formData.get("supplier_id") || undefined,
    photo_url: formData.get("photo_url") || undefined,
    purchase_price: formData.get("purchase_price"),
    sale_price: formData.get("sale_price"),
    quantity_in_stock: formData.get("quantity_in_stock"),
    low_stock_threshold: formData.get("low_stock_threshold") || 3,
  });
}

export async function createAccessory(
  _prevState: AccessoryFormState,
  formData: FormData,
): Promise<AccessoryFormState> {
  const profile = await requireProfile();
  const parsed = readInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("accessories")
    .insert({ ...parsed.data, created_by: profile.id })
    .select("id")
    .single();

  if (error) return { error: "Impossible d'enregistrer l'accessoire." };

  revalidatePath("/accessoires");
  redirect(`/accessoires/${data.id}`);
}

function readUpdateInput(formData: FormData) {
  const common = {
    name: formData.get("name"),
    category: formData.get("category"),
    compatible_with: formData.get("compatible_with") || undefined,
    supplier_id: formData.get("supplier_id") || undefined,
    photo_url: formData.get("photo_url") || undefined,
    sale_price: formData.get("sale_price"),
    quantity_in_stock: formData.get("quantity_in_stock"),
    low_stock_threshold: formData.get("low_stock_threshold") || 3,
  };

  if (formData.has("purchase_price")) {
    return accessorySchema.safeParse({ ...common, purchase_price: formData.get("purchase_price") });
  }
  return accessoryUpdateWithoutPurchaseSchema.safeParse(common);
}

export async function updateAccessory(
  id: string,
  _prevState: AccessoryFormState,
  formData: FormData,
): Promise<AccessoryFormState> {
  await requireProfile();
  const parsed = readUpdateInput(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("accessories").update(parsed.data).eq("id", id);
  if (error) return { error: "Impossible de modifier l'accessoire." };

  revalidatePath("/accessoires");
  revalidatePath(`/accessoires/${id}`);
  redirect(`/accessoires/${id}`);
}

export interface SimpleState {
  error?: string;
}

export async function deleteAccessory(id: string): Promise<SimpleState> {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("accessories").delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      return { error: "Impossible de supprimer un accessoire déjà vendu au moins une fois." };
    }
    return { error: "Impossible de supprimer cet accessoire." };
  }

  revalidatePath("/accessoires");
  redirect("/accessoires");
}

/**
 * Lecture légère réutilisée par le panier de vente (module Ventes) —
 * `purchase_price` est volontairement exclu : le coût unitaire utilisé
 * pour le bénéfice est relu côté serveur au moment de la vente
 * (`createSale`), jamais transmis au navigateur d'un gérant qui n'a pas le
 * droit de le voir.
 */
export async function listAccessoryOptions() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("accessories")
    .select("id, name, category, sale_price, quantity_in_stock")
    .order("name");
  return data ?? [];
}

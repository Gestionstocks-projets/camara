"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { phoneSchema, phoneUpdateWithoutPurchaseSchema } from "./schema";

export interface PhoneFormValues {
  brand?: string;
  model?: string;
  imei?: string;
  condition?: string;
  ram?: string;
  storage?: string;
  color?: string;
  email?: string;
  supplier_id?: string;
  photo_url?: string;
  arrival_date?: string;
}

export interface PhoneFormState {
  error?: string;
  /** Valeurs telles que saisies, renvoyées avec l'erreur pour que le
   * formulaire ne se vide pas (React 19 réinitialise les champs non
   * contrôlés après l'action) — cf. retour utilisateur du 2026-09-04. */
  values?: PhoneFormValues;
}

function formValues(formData: FormData): PhoneFormValues {
  return {
    brand: String(formData.get("brand") ?? ""),
    model: String(formData.get("model") ?? ""),
    imei: String(formData.get("imei") ?? ""),
    condition: String(formData.get("condition") ?? ""),
    ram: String(formData.get("ram") ?? ""),
    storage: String(formData.get("storage") ?? ""),
    color: String(formData.get("color") ?? ""),
    email: String(formData.get("email") ?? ""),
    supplier_id: String(formData.get("supplier_id") ?? ""),
    photo_url: String(formData.get("photo_url") ?? ""),
    arrival_date: String(formData.get("arrival_date") ?? ""),
  };
}

function readInput(formData: FormData) {
  return phoneSchema.safeParse({
    brand: formData.get("brand"),
    model: formData.get("model"),
    imei: formData.get("imei"),
    condition: formData.get("condition"),
    ram: formData.get("ram") || undefined,
    storage: formData.get("storage"),
    color: formData.get("color") || undefined,
    email: formData.get("email") || undefined,
    supplier_id: formData.get("supplier_id") || undefined,
    photo_url: formData.get("photo_url") || undefined,
    arrival_date: formData.get("arrival_date"),
    purchase_price: formData.get("purchase_price"),
    extra_fees: formData.get("extra_fees") || 0,
    planned_sale_price: formData.get("planned_sale_price"),
  });
}

export async function createPhone(
  _prevState: PhoneFormState,
  formData: FormData,
): Promise<PhoneFormState> {
  const profile = await requireProfile();
  const parsed = readInput(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
      values: formValues(formData),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("phones")
    .insert({ ...parsed.data, created_by: profile.id })
    .select("id")
    .single();

  if (error) {
    const values = formValues(formData);
    if (error.code === "23505") {
      return { error: "Cet IMEI existe déjà.", values };
    }
    return { error: "Impossible d'enregistrer le téléphone.", values };
  }

  revalidatePath("/stock");
  redirect(`/stock/${data.id}`);
}

function readUpdateInput(formData: FormData) {
  const common = {
    brand: formData.get("brand"),
    model: formData.get("model"),
    imei: formData.get("imei"),
    condition: formData.get("condition"),
    ram: formData.get("ram") || undefined,
    storage: formData.get("storage"),
    color: formData.get("color") || undefined,
    email: formData.get("email") || undefined,
    supplier_id: formData.get("supplier_id") || undefined,
    photo_url: formData.get("photo_url") || undefined,
    arrival_date: formData.get("arrival_date"),
    planned_sale_price: formData.get("planned_sale_price"),
  };

  // Le champ purchase_price n'est présent dans formData que si le
  // formulaire l'affichait (owner, ou manager avec le droit accordé,
  // cf. phone-form.tsx `showPurchaseFields`) — jamais absent par accident.
  if (formData.has("purchase_price")) {
    return phoneSchema.safeParse({
      ...common,
      purchase_price: formData.get("purchase_price"),
      extra_fees: formData.get("extra_fees") || 0,
    });
  }
  return phoneUpdateWithoutPurchaseSchema.safeParse(common);
}

export async function updatePhone(
  id: string,
  _prevState: PhoneFormState,
  formData: FormData,
): Promise<PhoneFormState> {
  await requireProfile();
  const parsed = readUpdateInput(formData);
  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Formulaire invalide.",
      values: formValues(formData),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("phones").update(parsed.data).eq("id", id);

  if (error) {
    const values = formValues(formData);
    if (error.code === "23505") {
      return { error: "Cet IMEI existe déjà.", values };
    }
    return { error: "Impossible de modifier le téléphone.", values };
  }

  revalidatePath("/stock");
  revalidatePath(`/stock/${id}`);
  redirect(`/stock/${id}`);
}

export interface SimpleState {
  error?: string;
}

export async function setPhoneReserved(
  id: string,
  reserved: boolean,
): Promise<SimpleState> {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase
    .from("phones")
    .update({ status: reserved ? "reserve" : "en_stock" })
    .eq("id", id)
    .eq("status", reserved ? "en_stock" : "reserve");

  if (error) return { error: "Impossible de changer le statut." };

  revalidatePath("/stock");
  revalidatePath(`/stock/${id}`);
  return {};
}

export async function deletePhone(id: string): Promise<SimpleState> {
  await requireProfile();
  const supabase = await createClient();
  const { error } = await supabase.from("phones").delete().eq("id", id);

  if (error) {
    if (error.code === "23503") {
      return {
        error: "Impossible de supprimer un téléphone déjà vendu.",
      };
    }
    return { error: "Impossible de supprimer ce téléphone." };
  }

  revalidatePath("/stock");
  redirect("/stock");
}

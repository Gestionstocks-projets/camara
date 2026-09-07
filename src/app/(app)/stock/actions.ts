"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import {
  imeiSchema,
  phoneBatchSharedSchema,
  phoneSchema,
  phoneUpdateWithoutPurchaseSchema,
} from "./schema";

export interface PhoneFormState {
  error?: string;
}

function readSharedInput(formData: FormData) {
  return phoneBatchSharedSchema.safeParse({
    brand: formData.get("brand"),
    model: formData.get("model"),
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

/**
 * Un même envoi peut contenir plusieurs IMEI (champ répété `name="imei"`)
 * pour enregistrer d'un coup plusieurs unités identiques (prompt 15).
 * Retourne la liste nettoyée (sans doublon, sans entrée vide) ou une
 * erreur explicite — jamais le message brut de zod.
 */
function readImeis(formData: FormData): { imeis: string[] } | { error: string } {
  const raw = formData
    .getAll("imei")
    .map((value) => String(value).trim())
    .filter((value) => value.length > 0);

  if (raw.length === 0) {
    return { error: "Ajoutez au moins un IMEI / numéro de série." };
  }

  const parsed = z.array(imeiSchema).safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "IMEI / numéro de série invalide." };
  }

  const seen = new Map<string, string>();
  for (const imei of parsed.data) {
    const key = imei.toLowerCase();
    if (seen.has(key)) {
      return { error: `IMEI en double dans la saisie : « ${imei} ».` };
    }
    seen.set(key, imei);
  }

  return { imeis: [...seen.values()] };
}

export async function createPhone(
  _prevState: PhoneFormState,
  formData: FormData,
): Promise<PhoneFormState> {
  const profile = await requireProfile();

  const shared = readSharedInput(formData);
  if (!shared.success) {
    return { error: shared.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const imeisResult = readImeis(formData);
  if ("error" in imeisResult) {
    return { error: imeisResult.error };
  }
  const { imeis } = imeisResult;

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("phones")
    .select("imei")
    .in("imei", imeis);

  if (existing && existing.length > 0) {
    const list = existing.map((row) => row.imei).join(", ");
    return {
      error:
        existing.length === 1
          ? `Cet IMEI existe déjà : ${list}.`
          : `Ces IMEI existent déjà : ${list}.`,
    };
  }

  const rows = imeis.map((imei) => ({
    ...shared.data,
    imei,
    created_by: profile.id,
  }));

  const { data, error } = await supabase.from("phones").insert(rows).select("id");

  if (error) {
    if (error.code === "23505") {
      return { error: "Cet IMEI existe déjà." };
    }
    return { error: "Impossible d'enregistrer le(s) téléphone(s)." };
  }

  revalidatePath("/stock");
  const first = data[0];
  if (data.length === 1 && first) {
    redirect(`/stock/${first.id}`);
  }
  redirect(`/stock?added=${data.length}`);
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
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("phones").update(parsed.data).eq("id", id);

  if (error) {
    if (error.code === "23505") {
      return { error: "Cet IMEI existe déjà." };
    }
    return { error: "Impossible de modifier le téléphone." };
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

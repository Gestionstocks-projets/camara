"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/auth";
import { settingsSchema } from "./schema";

export interface SettingsFormState {
  error?: string;
  success?: boolean;
}

export async function updateSettings(
  _prevState: SettingsFormState,
  formData: FormData,
): Promise<SettingsFormState> {
  await requireOwner();

  const parsed = settingsSchema.safeParse({
    shop_name: formData.get("shop_name"),
    shop_phone: formData.get("shop_phone") || undefined,
    shop_whatsapp: formData.get("shop_whatsapp") || undefined,
    shop_email: formData.get("shop_email") || undefined,
    shop_address: formData.get("shop_address") || undefined,
    invoice_prefix: formData.get("invoice_prefix") || "FAC",
    managers_see_purchase_price: formData.get("managers_see_purchase_price") === "on",
    managers_see_profit: formData.get("managers_see_profit") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("settings").update(parsed.data).eq("id", 1);
  if (error) {
    return { error: "Impossible d'enregistrer les paramètres." };
  }

  revalidatePath("/parametres");
  revalidatePath("/dashboard");
  revalidatePath("/stock");
  revalidatePath("/ventes");
  return { success: true };
}

export interface UploadLogoState {
  error?: string;
  url?: string;
}

export async function uploadShopLogo(
  _prevState: UploadLogoState,
  formData: FormData,
): Promise<UploadLogoState> {
  await requireOwner();
  const file = formData.get("logo");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Aucun fichier sélectionné." };
  }

  const supabase = await createClient();
  const path = `logo-${Date.now()}.${file.name.split(".").pop() ?? "png"}`;
  const { error: uploadError } = await supabase.storage
    .from("shop-assets")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    return { error: "Impossible de téléverser le logo." };
  }

  const { data: publicUrl } = supabase.storage.from("shop-assets").getPublicUrl(path);
  const { error: updateError } = await supabase
    .from("settings")
    .update({ shop_logo_url: publicUrl.publicUrl })
    .eq("id", 1);

  if (updateError) {
    return { error: "Logo téléversé mais impossible de l'enregistrer." };
  }

  revalidatePath("/parametres");
  return { url: publicUrl.publicUrl };
}

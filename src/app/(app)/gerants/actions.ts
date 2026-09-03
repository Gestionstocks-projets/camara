"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient, createClient } from "@/lib/supabase/server";
import { requireOwner } from "@/lib/auth";
import { managerSchema } from "./schema";

export interface ManagerFormState {
  error?: string;
}

export async function createManager(
  _prevState: ManagerFormState,
  formData: FormData,
): Promise<ManagerFormState> {
  await requireOwner();

  const parsed = managerSchema.safeParse({
    full_name: formData.get("full_name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const admin = createAdminClient();
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return {
      error:
        createError?.message.includes("already")
          ? "Un compte existe déjà avec cet email."
          : "Impossible de créer le compte.",
    };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    full_name: parsed.data.full_name,
    role: "manager",
    phone: parsed.data.phone,
  });

  if (profileError) {
    await admin.auth.admin.deleteUser(created.user.id);
    return { error: "Impossible de créer le profil du gérant." };
  }

  revalidatePath("/gerants");
  return {};
}

export interface SimpleState {
  error?: string;
}

export async function setManagerDisabled(
  managerId: string,
  disabled: boolean,
): Promise<SimpleState> {
  await requireOwner();

  const admin = createAdminClient();
  const { error: authError } = await admin.auth.admin.updateUserById(managerId, {
    ban_duration: disabled ? "876000h" : "none",
  });
  if (authError) return { error: "Impossible de mettre à jour le compte." };

  const supabase = await createClient();
  const { error: profileError } = await supabase
    .from("profiles")
    .update({ disabled })
    .eq("id", managerId);
  if (profileError) return { error: "Impossible de mettre à jour le profil." };

  revalidatePath("/gerants");
  return {};
}

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { saleSchema, paymentSchema } from "./schema";

export interface SaleFormState {
  error?: string;
}

export async function createSale(
  _prevState: SaleFormState,
  formData: FormData,
): Promise<SaleFormState> {
  const profile = await requireProfile();

  const parsed = saleSchema.safeParse({
    phone_id: formData.get("phone_id"),
    client_id: formData.get("client_id"),
    sale_date: formData.get("sale_date"),
    sale_price: formData.get("sale_price"),
    discount: formData.get("discount") || 0,
    payment_method: formData.get("payment_method"),
    warranty: formData.get("warranty") || undefined,
    payment_status: formData.get("payment_status"),
    amount_paid: formData.get("amount_paid") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const input = parsed.data;
  const amountPaid = input.payment_status === "en_attente" ? 0 : input.amount_paid;

  const supabase = await createClient();

  const { data: phone } = await supabase
    .from("phones")
    .select("status")
    .eq("id", input.phone_id)
    .single();

  if (!phone || phone.status !== "en_stock") {
    return { error: "Ce téléphone vient d'être vendu par quelqu'un d'autre." };
  }

  const { data: sale, error: saleError } = await supabase
    .from("sales")
    .insert({
      phone_id: input.phone_id,
      client_id: input.client_id,
      sale_date: input.sale_date,
      sale_price: input.sale_price,
      discount: input.discount,
      payment_method: input.payment_method,
      warranty: input.warranty,
      payment_status: input.payment_status,
      amount_paid: amountPaid,
      sold_by: profile.id,
    })
    .select("id")
    .single();

  if (saleError || !sale) {
    if (saleError?.code === "23505") {
      return { error: "Ce téléphone vient d'être vendu par quelqu'un d'autre." };
    }
    return { error: "Impossible d'enregistrer la vente." };
  }

  if (amountPaid > 0) {
    await supabase.from("sale_payments").insert({
      sale_id: sale.id,
      amount: amountPaid,
      method: input.payment_method,
      recorded_by: profile.id,
    });
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({ sale_id: sale.id })
    .select("id")
    .single();

  revalidatePath("/stock");
  revalidatePath("/ventes");
  revalidatePath("/clients");

  if (invoiceError || !invoice) {
    // La vente est enregistrée même si la facture a échoué à se générer :
    // on redirige vers la vente plutôt que d'échouer silencieusement.
    redirect(`/ventes/${sale.id}`);
  }

  redirect(`/factures/${invoice.id}`);
}

export interface PaymentFormState {
  error?: string;
}

export async function recordPayment(
  saleId: string,
  _prevState: PaymentFormState,
  formData: FormData,
): Promise<PaymentFormState> {
  const profile = await requireProfile();
  const parsed = paymentSchema.safeParse({
    amount: formData.get("amount"),
    method: formData.get("method"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Formulaire invalide." };
  }

  const supabase = await createClient();
  const { data: sale } = await supabase
    .from("sales")
    .select("sale_price, discount, amount_paid")
    .eq("id", saleId)
    .single();

  if (!sale) return { error: "Vente introuvable." };

  const total = sale.sale_price - sale.discount;
  const newAmountPaid = sale.amount_paid + parsed.data.amount;
  if (newAmountPaid > total) {
    return { error: "Ce paiement dépasse le montant restant dû." };
  }

  const { error: updateError } = await supabase
    .from("sales")
    .update({
      amount_paid: newAmountPaid,
      payment_status: newAmountPaid >= total ? "paye" : "partiel",
    })
    .eq("id", saleId);

  if (updateError) return { error: "Impossible d'enregistrer le paiement." };

  await supabase.from("sale_payments").insert({
    sale_id: saleId,
    amount: parsed.data.amount,
    method: parsed.data.method,
    recorded_by: profile.id,
  });

  revalidatePath(`/ventes/${saleId}`);
  revalidatePath("/ventes");
  return {};
}

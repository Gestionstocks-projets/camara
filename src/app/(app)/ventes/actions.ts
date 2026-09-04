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
    phone_id: formData.get("phone_id") || undefined,
    client_id: formData.get("client_id"),
    sale_date: formData.get("sale_date"),
    sale_price: formData.get("sale_price") || 0,
    cart: formData.get("cart") || "[]",
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

  if (input.phone_id) {
    const { data: phone } = await supabase
      .from("phones")
      .select("status")
      .eq("id", input.phone_id)
      .single();

    if (!phone || phone.status !== "en_stock") {
      return { error: "Ce téléphone vient d'être vendu par quelqu'un d'autre." };
    }
  }

  // Coût unitaire relu côté serveur — jamais fait confiance au client, pour
  // ne jamais exposer purchase_price à un gérant sans le droit, et pour
  // empêcher toute manipulation du bénéfice depuis le navigateur.
  let unitCostByAccessoryId = new Map<string, number>();
  if (input.cart.length > 0) {
    const { data: accessories } = await supabase
      .from("accessories")
      .select("id, purchase_price")
      .in(
        "id",
        input.cart.map((item) => item.accessory_id),
      );
    unitCostByAccessoryId = new Map((accessories ?? []).map((a) => [a.id, a.purchase_price]));
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

  for (const item of input.cart) {
    const unitCost = unitCostByAccessoryId.get(item.accessory_id) ?? 0;
    const { error: itemError } = await supabase.from("sale_items").insert({
      sale_id: sale.id,
      accessory_id: item.accessory_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      unit_cost: unitCost,
    });
    if (itemError) {
      // Vente déjà créée mais un article n'a pas pu être ajouté (le plus
      // souvent : stock insuffisant, contrainte quantity_in_stock >= 0) —
      // on redirige vers la vente plutôt que de laisser l'utilisateur sans
      // retour ; il pourra constater le souci et contacter le propriétaire.
      revalidatePath("/stock");
      revalidatePath("/accessoires");
      revalidatePath("/ventes");
      redirect(`/ventes/${sale.id}`);
    }
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
    // `number` est rempli par le trigger `generate_invoice_number` — le
    // type généré l'exige pourtant explicitement (il ne connaît pas les
    // triggers), d'où l'assertion.
    .insert({ sale_id: sale.id } as { sale_id: string; number: string })
    .select("id")
    .single();

  revalidatePath("/stock");
  revalidatePath("/accessoires");
  revalidatePath("/ventes");
  revalidatePath("/clients");

  if (invoiceError || !invoice) {
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
    .select("sale_price, accessories_total, discount, amount_paid")
    .eq("id", saleId)
    .single();

  if (!sale) return { error: "Vente introuvable." };

  const total = sale.sale_price + sale.accessories_total - sale.discount;
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

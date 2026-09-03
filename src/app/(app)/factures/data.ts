import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PHONE_CONDITION_LABELS,
} from "@/lib/constants";
import { formatDate, formatFCFA } from "@/lib/utils";

/**
 * Rassemble toutes les données d'une facture prêtes à afficher — réutilisé
 * tel quel par la page HTML (`[id]/page.tsx`) et le document PDF
 * (`invoice-pdf.tsx`) pour ne jamais dupliquer la mise en forme.
 */
export async function getInvoiceData(invoiceId: string) {
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("id, number, created_at, sale_id")
    .eq("id", invoiceId)
    .single();
  if (!invoice) notFound();

  const { data: sale } = await supabase
    .from("sales")
    .select("*")
    .eq("id", invoice.sale_id)
    .single();
  if (!sale) notFound();

  const [{ data: settings }, { data: phone }, { data: client }] = await Promise.all([
    supabase.from("settings").select("*").single(),
    supabase.from("phones").select("*").eq("id", sale.phone_id).single(),
    supabase.from("clients").select("*").eq("id", sale.client_id).single(),
  ]);

  if (!phone || !client) notFound();

  const total = sale.sale_price - sale.discount;

  return {
    invoice: {
      number: invoice.number,
      date: formatDate(invoice.created_at),
    },
    shop: {
      name: settings?.shop_name ?? "Ma Boutique",
      logoUrl: settings?.shop_logo_url ?? null,
      phone: settings?.shop_phone ?? null,
      whatsapp: settings?.shop_whatsapp ?? null,
      email: settings?.shop_email ?? null,
      address: settings?.shop_address ?? null,
    },
    client: {
      fullName: `${client.first_name} ${client.last_name}`,
      phone: client.phone,
      email: client.email,
      whatsapp: client.whatsapp,
    },
    phone: {
      brand: phone.brand,
      model: phone.model,
      imei: phone.imei,
      ram: phone.ram,
      storage: phone.storage,
      color: phone.color,
      condition: PHONE_CONDITION_LABELS[phone.condition],
    },
    sale: {
      salePriceLabel: formatFCFA(sale.sale_price),
      discountLabel: formatFCFA(sale.discount),
      totalLabel: formatFCFA(total),
      total,
      paymentMethodLabel: PAYMENT_METHOD_LABELS[sale.payment_method],
      paymentStatusLabel: PAYMENT_STATUS_LABELS[sale.payment_status],
      amountDueLabel: formatFCFA(sale.amount_due),
      amountDue: sale.amount_due,
      warranty: sale.warranty,
      dateLabel: formatDate(sale.sale_date),
    },
  };
}

export type InvoiceData = Awaited<ReturnType<typeof getInvoiceData>>;

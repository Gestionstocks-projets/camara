import { createClient } from "@/lib/supabase/server";
import { getVisibilityFlags } from "@/lib/permissions";
import type { Profile, PaymentStatus, PaymentMethod, SaleMasked } from "@/types";

export interface SaleFilters {
  from: string;
  to: string;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

const SALE_COLUMNS =
  "id, phone_id, client_id, sale_date, sale_price, discount, profit, payment_method, warranty, payment_status, amount_paid, amount_due, sold_by, created_at";

function maskSale(sale: SaleMasked, seeProfit: boolean): SaleMasked {
  if (seeProfit) return sale;
  const masked: SaleMasked = { ...sale };
  delete masked.profit;
  return masked;
}

export async function getSales(profile: Profile, filters: SaleFilters) {
  const supabase = await createClient();
  const { seeProfit } = await getVisibilityFlags(profile);

  let query = supabase
    .from("sales")
    .select(SALE_COLUMNS)
    .gte("sale_date", filters.from)
    .lte("sale_date", filters.to)
    .order("sale_date", { ascending: false });

  if (filters.paymentStatus) query = query.eq("payment_status", filters.paymentStatus);
  if (filters.paymentMethod) query = query.eq("payment_method", filters.paymentMethod);

  const { data } = await query;
  const sales = (data ?? []).map((sale) => maskSale(sale, seeProfit));

  const phoneIds = sales.map((sale) => sale.phone_id);
  const { data: phones } =
    phoneIds.length > 0
      ? await supabase
          .from("phones")
          .select("id, brand, model, imei, condition, ram, storage")
          .in("id", phoneIds)
      : { data: [] };
  const phonesById = new Map((phones ?? []).map((phone) => [phone.id, phone]));

  const clientIds = sales.map((sale) => sale.client_id);
  const { data: clients } =
    clientIds.length > 0
      ? await supabase
          .from("clients")
          .select("id, first_name, last_name")
          .in("id", clientIds)
      : { data: [] };
  const clientsById = new Map((clients ?? []).map((client) => [client.id, client]));

  const saleIds = sales.map((sale) => sale.id);
  const { data: invoices } =
    saleIds.length > 0
      ? await supabase.from("invoices").select("id, sale_id, number").in("sale_id", saleIds)
      : { data: [] };
  const invoicesBySaleId = new Map((invoices ?? []).map((inv) => [inv.sale_id, inv]));

  return sales.map((sale) => ({
    sale,
    phone: phonesById.get(sale.phone_id) ?? null,
    client: clientsById.get(sale.client_id) ?? null,
    invoice: invoicesBySaleId.get(sale.id) ?? null,
  }));
}

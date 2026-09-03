import { formatDate, formatFCFA } from "@/lib/utils";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PHONE_CONDITION_LABELS,
} from "@/lib/constants";
import type { ExportColumn } from "@/lib/export";
import type { SaleMasked, PhoneCondition } from "@/types";

export interface SaleExportRow {
  sale: SaleMasked;
  phone: { brand: string; model: string; imei: string; condition?: PhoneCondition; ram?: string | null; storage?: string } | null;
  client: { first_name: string; last_name: string } | null;
}

export function buildSaleColumns(seeProfit: boolean): ExportColumn<SaleExportRow>[] {
  const columns: ExportColumn<SaleExportRow>[] = [
    { key: "sale_date", label: "Date de vente", value: (r) => formatDate(r.sale.sale_date) },
    { key: "brand", label: "Marque", value: (r) => r.phone?.brand ?? "" },
    { key: "model", label: "Modèle", value: (r) => r.phone?.model ?? "" },
    { key: "imei", label: "IMEI", value: (r) => r.phone?.imei ?? "" },
    {
      key: "condition",
      label: "État",
      value: (r) => (r.phone?.condition ? PHONE_CONDITION_LABELS[r.phone.condition] : ""),
    },
    { key: "ram", label: "RAM", value: (r) => r.phone?.ram ?? "" },
    { key: "storage", label: "Stockage", value: (r) => r.phone?.storage ?? "" },
    { key: "sale_price", label: "Prix de vente", value: (r) => formatFCFA(r.sale.sale_price) },
    { key: "discount", label: "Remise", value: (r) => formatFCFA(r.sale.discount) },
  ];

  if (seeProfit) {
    columns.push({
      key: "profit",
      label: "Bénéfice",
      value: (r) => formatFCFA(r.sale.profit ?? 0),
    });
  }

  columns.push(
    {
      key: "client",
      label: "Client",
      value: (r) => (r.client ? `${r.client.first_name} ${r.client.last_name}` : ""),
    },
    {
      key: "payment_method",
      label: "Mode de paiement",
      value: (r) => PAYMENT_METHOD_LABELS[r.sale.payment_method],
    },
    {
      key: "payment_status",
      label: "Statut",
      value: (r) => PAYMENT_STATUS_LABELS[r.sale.payment_status],
    },
  );

  return columns;
}

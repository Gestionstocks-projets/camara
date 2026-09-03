import { formatDate, formatFCFA } from "@/lib/utils";
import { PHONE_CONDITION_LABELS, PHONE_STATUS_LABELS } from "@/lib/constants";
import type { ExportColumn } from "@/lib/export";
import type { PhoneMasked } from "@/types";

export function buildStockColumns(
  supplierNameById: Map<string, string>,
  seePurchasePrice: boolean,
): ExportColumn<PhoneMasked>[] {
  const columns: ExportColumn<PhoneMasked>[] = [
    { key: "brand", label: "Marque", value: (p) => p.brand },
    { key: "model", label: "Modèle", value: (p) => p.model },
    { key: "imei", label: "IMEI", value: (p) => p.imei },
    { key: "condition", label: "État", value: (p) => PHONE_CONDITION_LABELS[p.condition] },
    { key: "status", label: "Statut", value: (p) => PHONE_STATUS_LABELS[p.status] },
    { key: "ram", label: "RAM", value: (p) => p.ram ?? "" },
    { key: "storage", label: "Stockage", value: (p) => p.storage },
    { key: "color", label: "Couleur", value: (p) => p.color ?? "" },
  ];

  if (seePurchasePrice) {
    columns.push({
      key: "purchase_price",
      label: "Prix d'achat",
      value: (p) => formatFCFA(p.purchase_price ?? 0),
    });
  }

  columns.push(
    {
      key: "planned_sale_price",
      label: "Prix de vente",
      value: (p) => formatFCFA(p.planned_sale_price),
    },
    { key: "arrival_date", label: "Date d'arrivée", value: (p) => formatDate(p.arrival_date) },
    {
      key: "supplier",
      label: "Fournisseur",
      value: (p) => (p.supplier_id ? supplierNameById.get(p.supplier_id) ?? "" : ""),
    },
  );

  return columns;
}

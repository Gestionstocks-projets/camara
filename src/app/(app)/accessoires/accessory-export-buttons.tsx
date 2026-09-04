"use client";

import { ExportButtons } from "@/components/export-buttons";
import { ACCESSORY_CATEGORY_LABELS } from "@/lib/constants";
import { formatFCFA } from "@/lib/utils";
import type { ExportColumn } from "@/lib/export";
import type { AccessoryMasked } from "@/types";

function buildColumns(seePurchasePrice: boolean): ExportColumn<AccessoryMasked>[] {
  const columns: ExportColumn<AccessoryMasked>[] = [
    { key: "name", label: "Nom", value: (a) => a.name },
    { key: "category", label: "Catégorie", value: (a) => ACCESSORY_CATEGORY_LABELS[a.category] },
    { key: "compatible_with", label: "Compatibilité", value: (a) => a.compatible_with ?? "" },
  ];
  if (seePurchasePrice) {
    columns.push({
      key: "purchase_price",
      label: "Prix d'achat",
      value: (a) => formatFCFA(a.purchase_price ?? 0),
    });
  }
  columns.push(
    { key: "sale_price", label: "Prix de vente", value: (a) => formatFCFA(a.sale_price) },
    { key: "quantity_in_stock", label: "Quantité en stock", value: (a) => a.quantity_in_stock },
  );
  return columns;
}

/** Wrapper client — voir stock/stock-export-buttons.tsx pour le pourquoi. */
export function AccessoryExportButtons({
  accessories,
  seePurchasePrice,
}: {
  accessories: AccessoryMasked[];
  seePurchasePrice: boolean;
}) {
  return (
    <ExportButtons
      data={accessories}
      filename="accessoires"
      title="Accessoires"
      columns={buildColumns(seePurchasePrice)}
    />
  );
}

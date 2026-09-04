"use client";

import { ExportButtons } from "@/components/export-buttons";
import { buildStockColumns } from "./export-columns";
import type { PhoneMasked } from "@/types";

/**
 * Wrapper client : construit les colonnes (fonctions) ICI plutôt que côté
 * serveur, car une fonction ne peut pas traverser la frontière Server →
 * Client Component (erreur "Functions cannot be passed directly to Client
 * Components" en production — cassait Stock/Ventes/Clients/Fournisseurs,
 * cf. retour utilisateur du 2026-09-04). `supplierNames` reste une donnée
 * sérialisable (tableau de paires), reconstruite en Map ici.
 */
export function StockExportButtons({
  phones,
  supplierNames,
  seePurchasePrice,
}: {
  phones: PhoneMasked[];
  supplierNames: [string, string][];
  seePurchasePrice: boolean;
}) {
  const supplierNameById = new Map(supplierNames);
  return (
    <ExportButtons
      data={phones}
      filename="stock"
      title="Stock"
      columns={buildStockColumns(supplierNameById, seePurchasePrice)}
    />
  );
}

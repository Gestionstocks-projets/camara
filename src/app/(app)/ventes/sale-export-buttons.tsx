"use client";

import { ExportButtons } from "@/components/export-buttons";
import { buildSaleColumns, type SaleExportRow } from "./export-columns";

/** Wrapper client — voir stock/stock-export-buttons.tsx pour le pourquoi. */
export function SaleExportButtons({
  rows,
  filename,
  subtitle,
  seeProfit,
}: {
  rows: SaleExportRow[];
  filename: string;
  subtitle: string;
  seeProfit: boolean;
}) {
  return (
    <ExportButtons
      data={rows}
      filename={filename}
      title="Ventes"
      subtitle={subtitle}
      columns={buildSaleColumns(seeProfit)}
    />
  );
}

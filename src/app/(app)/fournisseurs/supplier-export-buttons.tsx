"use client";

import { ExportButtons } from "@/components/export-buttons";
import type { ExportColumn } from "@/lib/export";

export interface SupplierExportRow {
  name: string;
  phone: string | null;
  whatsapp: string | null;
  city: string | null;
  count: number;
}

const supplierColumns: ExportColumn<SupplierExportRow>[] = [
  { key: "name", label: "Nom", value: (s) => s.name },
  { key: "phone", label: "Téléphone", value: (s) => s.phone ?? "" },
  { key: "whatsapp", label: "WhatsApp", value: (s) => s.whatsapp ?? "" },
  { key: "city", label: "Ville", value: (s) => s.city ?? "" },
  { key: "count", label: "Téléphones fournis", value: (s) => s.count },
];

/** Wrapper client — voir stock/stock-export-buttons.tsx pour le pourquoi. */
export function SupplierExportButtons({
  rows,
  filename,
  subtitle,
}: {
  rows: SupplierExportRow[];
  filename: string;
  subtitle: string;
}) {
  return (
    <ExportButtons
      data={rows}
      filename={filename}
      title="Fournisseurs"
      subtitle={subtitle}
      columns={supplierColumns}
    />
  );
}

"use client";

import { ExportButtons } from "@/components/export-buttons";
import { formatFCFA } from "@/lib/utils";
import type { ExportColumn } from "@/lib/export";

export interface ClientExportRow {
  first_name: string;
  last_name: string;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  city: string | null;
  count: number;
  total: number;
}

const clientColumns: ExportColumn<ClientExportRow>[] = [
  { key: "first_name", label: "Prénom", value: (c) => c.first_name },
  { key: "last_name", label: "Nom", value: (c) => c.last_name },
  { key: "phone", label: "Téléphone", value: (c) => c.phone ?? "" },
  { key: "whatsapp", label: "WhatsApp", value: (c) => c.whatsapp ?? "" },
  { key: "email", label: "Email", value: (c) => c.email ?? "" },
  { key: "city", label: "Ville", value: (c) => c.city ?? "" },
  { key: "count", label: "Nombre d'achats", value: (c) => c.count },
  { key: "total", label: "Total dépensé", value: (c) => formatFCFA(c.total) },
];

/** Wrapper client — voir stock/stock-export-buttons.tsx pour le pourquoi. */
export function ClientExportButtons({
  rows,
  filename,
  subtitle,
}: {
  rows: ClientExportRow[];
  filename: string;
  subtitle: string;
}) {
  return (
    <ExportButtons
      data={rows}
      filename={filename}
      title="Clients"
      subtitle={subtitle}
      columns={clientColumns}
    />
  );
}

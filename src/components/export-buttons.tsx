"use client";

import { useState } from "react";
import { FileSpreadsheet, FileDown } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { exportToExcel, type ExportColumn } from "@/lib/export";
import { GenericTablePdf } from "@/components/generic-table-pdf";

export function ExportButtons<T>({
  data,
  columns,
  filename,
  title,
  subtitle,
}: {
  data: T[];
  columns: ExportColumn<T>[];
  filename: string;
  title: string;
  subtitle?: string;
}) {
  const [excelLoading, setExcelLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const toast = useToast();

  async function handleExcel() {
    setExcelLoading(true);
    try {
      await exportToExcel(data, columns, filename);
    } catch {
      toast.error("Impossible de générer le fichier Excel.");
    } finally {
      setExcelLoading(false);
    }
  }

  async function handlePdf() {
    setPdfLoading(true);
    try {
      const blob = await pdf(
        <GenericTablePdf title={title} subtitle={subtitle} rows={data} columns={columns} />,
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de générer le PDF.");
    } finally {
      setPdfLoading(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExcel} disabled={excelLoading || data.length === 0}>
        <FileSpreadsheet className="h-4 w-4" /> {excelLoading ? "Export…" : "Exporter Excel"}
      </Button>
      <Button variant="outline" size="sm" onClick={handlePdf} disabled={pdfLoading || data.length === 0}>
        <FileDown className="h-4 w-4" /> {pdfLoading ? "Export…" : "Exporter PDF"}
      </Button>
    </div>
  );
}

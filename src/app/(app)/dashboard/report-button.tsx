"use client";

import { useState } from "react";
import { FileDown } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { DashboardReportPdf, type ReportData } from "./report-pdf";

export function ReportButton({ data }: { data: ReportData }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  async function handleClick() {
    setLoading(true);
    try {
      const blob = await pdf(<DashboardReportPdf data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `rapport-${data.periodLabel.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de générer le rapport.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleClick} disabled={loading}>
      <FileDown className="h-4 w-4" /> {loading ? "Génération…" : "Rapport PDF"}
    </Button>
  );
}

"use client";

import { useState } from "react";
import { Printer, Download, MessageCircle } from "lucide-react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { createClient } from "@/lib/supabase/client";
import { InvoicePdf } from "./invoice-pdf";
import type { InvoiceData } from "./data";

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

export function InvoiceActions({
  data,
  clientWhatsapp,
}: {
  data: InvoiceData;
  clientWhatsapp: string | null;
}) {
  const [downloading, setDownloading] = useState(false);
  const [sending, setSending] = useState(false);
  const toast = useToast();

  async function handleDownload() {
    setDownloading(true);
    try {
      const blob = await pdf(<InvoicePdf data={data} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${data.invoice.number}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error("Impossible de générer le PDF.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleWhatsapp() {
    if (!clientWhatsapp) return;
    setSending(true);
    try {
      const blob = await pdf(<InvoicePdf data={data} />).toBlob();
      const supabase = createClient();
      const path = `${data.invoice.number}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("invoices")
        .upload(path, blob, { contentType: "application/pdf", upsert: true });

      if (uploadError) {
        toast.error("Impossible de préparer la facture pour WhatsApp.");
        return;
      }

      const { data: publicUrl } = supabase.storage.from("invoices").getPublicUrl(path);
      const message = `Bonjour ${data.client.fullName}, voici votre facture ${data.invoice.number} : ${publicUrl.publicUrl}`;
      window.open(
        `https://wa.me/${digitsOnly(clientWhatsapp)}?text=${encodeURIComponent(message)}`,
        "_blank",
      );
    } catch {
      toast.error("Impossible d'envoyer la facture par WhatsApp.");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer className="h-4 w-4" /> Imprimer
      </Button>
      <Button variant="outline" size="sm" onClick={handleDownload} disabled={downloading}>
        <Download className="h-4 w-4" /> {downloading ? "Génération…" : "Télécharger PDF"}
      </Button>
      <Button
        variant="brass"
        size="sm"
        onClick={handleWhatsapp}
        disabled={sending || !clientWhatsapp}
        title={clientWhatsapp ? undefined : "Aucun numéro WhatsApp renseigné pour ce client"}
      >
        <MessageCircle className="h-4 w-4" /> {sending ? "Envoi…" : "Envoyer WhatsApp"}
      </Button>
    </div>
  );
}

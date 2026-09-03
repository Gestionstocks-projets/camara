import Link from "next/link";
import { Receipt } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableTh,
} from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, formatFCFA } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONE } from "@/lib/constants";

export default async function FacturesPage() {
  await requireProfile();
  const supabase = await createClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, number, created_at, sale_id")
    .order("created_at", { ascending: false });

  const saleIds = (invoices ?? []).map((invoice) => invoice.sale_id);
  const { data: sales } =
    saleIds.length > 0
      ? await supabase
          .from("sales")
          .select("id, client_id, phone_id, sale_price, discount, payment_status")
          .in("id", saleIds)
      : { data: [] };
  const salesById = new Map((sales ?? []).map((sale) => [sale.id, sale]));

  const clientIds = (sales ?? []).map((sale) => sale.client_id);
  const { data: clients } =
    clientIds.length > 0
      ? await supabase.from("clients").select("id, first_name, last_name").in("id", clientIds)
      : { data: [] };
  const clientsById = new Map((clients ?? []).map((client) => [client.id, client]));

  const phoneIds = (sales ?? []).map((sale) => sale.phone_id);
  const { data: phones } =
    phoneIds.length > 0
      ? await supabase.from("phones").select("id, brand, model").in("id", phoneIds)
      : { data: [] };
  const phonesById = new Map((phones ?? []).map((phone) => [phone.id, phone]));

  return (
    <div>
      <PageHeader title="Factures" />

      {!invoices || invoices.length === 0 ? (
        <EmptyState icon={Receipt} title="Aucune facture pour l'instant" />
      ) : (
        <Table>
          <TableHead>
            <TableTh>Numéro</TableTh>
            <TableTh>Date</TableTh>
            <TableTh>Client</TableTh>
            <TableTh>Téléphone</TableTh>
            <TableTh>Montant</TableTh>
            <TableTh>Statut</TableTh>
          </TableHead>
          <TableBody>
            {invoices.map((invoice) => {
              const sale = salesById.get(invoice.sale_id);
              const client = sale ? clientsById.get(sale.client_id) : null;
              const phone = sale ? phonesById.get(sale.phone_id) : null;
              return (
                <TableRow key={invoice.id}>
                  <TableCell className="font-semibold">
                    <Link href={`/factures/${invoice.id}`} className="hover:underline">
                      {invoice.number}
                    </Link>
                  </TableCell>
                  <TableCell>{formatDate(invoice.created_at)}</TableCell>
                  <TableCell>
                    {client ? `${client.first_name} ${client.last_name}` : "—"}
                  </TableCell>
                  <TableCell>{phone ? `${phone.brand} ${phone.model}` : "—"}</TableCell>
                  <TableCell className="tabular">
                    {sale ? formatFCFA(sale.sale_price - sale.discount) : "—"}
                  </TableCell>
                  <TableCell>
                    {sale ? (
                      <Badge tone={PAYMENT_STATUS_TONE[sale.payment_status]}>
                        {PAYMENT_STATUS_LABELS[sale.payment_status]}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

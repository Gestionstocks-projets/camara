import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
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
import { ShoppingBag } from "lucide-react";
import { formatDate, formatFCFA } from "@/lib/utils";
import { PAYMENT_STATUS_LABELS, PAYMENT_STATUS_TONE } from "@/lib/constants";
import { EditClientButton } from "./edit-client-button";
import { DeleteClientButton } from "./delete-client-button";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .single();

  if (!client) notFound();

  const { data: sales } = await supabase
    .from("sales")
    .select("id, phone_id, sale_date, sale_price, accessories_total, discount, payment_status")
    .eq("client_id", id)
    .order("sale_date", { ascending: false });

  const phoneIds = (sales ?? [])
    .map((sale) => sale.phone_id)
    .filter((id): id is string => id !== null);
  const { data: phones } =
    phoneIds.length > 0
      ? await supabase.from("phones").select("id, brand, model").in("id", phoneIds)
      : { data: [] };
  const phonesById = new Map((phones ?? []).map((phone) => [phone.id, phone]));

  const saleIds = (sales ?? []).map((sale) => sale.id);
  const { data: invoices } =
    saleIds.length > 0
      ? await supabase.from("invoices").select("id, sale_id, number").in("sale_id", saleIds)
      : { data: [] };
  const invoiceBySaleId = new Map((invoices ?? []).map((inv) => [inv.sale_id, inv]));

  const totalSpent = (sales ?? []).reduce(
    (sum, sale) => sum + (sale.sale_price + sale.accessories_total - sale.discount),
    0,
  );

  return (
    <div>
      <PageHeader
        title={`${client.first_name} ${client.last_name}`}
        description={client.city ?? undefined}
        actions={
          <>
            <EditClientButton client={client} />
            <DeleteClientButton clientId={client.id} />
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase text-muted">Téléphone</p>
            <p className="mt-1 text-sm font-semibold">{client.phone ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase text-muted">WhatsApp</p>
            <p className="mt-1 text-sm font-semibold">{client.whatsapp ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase text-muted">Email</p>
            <p className="mt-1 text-sm font-semibold">{client.email ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-base font-bold">Historique d&apos;achats</h2>
        <p className="text-sm text-muted">
          {sales?.length ?? 0} achat(s) · {formatFCFA(totalSpent)} dépensés
        </p>
      </div>

      {!sales || sales.length === 0 ? (
        <EmptyState icon={ShoppingBag} title="Aucun achat pour l'instant" />
      ) : (
        <Table>
          <TableHead>
            <TableTh>Téléphone</TableTh>
            <TableTh>Date</TableTh>
            <TableTh>Montant</TableTh>
            <TableTh>Statut</TableTh>
            <TableTh>Facture</TableTh>
          </TableHead>
          <TableBody>
            {sales.map((sale) => {
              const phone = sale.phone_id ? phonesById.get(sale.phone_id) : undefined;
              const invoice = invoiceBySaleId.get(sale.id);
              const hasAccessories = sale.accessories_total > 0;
              return (
                <TableRow key={sale.id}>
                  <TableCell className="font-semibold">
                    {phone ? `${phone.brand} ${phone.model}` : hasAccessories ? "Accessoires" : "—"}
                    {phone && hasAccessories ? " + accessoires" : ""}
                  </TableCell>
                  <TableCell>{formatDate(sale.sale_date)}</TableCell>
                  <TableCell className="tabular">
                    {formatFCFA(sale.sale_price + sale.accessories_total - sale.discount)}
                  </TableCell>
                  <TableCell>
                    <Badge tone={PAYMENT_STATUS_TONE[sale.payment_status]}>
                      {PAYMENT_STATUS_LABELS[sale.payment_status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {invoice ? (
                      <Link href={`/factures/${invoice.id}`} className="text-accent hover:underline">
                        {invoice.number}
                      </Link>
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

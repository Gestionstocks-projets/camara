import Link from "next/link";
import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getVisibilityFlags } from "@/lib/permissions";
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
import { formatDate, formatFCFA } from "@/lib/utils";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
} from "@/lib/constants";
import { RecordPaymentForm } from "./record-payment-form";

export default async function SaleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireProfile();
  const { id } = await params;
  const supabase = await createClient();

  const { data: sale } = await supabase.from("sales").select("*").eq("id", id).single();
  if (!sale) notFound();

  const { seeProfit } = await getVisibilityFlags(profile);

  const [{ data: phone }, { data: client }, { data: invoice }, { data: payments }] =
    await Promise.all([
      supabase.from("phones").select("id, brand, model, imei").eq("id", sale.phone_id).single(),
      supabase
        .from("clients")
        .select("id, first_name, last_name")
        .eq("id", sale.client_id)
        .single(),
      supabase.from("invoices").select("id, number").eq("sale_id", sale.id).single(),
      supabase
        .from("sale_payments")
        .select("id, amount, method, paid_at")
        .eq("sale_id", sale.id)
        .order("paid_at", { ascending: true }),
    ]);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title={phone ? `${phone.brand} ${phone.model}` : "Vente"}
        description={client ? `${client.first_name} ${client.last_name}` : undefined}
        actions={
          invoice ? (
            <Link href={`/factures/${invoice.id}`} className="text-sm font-semibold text-accent hover:underline">
              Voir la facture {invoice.number}
            </Link>
          ) : undefined
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <Badge tone={PAYMENT_STATUS_TONE[sale.payment_status]}>
          {PAYMENT_STATUS_LABELS[sale.payment_status]}
        </Badge>
        <Badge tone="neutral">{PAYMENT_METHOD_LABELS[sale.payment_method]}</Badge>
      </div>

      <Card className="mb-6">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          <Field label="Date de vente" value={formatDate(sale.sale_date)} />
          <Field label="Prix de vente" value={formatFCFA(sale.sale_price)} />
          <Field label="Remise" value={formatFCFA(sale.discount)} />
          {seeProfit ? (
            <Field label="Bénéfice" value={formatFCFA(sale.profit)} valueClassName="text-brass" />
          ) : null}
          <Field label="Montant payé" value={formatFCFA(sale.amount_paid)} />
          <Field
            label="Reste à payer"
            value={formatFCFA(sale.amount_due)}
            valueClassName={sale.amount_due > 0 ? "text-danger" : "text-success"}
          />
          {sale.warranty ? <Field label="Garantie" value={sale.warranty} /> : null}
        </CardContent>
      </Card>

      {sale.amount_due > 0 ? (
        <Card className="mb-6">
          <CardContent className="p-5">
            <h2 className="mb-3 font-display text-sm font-bold">Enregistrer un paiement</h2>
            <RecordPaymentForm saleId={sale.id} />
          </CardContent>
        </Card>
      ) : null}

      <h2 className="mb-3 font-display text-sm font-bold">Historique des paiements</h2>
      <Table>
        <TableHead>
          <TableTh>Date</TableTh>
          <TableTh>Montant</TableTh>
          <TableTh>Mode</TableTh>
        </TableHead>
        <TableBody>
          {(payments ?? []).map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>{formatDate(payment.paid_at)}</TableCell>
              <TableCell className="tabular">{formatFCFA(payment.amount)}</TableCell>
              <TableCell>{PAYMENT_METHOD_LABELS[payment.method]}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function Field({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className={`tabular mt-1 text-sm font-semibold ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}

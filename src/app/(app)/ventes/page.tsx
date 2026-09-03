import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
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
import { PeriodFilter } from "@/components/period-filter";
import { formatDate, formatFCFA } from "@/lib/utils";
import { resolvePeriod, type PeriodKey } from "@/lib/period";
import {
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
  PAYMENT_STATUS_TONE,
} from "@/lib/constants";
import { ExportButtons } from "@/components/export-buttons";
import { getVisibilityFlags } from "@/lib/permissions";
import { getSales } from "./queries";
import { buildSaleColumns } from "./export-columns";
import type { PaymentMethod, PaymentStatus } from "@/types";

interface VentesPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function VentesPage({ searchParams }: VentesPageProps) {
  const profile = await requireProfile();
  const params = await searchParams;
  const period = resolvePeriod(params.period, params.from, params.to);

  const rows = await getSales(profile, {
    from: period.from,
    to: period.to,
    paymentStatus: (params.paymentStatus as PaymentStatus) || undefined,
    paymentMethod: (params.paymentMethod as PaymentMethod) || undefined,
  });

  const { seeProfit } = await getVisibilityFlags(profile);

  return (
    <div>
      <PageHeader
        title="Ventes"
        description={`${rows.length} vente(s) sur la période`}
        actions={
          <>
            <ExportButtons
              data={rows}
              filename={`ventes-${period.from}-au-${period.to}`}
              title="Ventes"
              subtitle={`Période : ${period.from} au ${period.to}`}
              columns={buildSaleColumns(seeProfit)}
            />
            <Link href="/ventes/nouvelle" className={buttonVariants({ size: "sm", variant: "brass" })}>
              + Nouvelle vente
            </Link>
          </>
        }
      />

      <div className="mb-4">
        <PeriodFilter current={period.key as PeriodKey} />
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="Aucune vente sur cette période" />
      ) : (
        <Table>
          <TableHead>
            <TableTh>Date</TableTh>
            <TableTh>Téléphone</TableTh>
            <TableTh>Client</TableTh>
            <TableTh>Prix</TableTh>
            <TableTh>Remise</TableTh>
            <TableTh>Bénéfice</TableTh>
            <TableTh>Paiement</TableTh>
            <TableTh>Statut</TableTh>
            <TableTh>Facture</TableTh>
          </TableHead>
          <TableBody>
            {rows.map(({ sale, phone, client, invoice }) => (
              <TableRow key={sale.id}>
                <TableCell>{formatDate(sale.sale_date)}</TableCell>
                <TableCell className="font-semibold">
                  {phone ? (
                    <Link href={`/stock/${phone.id}`} className="hover:underline">
                      {phone.brand} {phone.model}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell>
                  {client ? (
                    <Link href={`/clients/${client.id}`} className="hover:underline">
                      {client.first_name} {client.last_name}
                    </Link>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="tabular">{formatFCFA(sale.sale_price)}</TableCell>
                <TableCell className="tabular">{formatFCFA(sale.discount)}</TableCell>
                <TableCell className="tabular text-brass">
                  {sale.profit !== undefined ? formatFCFA(sale.profit) : "—"}
                </TableCell>
                <TableCell>{PAYMENT_METHOD_LABELS[sale.payment_method]}</TableCell>
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
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

import Link from "next/link";
import { Users } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
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
import { formatFCFA } from "@/lib/utils";
import { resolvePeriod, type PeriodKey } from "@/lib/period";
import { CreateClientButton } from "./create-client-button";
import { ClientExportButtons, type ClientExportRow } from "./client-export-buttons";

interface ClientsPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function ClientsPage({ searchParams }: ClientsPageProps) {
  await requireProfile();
  const params = await searchParams;
  const period = resolvePeriod(params.period, params.from, params.to);
  const supabase = await createClient();

  const { data: clients } = await supabase
    .from("clients")
    .select("id, first_name, last_name, phone, whatsapp, email, city, created_at")
    .order("last_name");

  const { data: sales } = await supabase
    .from("sales")
    .select("client_id, sale_price, discount");

  const stats = new Map<string, { count: number; total: number }>();
  for (const sale of sales ?? []) {
    const current = stats.get(sale.client_id) ?? { count: 0, total: 0 };
    current.count += 1;
    current.total += sale.sale_price - sale.discount;
    stats.set(sale.client_id, current);
  }

  const exportRows: ClientExportRow[] = (clients ?? [])
    .filter((client) => client.created_at.slice(0, 10) >= period.from && client.created_at.slice(0, 10) <= period.to)
    .map((client) => ({
      ...client,
      ...(stats.get(client.id) ?? { count: 0, total: 0 }),
    }));

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Historique d'achats calculé automatiquement."
        actions={
          <>
            <ClientExportButtons
              rows={exportRows}
              filename={`clients-${period.from}-au-${period.to}`}
              subtitle={`Période (date de création) : ${period.from} au ${period.to}`}
            />
            <CreateClientButton />
          </>
        }
      />

      <div className="mb-4">
        <p className="mb-1.5 text-xs font-semibold text-muted">
          Période d&apos;export (date de création du client) :
        </p>
        <PeriodFilter current={period.key as PeriodKey} />
      </div>

      {!clients || clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun client"
          description="Ajoutez votre premier client pour commencer."
          action={<CreateClientButton />}
        />
      ) : (
        <Table>
          <TableHead>
            <TableTh>Nom</TableTh>
            <TableTh>Téléphone</TableTh>
            <TableTh>Ville</TableTh>
            <TableTh>Achats</TableTh>
            <TableTh>Total dépensé</TableTh>
          </TableHead>
          <TableBody>
            {clients.map((client) => {
              const stat = stats.get(client.id) ?? { count: 0, total: 0 };
              return (
                <TableRow key={client.id}>
                  <TableCell className="font-semibold">
                    <Link href={`/clients/${client.id}`} className="hover:underline">
                      {client.first_name} {client.last_name}
                    </Link>
                  </TableCell>
                  <TableCell>{client.phone ?? "—"}</TableCell>
                  <TableCell>{client.city ?? "—"}</TableCell>
                  <TableCell className="tabular">{stat.count}</TableCell>
                  <TableCell className="tabular">{formatFCFA(stat.total)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

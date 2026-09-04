import Link from "next/link";
import { Truck } from "lucide-react";
import { requireOwner } from "@/lib/auth";
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
import { resolvePeriod, type PeriodKey } from "@/lib/period";
import { CreateSupplierButton } from "./create-supplier-button";
import {
  SupplierExportButtons,
  type SupplierExportRow,
} from "./supplier-export-buttons";

interface FournisseursPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function FournisseursPage({ searchParams }: FournisseursPageProps) {
  await requireOwner();
  const params = await searchParams;
  const period = resolvePeriod(params.period, params.from, params.to);
  const supabase = await createClient();

  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("id, name, city, phone, whatsapp, created_at")
    .order("name");

  const { data: phoneCounts } = await supabase.from("phones").select("supplier_id");

  const counts = new Map<string, number>();
  for (const row of phoneCounts ?? []) {
    if (!row.supplier_id) continue;
    counts.set(row.supplier_id, (counts.get(row.supplier_id) ?? 0) + 1);
  }

  const exportRows: SupplierExportRow[] = (suppliers ?? [])
    .filter(
      (supplier) =>
        supplier.created_at.slice(0, 10) >= period.from &&
        supplier.created_at.slice(0, 10) <= period.to,
    )
    .map((supplier) => ({
      name: supplier.name,
      phone: supplier.phone,
      whatsapp: supplier.whatsapp,
      city: supplier.city,
      count: counts.get(supplier.id) ?? 0,
    }));

  return (
    <div>
      <PageHeader
        title="Fournisseurs"
        description="Réservé au propriétaire."
        actions={
          <>
            <SupplierExportButtons
              rows={exportRows}
              filename={`fournisseurs-${period.from}-au-${period.to}`}
              subtitle={`Période (date de création) : ${period.from} au ${period.to}`}
            />
            <CreateSupplierButton />
          </>
        }
      />

      <div className="mb-4">
        <p className="mb-1.5 text-xs font-semibold text-muted">
          Période d&apos;export (date de création du fournisseur) :
        </p>
        <PeriodFilter current={period.key as PeriodKey} />
      </div>

      {!suppliers || suppliers.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Aucun fournisseur"
          description="Ajoutez votre premier fournisseur pour commencer."
          action={<CreateSupplierButton />}
        />
      ) : (
        <Table>
          <TableHead>
            <TableTh>Nom</TableTh>
            <TableTh>Ville</TableTh>
            <TableTh>Téléphone</TableTh>
            <TableTh>WhatsApp</TableTh>
            <TableTh>Téléphones fournis</TableTh>
          </TableHead>
          <TableBody>
            {suppliers.map((supplier) => (
              <TableRow key={supplier.id}>
                <TableCell className="font-semibold">
                  <Link href={`/fournisseurs/${supplier.id}`} className="hover:underline">
                    {supplier.name}
                  </Link>
                </TableCell>
                <TableCell>{supplier.city ?? "—"}</TableCell>
                <TableCell>{supplier.phone ?? "—"}</TableCell>
                <TableCell>{supplier.whatsapp ?? "—"}</TableCell>
                <TableCell className="tabular">
                  {counts.get(supplier.id) ?? 0}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { requireOwner } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Smartphone } from "lucide-react";
import { formatDate, formatFCFA } from "@/lib/utils";
import {
  PHONE_STATUS_LABELS,
  PHONE_STATUS_TONE,
} from "@/lib/constants";
import { EditSupplierButton } from "./edit-supplier-button";
import { DeleteSupplierButton } from "./delete-supplier-button";

export default async function SupplierDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOwner();
  const { id } = await params;
  const supabase = await createClient();

  const { data: supplier } = await supabase
    .from("suppliers")
    .select("*")
    .eq("id", id)
    .single();

  if (!supplier) notFound();

  const { data: phones } = await supabase
    .from("phones")
    .select("id, brand, model, imei, status, arrival_date, planned_sale_price")
    .eq("supplier_id", id)
    .order("arrival_date", { ascending: false });

  return (
    <div>
      <PageHeader
        title={supplier.name}
        description={supplier.city ?? undefined}
        actions={
          <>
            <EditSupplierButton supplier={supplier} />
            <DeleteSupplierButton
              supplierId={supplier.id}
              linkedPhonesCount={phones?.length ?? 0}
            />
          </>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase text-muted">Téléphone</p>
            <p className="mt-1 text-sm font-semibold">{supplier.phone ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase text-muted">WhatsApp</p>
            <p className="mt-1 text-sm font-semibold">{supplier.whatsapp ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs font-bold uppercase text-muted">Ville</p>
            <p className="mt-1 text-sm font-semibold">{supplier.city ?? "—"}</p>
          </CardContent>
        </Card>
      </div>

      {supplier.notes ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Observations</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted">{supplier.notes}</CardContent>
        </Card>
      ) : null}

      <h2 className="mb-3 font-display text-base font-bold">Téléphones fournis</h2>
      {!phones || phones.length === 0 ? (
        <EmptyState icon={Smartphone} title="Aucun téléphone fourni pour l'instant" />
      ) : (
        <Table>
          <TableHead>
            <TableTh>Téléphone</TableTh>
            <TableTh>IMEI</TableTh>
            <TableTh>Statut</TableTh>
            <TableTh>Arrivée</TableTh>
            <TableTh>Prix de vente</TableTh>
          </TableHead>
          <TableBody>
            {phones.map((phone) => (
              <TableRow key={phone.id}>
                <TableCell className="font-semibold">
                  <Link href={`/stock/${phone.id}`} className="hover:underline">
                    {phone.brand} {phone.model}
                  </Link>
                </TableCell>
                <TableCell>{phone.imei}</TableCell>
                <TableCell>
                  <Badge tone={PHONE_STATUS_TONE[phone.status]}>
                    {PHONE_STATUS_LABELS[phone.status]}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(phone.arrival_date)}</TableCell>
                <TableCell className="tabular">
                  {formatFCFA(phone.planned_sale_price)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

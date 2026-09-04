import Link from "next/link";
import { Smartphone } from "lucide-react";
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
import { formatDate, formatFCFA } from "@/lib/utils";
import {
  PHONE_CONDITION_LABELS,
  PHONE_STATUS_LABELS,
  PHONE_STATUS_TONE,
} from "@/lib/constants";
import { getPhones, type PhoneFilters } from "./queries";
import { FiltersBar } from "./filters-bar";
import { createClient } from "@/lib/supabase/server";
import { getVisibilityFlags } from "@/lib/permissions";
import { StockExportButtons } from "./stock-export-buttons";
import type { PhoneCondition, PhoneStatus } from "@/types";

interface StockPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function StockPage({ searchParams }: StockPageProps) {
  const profile = await requireProfile();
  const params = await searchParams;

  const filters: PhoneFilters = {
    brand: params.brand || undefined,
    condition: (params.condition as PhoneCondition) || undefined,
    status: (params.status as PhoneStatus) || undefined,
    storage: params.storage || undefined,
    ram: params.ram || undefined,
    color: params.color || undefined,
    priceMin: params.priceMin ? Number(params.priceMin) : undefined,
    priceMax: params.priceMax ? Number(params.priceMax) : undefined,
    arrivalFrom: params.arrivalFrom || undefined,
    arrivalTo: params.arrivalTo || undefined,
  };

  const phones = await getPhones(profile, filters);

  const supabase = await createClient();
  const { data: suppliers } = await supabase.from("suppliers").select("id, name");
  const supplierNameById = new Map((suppliers ?? []).map((s) => [s.id, s.name]));
  const { seePurchasePrice } = await getVisibilityFlags(profile);

  return (
    <div>
      <PageHeader
        title="Stock"
        description={`${phones.length} téléphone(s)`}
        actions={
          <>
            <StockExportButtons
              phones={phones}
              supplierNames={[...supplierNameById.entries()]}
              seePurchasePrice={seePurchasePrice}
            />
            <Link href="/stock/nouveau" className={buttonVariants({ size: "sm" })}>
              + Nouveau téléphone
            </Link>
          </>
        }
      />

      <FiltersBar filters={filters} />

      {phones.length === 0 ? (
        <EmptyState
          icon={Smartphone}
          title="Aucun téléphone ne correspond"
          description="Ajustez les filtres ou ajoutez un nouveau téléphone."
        />
      ) : (
        <Table>
          <TableHead>
            <TableTh>Téléphone</TableTh>
            <TableTh>IMEI</TableTh>
            <TableTh>État</TableTh>
            <TableTh>Statut</TableTh>
            <TableTh>Stockage</TableTh>
            <TableTh>RAM</TableTh>
            <TableTh>Couleur</TableTh>
            <TableTh>Prix de vente</TableTh>
            <TableTh>Arrivée</TableTh>
          </TableHead>
          <TableBody>
            {phones.map((phone) => (
              <TableRow key={phone.id}>
                <TableCell className="font-semibold">
                  <Link href={`/stock/${phone.id}`} className="flex items-center gap-2.5 hover:underline">
                    {phone.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={phone.photo_url}
                        alt=""
                        className="h-8 w-8 shrink-0 rounded object-cover"
                      />
                    ) : (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-raised">
                        <Smartphone className="h-4 w-4 text-muted" strokeWidth={1.5} />
                      </span>
                    )}
                    {phone.brand} {phone.model}
                  </Link>
                </TableCell>
                <TableCell>{phone.imei}</TableCell>
                <TableCell>{PHONE_CONDITION_LABELS[phone.condition]}</TableCell>
                <TableCell>
                  <Badge tone={PHONE_STATUS_TONE[phone.status]}>
                    {PHONE_STATUS_LABELS[phone.status]}
                  </Badge>
                </TableCell>
                <TableCell>{phone.storage}</TableCell>
                <TableCell>{phone.ram ?? "—"}</TableCell>
                <TableCell>{phone.color ?? "—"}</TableCell>
                <TableCell className="tabular">
                  {formatFCFA(phone.planned_sale_price)}
                </TableCell>
                <TableCell>{formatDate(phone.arrival_date)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

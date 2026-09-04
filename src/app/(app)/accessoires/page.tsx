import Link from "next/link";
import { Headphones } from "lucide-react";
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
import { formatFCFA } from "@/lib/utils";
import { ACCESSORY_CATEGORY_LABELS } from "@/lib/constants";
import { getVisibilityFlags } from "@/lib/permissions";
import { getAccessories, type AccessoryFilters } from "./queries";
import { AccessoryExportButtons } from "./accessory-export-buttons";
import type { AccessoryCategory } from "@/types";

interface AccessoiresPageProps {
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function AccessoiresPage({ searchParams }: AccessoiresPageProps) {
  const profile = await requireProfile();
  const params = await searchParams;

  const filters: AccessoryFilters = {
    category: (params.category as AccessoryCategory) || undefined,
    lowStockOnly: params.lowStockOnly === "1",
  };

  const accessories = await getAccessories(profile, filters);
  const { seePurchasePrice } = await getVisibilityFlags(profile);

  return (
    <div>
      <PageHeader
        title="Accessoires"
        description={`${accessories.length} référence(s)`}
        actions={
          <>
            <AccessoryExportButtons accessories={accessories} seePurchasePrice={seePurchasePrice} />
            <Link href="/accessoires/nouveau" className={buttonVariants({ size: "sm" })}>
              + Nouvel accessoire
            </Link>
          </>
        }
      />

      <form method="get" className="mb-4 flex flex-wrap items-center gap-2">
        <select
          name="category"
          defaultValue={filters.category ?? ""}
          className="h-9 rounded-md border border-border bg-surface px-2 text-xs"
        >
          <option value="">Toutes les catégories</option>
          {Object.entries(ACCESSORY_CATEGORY_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 text-xs font-semibold">
          <input
            type="checkbox"
            name="lowStockOnly"
            value="1"
            defaultChecked={filters.lowStockOnly}
          />
          Stock bas uniquement
        </label>
        <button
          type="submit"
          className="h-9 rounded-md border border-border bg-surface px-3 text-xs font-semibold hover:bg-surface-raised"
        >
          Filtrer
        </button>
        <Link href="/accessoires" className="text-xs font-semibold text-muted hover:text-foreground">
          Réinitialiser
        </Link>
      </form>

      {accessories.length === 0 ? (
        <EmptyState
          icon={Headphones}
          title="Aucun accessoire ne correspond"
          description="Ajustez les filtres ou ajoutez un nouvel accessoire."
        />
      ) : (
        <Table>
          <TableHead>
            <TableTh>Nom</TableTh>
            <TableTh>Catégorie</TableTh>
            <TableTh>Compatibilité</TableTh>
            <TableTh>Prix de vente</TableTh>
            <TableTh>Stock</TableTh>
          </TableHead>
          <TableBody>
            {accessories.map((accessory) => {
              const low = accessory.quantity_in_stock <= accessory.low_stock_threshold;
              return (
                <TableRow key={accessory.id}>
                  <TableCell className="font-semibold">
                    <Link
                      href={`/accessoires/${accessory.id}`}
                      className="flex items-center gap-2.5 hover:underline"
                    >
                      {accessory.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={accessory.photo_url}
                          alt=""
                          className="h-8 w-8 shrink-0 rounded object-cover"
                        />
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-surface-raised">
                          <Headphones className="h-4 w-4 text-muted" strokeWidth={1.5} />
                        </span>
                      )}
                      {accessory.name}
                    </Link>
                  </TableCell>
                  <TableCell>{ACCESSORY_CATEGORY_LABELS[accessory.category]}</TableCell>
                  <TableCell>{accessory.compatible_with ?? "—"}</TableCell>
                  <TableCell className="tabular">{formatFCFA(accessory.sale_price)}</TableCell>
                  <TableCell className="tabular">
                    <span className={low ? "font-bold text-warning" : ""}>
                      {accessory.quantity_in_stock}
                    </span>
                    {low ? (
                      <Badge tone="warning" className="ml-2">
                        Stock bas
                      </Badge>
                    ) : null}
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

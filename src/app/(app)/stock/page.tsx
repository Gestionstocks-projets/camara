import Link from "next/link";
import { Smartphone } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getPhones, type PhoneFilters } from "./queries";
import { groupPhones } from "./group-phones";
import { StockTable } from "./stock-table";
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
  const groups = groupPhones(phones);

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
        <StockTable groups={groups} />
      )}
    </div>
  );
}

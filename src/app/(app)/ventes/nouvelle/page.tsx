import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { listAccessoryOptions } from "../../accessoires/actions";
import { SaleForm } from "../sale-form";

interface NouvelleVentePageProps {
  searchParams: Promise<{ phone?: string }>;
}

export default async function NouvelleVentePage({
  searchParams,
}: NouvelleVentePageProps) {
  await requireProfile();
  const { phone } = await searchParams;
  const supabase = await createClient();

  const { data: phones } = await supabase
    .from("phones")
    .select("id, brand, model, imei, planned_sale_price")
    .eq("status", "en_stock")
    .order("brand");

  const { data: clients } = await supabase
    .from("clients")
    .select("id, first_name, last_name")
    .order("last_name");

  const accessories = await listAccessoryOptions();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Vendre"
        description="Téléphone, accessoires, ou les deux — une seule facture."
      />
      <SaleForm
        phones={phones ?? []}
        clients={clients ?? []}
        accessories={accessories.filter((a) => a.quantity_in_stock > 0)}
        preselectedPhoneId={phone}
      />
    </div>
  );
}

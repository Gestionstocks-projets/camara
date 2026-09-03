import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
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

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Vendre un téléphone" />
      <SaleForm
        phones={phones ?? []}
        clients={clients ?? []}
        preselectedPhoneId={phone}
      />
    </div>
  );
}

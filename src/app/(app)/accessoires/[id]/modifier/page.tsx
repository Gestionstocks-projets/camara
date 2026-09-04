import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { listSupplierOptions } from "../../../fournisseurs/actions";
import { getAccessoryById } from "../../queries";
import { AccessoryForm } from "../../accessory-form";
import { updateAccessory } from "../../actions";

export default async function ModifierAccessoirePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireProfile();
  const { id } = await params;
  const accessory = await getAccessoryById(profile, id);
  if (!accessory) notFound();

  const supplierOptions = await listSupplierOptions();
  const boundAction = updateAccessory.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={`Modifier ${accessory.name}`} />
      <AccessoryForm
        action={boundAction}
        accessory={accessory}
        supplierOptions={supplierOptions}
        isOwner={profile.role === "owner"}
        showPurchaseField={accessory.purchase_price !== undefined}
      />
    </div>
  );
}

import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { listSupplierOptions } from "../../fournisseurs/actions";
import { AccessoryForm } from "../accessory-form";
import { createAccessory } from "../actions";

export default async function NouvelAccessoirePage() {
  const profile = await requireProfile();
  const supplierOptions = await listSupplierOptions();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Ajouter un accessoire"
        description="Chargeur, écran, batterie, écouteurs, AirPods, coque, câble…"
      />
      <AccessoryForm
        action={createAccessory}
        supplierOptions={supplierOptions}
        isOwner={profile.role === "owner"}
      />
    </div>
  );
}

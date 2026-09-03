import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { listSupplierOptions } from "../../fournisseurs/actions";
import { PhoneForm } from "../phone-form";
import { createPhone } from "../actions";

export default async function NouveauTelephonePage() {
  const profile = await requireProfile();
  const supplierOptions = await listSupplierOptions();

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Ajouter un téléphone"
        description="Fiche complète : informations téléphone, achat et vente."
      />
      <PhoneForm
        action={createPhone}
        supplierOptions={supplierOptions}
        isOwner={profile.role === "owner"}
      />
    </div>
  );
}

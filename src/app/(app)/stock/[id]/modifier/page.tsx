import { notFound } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { PageHeader } from "@/components/ui/page-header";
import { listSupplierOptions } from "../../../fournisseurs/actions";
import { getPhoneById } from "../../queries";
import { PhoneForm } from "../../phone-form";
import { updatePhone } from "../../actions";

export default async function ModifierTelephonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireProfile();
  const { id } = await params;
  const phone = await getPhoneById(profile, id);
  if (!phone) notFound();

  const supplierOptions = await listSupplierOptions();
  const boundAction = updatePhone.bind(null, id);

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title={`Modifier ${phone.brand} ${phone.model}`} />
      <PhoneForm
        action={boundAction}
        phone={phone}
        supplierOptions={supplierOptions}
        isOwner={profile.role === "owner"}
        showPurchaseFields={phone.purchase_price !== undefined}
      />
    </div>
  );
}

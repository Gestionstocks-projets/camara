import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatDate, formatFCFA, cn } from "@/lib/utils";
import {
  PHONE_CONDITION_LABELS,
  PHONE_STATUS_LABELS,
  PHONE_STATUS_TONE,
} from "@/lib/constants";
import { getPhoneById } from "../queries";
import { ReserveToggleButton } from "./reserve-toggle-button";
import { DeletePhoneButton } from "./delete-phone-button";

export default async function PhoneDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireProfile();
  const { id } = await params;
  const phone = await getPhoneById(profile, id);
  if (!phone) notFound();

  const supabase = await createClient();
  const supplier = phone.supplier_id
    ? (await supabase.from("suppliers").select("id, name").eq("id", phone.supplier_id).single()).data
    : null;

  const hasPurchaseInfo = phone.purchase_price !== undefined;
  const profit = hasPurchaseInfo
    ? phone.planned_sale_price - (phone.purchase_price ?? 0) - (phone.extra_fees ?? 0)
    : null;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={`${phone.brand} ${phone.model}`}
        description={phone.imei}
        actions={
          <>
            <Link
              href={`/stock/${phone.id}/modifier`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Pencil className="h-4 w-4" /> Modifier
            </Link>
            {phone.status !== "vendu" ? (
              <>
                <ReserveToggleButton phoneId={phone.id} reserved={phone.status === "reserve"} />
                {phone.status === "en_stock" ? (
                  <Link
                    href={`/ventes/nouvelle?phone=${phone.id}`}
                    className={buttonVariants({ variant: "brass", size: "sm" })}
                  >
                    Vendre
                  </Link>
                ) : null}
                <DeletePhoneButton phoneId={phone.id} />
              </>
            ) : null}
          </>
        }
      />

      <div className="mb-4 flex items-center gap-2">
        <Badge tone={PHONE_STATUS_TONE[phone.status]}>{PHONE_STATUS_LABELS[phone.status]}</Badge>
        <Badge tone="neutral">{PHONE_CONDITION_LABELS[phone.condition]}</Badge>
      </div>

      <Card className="mb-4">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          <Field label="RAM" value={phone.ram ?? "—"} />
          <Field label="Stockage" value={phone.storage} />
          <Field label="Couleur" value={phone.color ?? "—"} />
          <Field label="Adresse mail" value={phone.email ?? "—"} />
          <Field label="Fournisseur" value={supplier?.name ?? "—"} />
          <Field label="Date d'arrivée" value={formatDate(phone.arrival_date)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          {hasPurchaseInfo ? (
            <>
              <Field label="Prix d'achat" value={formatFCFA(phone.purchase_price ?? 0)} />
              <Field label="Frais supplémentaires" value={formatFCFA(phone.extra_fees ?? 0)} />
            </>
          ) : null}
          <Field label="Prix de vente" value={formatFCFA(phone.planned_sale_price)} />
          {profit !== null ? (
            <Field
              label="Bénéfice prévu"
              value={formatFCFA(profit)}
              valueClassName="text-brass"
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted">{label}</p>
      <p className={cn("tabular mt-1 text-sm font-semibold", valueClassName)}>{value}</p>
    </div>
  );
}

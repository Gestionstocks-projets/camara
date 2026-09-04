import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatFCFA, cn } from "@/lib/utils";
import { ACCESSORY_CATEGORY_LABELS } from "@/lib/constants";
import { getAccessoryById } from "../queries";
import { DeleteAccessoryButton } from "./delete-accessory-button";

export default async function AccessoryDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const profile = await requireProfile();
  const { id } = await params;
  const accessory = await getAccessoryById(profile, id);
  if (!accessory) notFound();

  const supabase = await createClient();
  const supplier = accessory.supplier_id
    ? (await supabase.from("suppliers").select("id, name").eq("id", accessory.supplier_id).single()).data
    : null;

  const hasPurchaseInfo = accessory.purchase_price !== undefined;
  const low = accessory.quantity_in_stock <= accessory.low_stock_threshold;

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title={accessory.name}
        description={ACCESSORY_CATEGORY_LABELS[accessory.category]}
        actions={
          <>
            <Link
              href={`/accessoires/${accessory.id}/modifier`}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              <Pencil className="h-4 w-4" /> Modifier
            </Link>
            <DeleteAccessoryButton accessoryId={accessory.id} />
          </>
        }
      />

      {accessory.photo_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={accessory.photo_url}
          alt={accessory.name}
          className="mb-4 h-56 w-full rounded-lg border border-border object-cover"
        />
      ) : null}

      {low ? (
        <div className="mb-4">
          <Badge tone="warning">Stock bas — {accessory.quantity_in_stock} restant(s)</Badge>
        </div>
      ) : null}

      <Card className="mb-4">
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          <Field label="Compatibilité" value={accessory.compatible_with ?? "—"} />
          <Field label="Fournisseur" value={supplier?.name ?? "—"} />
          <Field label="Quantité en stock" value={String(accessory.quantity_in_stock)} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-5 sm:grid-cols-3">
          {hasPurchaseInfo ? (
            <Field label="Prix d'achat" value={formatFCFA(accessory.purchase_price ?? 0)} />
          ) : null}
          <Field label="Prix de vente" value={formatFCFA(accessory.sale_price)} />
          {hasPurchaseInfo ? (
            <Field
              label="Marge unitaire"
              value={formatFCFA(accessory.sale_price - (accessory.purchase_price ?? 0))}
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

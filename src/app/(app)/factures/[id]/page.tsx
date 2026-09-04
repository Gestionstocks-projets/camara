import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getInvoiceData } from "../data";
import { InvoiceActions } from "../invoice-actions";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireProfile();
  const { id } = await params;
  const data = await getInvoiceData(id);

  const supabase = await createClient();
  const { data: invoiceRow } = await supabase
    .from("invoices")
    .select("sale_id")
    .eq("id", id)
    .single();
  const { data: sale } = invoiceRow
    ? await supabase.from("sales").select("client_id").eq("id", invoiceRow.sale_id).single()
    : { data: null };
  const { data: client } = sale
    ? await supabase.from("clients").select("whatsapp").eq("id", sale.client_id).single()
    : { data: null };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex justify-end">
        <InvoiceActions data={data} clientWhatsapp={client?.whatsapp ?? null} />
      </div>

      <div className="rounded-lg border border-border bg-surface p-8 print:border-0 print:p-0 print:shadow-none">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="font-display text-lg font-bold">{data.shop.name}</h1>
            {data.shop.phone ? <p className="text-sm text-muted">{data.shop.phone}</p> : null}
            {data.shop.whatsapp ? (
              <p className="text-sm text-muted">WhatsApp : {data.shop.whatsapp}</p>
            ) : null}
            {data.shop.email ? <p className="text-sm text-muted">{data.shop.email}</p> : null}
            {data.shop.address ? <p className="text-sm text-muted">{data.shop.address}</p> : null}
          </div>
          <div className="text-right">
            <p className="font-display text-xl font-bold">{data.invoice.number}</p>
            <p className="text-sm text-muted">{data.invoice.date}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-xs font-bold uppercase text-muted">Client</p>
            <p className="text-sm font-semibold">{data.client.fullName}</p>
            {data.client.phone ? <p className="text-sm text-muted">{data.client.phone}</p> : null}
            {data.client.email ? <p className="text-sm text-muted">{data.client.email}</p> : null}
          </div>
          {data.phone ? (
            <div>
              <p className="mb-1 text-xs font-bold uppercase text-muted">Téléphone</p>
              <p className="text-sm font-semibold">
                {data.phone.brand} {data.phone.model} — {data.phone.condition}
              </p>
              <p className="text-sm text-muted">IMEI : {data.phone.imei}</p>
              <p className="text-sm text-muted">
                {[data.phone.ram, data.phone.storage, data.phone.color].filter(Boolean).join(" · ")}
              </p>
            </div>
          ) : null}
        </div>

        <div className="border-t border-border pt-4">
          {data.phone ? <Row label="Téléphone" value={data.phone.priceLabel} /> : null}
          {data.accessoryLines.map((line, index) => (
            <Row
              key={index}
              label={`${line.name} × ${line.quantity}`}
              value={line.lineTotalLabel}
            />
          ))}
          <Row label="Remise" value={data.sale.discountLabel} />
          <div className="mt-2 flex items-center justify-between border-t border-foreground pt-3">
            <span className="font-display text-base font-bold">Total</span>
            <span className="tabular font-display text-base font-bold text-brass">
              {data.sale.totalLabel}
            </span>
          </div>
        </div>

        <div className="mt-6 grid gap-1 text-sm">
          <Row label="Mode de paiement" value={data.sale.paymentMethodLabel} />
          <Row label="Statut" value={data.sale.paymentStatusLabel} />
          {data.sale.amountDue > 0 ? (
            <Row label="Reste à payer" value={data.sale.amountDueLabel} />
          ) : null}
          {data.sale.warranty ? <Row label="Garantie" value={data.sale.warranty} /> : null}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1 text-sm">
      <span className="text-muted">{label}</span>
      <span className="tabular font-semibold">{value}</span>
    </div>
  );
}

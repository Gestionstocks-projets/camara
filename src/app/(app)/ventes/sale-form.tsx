"use client";

import { useActionState, useMemo, useState } from "react";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFCFA } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { ClientQuickCreateModal } from "../clients/client-quick-create-modal";
import { createSale, type SaleFormState } from "./actions";
import type { PaymentMethod } from "@/types";

interface PhoneOption {
  id: string;
  brand: string;
  model: string;
  imei: string;
  planned_sale_price: number;
}

interface ClientOption {
  id: string;
  first_name: string;
  last_name: string;
}

export function SaleForm({
  phones,
  clients,
  preselectedPhoneId,
}: {
  phones: PhoneOption[];
  clients: ClientOption[];
  preselectedPhoneId?: string;
}) {
  const [state, formAction, pending] = useActionState<SaleFormState, FormData>(
    createSale,
    {},
  );

  const [phoneId, setPhoneId] = useState(preselectedPhoneId ?? "");
  const [clientOptions, setClientOptions] = useState(clients);
  const [clientId, setClientId] = useState("");
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const selectedPhone = phones.find((phone) => phone.id === phoneId);

  const [salePrice, setSalePrice] = useState(
    selectedPhone ? String(selectedPhone.planned_sale_price) : "",
  );
  const [discount, setDiscount] = useState("0");
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentMethod, setPaymentMethod] = useState("");
  const [warranty, setWarranty] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<"paye" | "partiel" | "en_attente">(
    "paye",
  );
  const [amountPaid, setAmountPaid] = useState("0");

  const total = useMemo(() => {
    const price = Number(salePrice) || 0;
    const disc = Number(discount) || 0;
    return Math.max(price - disc, 0);
  }, [salePrice, discount]);

  const due = useMemo(() => {
    if (paymentStatus === "paye") return 0;
    if (paymentStatus === "en_attente") return total;
    return Math.max(total - (Number(amountPaid) || 0), 0);
  }, [paymentStatus, total, amountPaid]);

  function handlePhoneChange(id: string) {
    setPhoneId(id);
    const phone = phones.find((p) => p.id === id);
    if (phone) setSalePrice(String(phone.planned_sale_price));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="phone_id" value={phoneId} />
      <input type="hidden" name="client_id" value={clientId} />

      <Card>
        <CardHeader>
          <CardTitle>Téléphone</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Téléphone"
            required
            value={phoneId}
            onChange={(event) => handlePhoneChange(event.target.value)}
            disabled={!!preselectedPhoneId}
          >
            <option value="" disabled>
              Choisir un téléphone en stock…
            </option>
            {phones.map((phone) => (
              <option key={phone.id} value={phone.id}>
                {phone.brand} {phone.model} · {phone.imei}
              </option>
            ))}
          </Select>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold">Prix de vente prévu</span>
            <p className="tabular flex h-10 items-center rounded-md border border-border bg-surface-raised px-3 text-sm font-semibold">
              {selectedPhone ? formatFCFA(selectedPhone.planned_sale_price) : "—"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Client</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Client"
                required
                value={clientId}
                onChange={(event) => setClientId(event.target.value)}
              >
                <option value="" disabled>
                  Choisir un client…
                </option>
                {clientOptions.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.first_name} {client.last_name}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="button" variant="outline" onClick={() => setQuickCreateOpen(true)}>
              Nouveau client
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Détails de la vente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Date de vente"
            name="sale_date"
            type="date"
            required
            value={saleDate}
            onChange={(event) => setSaleDate(event.target.value)}
          />
          <Input
            label="Prix de vente"
            name="sale_price"
            type="number"
            min={0}
            required
            value={salePrice}
            onChange={(event) => setSalePrice(event.target.value)}
          />
          <Input
            label="Remise accordée"
            name="discount"
            type="number"
            min={0}
            value={discount}
            onChange={(event) => setDiscount(event.target.value)}
          />
          <Select
            label="Mode de paiement"
            name="payment_method"
            required
            value={paymentMethod}
            onChange={(event) => setPaymentMethod(event.target.value)}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
              <option key={value} value={value as PaymentMethod}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            label="Garantie accordée"
            name="warranty"
            placeholder="Ex. 3 mois"
            value={warranty}
            onChange={(event) => setWarranty(event.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Paiement</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-md bg-surface-raised p-3">
            <span className="text-sm font-semibold">Total à payer</span>
            <span className="tabular font-display text-lg font-bold">{formatFCFA(total)}</span>
          </div>

          <Select
            label="Statut de paiement"
            name="payment_status"
            required
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(event.target.value as typeof paymentStatus)
            }
          >
            <option value="paye">Payé</option>
            <option value="partiel">Partiel</option>
            <option value="en_attente">En attente</option>
          </Select>

          {paymentStatus === "partiel" ? (
            <Input
              label="Montant payé"
              name="amount_paid"
              type="number"
              min={0}
              max={total}
              value={amountPaid}
              onChange={(event) => setAmountPaid(event.target.value)}
            />
          ) : (
            <input type="hidden" name="amount_paid" value={paymentStatus === "paye" ? total : 0} />
          )}

          <div
            className={`flex items-center justify-between rounded-md p-3 text-sm font-semibold ${
              due > 0 ? "bg-danger-soft text-danger" : "bg-success-soft text-success"
            }`}
          >
            <span>Reste à payer</span>
            <span className="tabular">{formatFCFA(due)}</span>
          </div>
        </CardContent>
      </Card>

      {state.error ? (
        <p className="text-sm font-medium text-danger">{state.error}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending || !phoneId || !clientId} className="self-start">
        {pending ? "Enregistrement…" : "Valider la vente"}
      </Button>

      <ClientQuickCreateModal
        open={quickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        onCreated={(client) => {
          setClientOptions((current) => [...current, client]);
          setClientId(client.id);
        }}
      />
    </form>
  );
}

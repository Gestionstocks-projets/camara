"use client";

import { useActionState, useMemo, useState } from "react";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFCFA } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS, ACCESSORY_CATEGORY_LABELS } from "@/lib/constants";
import { ClientQuickCreateModal } from "../clients/client-quick-create-modal";
import { CartItemRow, type CartLine } from "./cart-item-row";
import { createSale, type SaleFormState } from "./actions";
import type { PaymentMethod, AccessoryCategory } from "@/types";

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

interface AccessoryOption {
  id: string;
  name: string;
  category: AccessoryCategory;
  sale_price: number;
  quantity_in_stock: number;
}

export function SaleForm({
  phones,
  clients,
  accessories,
  preselectedPhoneId,
}: {
  phones: PhoneOption[];
  clients: ClientOption[];
  accessories: AccessoryOption[];
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
  const [accessoryToAdd, setAccessoryToAdd] = useState("");
  const [cart, setCart] = useState<CartLine[]>([]);

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

  const cartSubtotal = useMemo(
    () => cart.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0),
    [cart],
  );

  const total = useMemo(() => {
    const price = phoneId ? Number(salePrice) || 0 : 0;
    const disc = Number(discount) || 0;
    return Math.max(price + cartSubtotal - disc, 0);
  }, [phoneId, salePrice, cartSubtotal, discount]);

  const due = useMemo(() => {
    if (paymentStatus === "paye") return 0;
    if (paymentStatus === "en_attente") return total;
    return Math.max(total - (Number(amountPaid) || 0), 0);
  }, [paymentStatus, total, amountPaid]);

  function handlePhoneChange(id: string) {
    setPhoneId(id);
    const phone = phones.find((p) => p.id === id);
    if (phone) setSalePrice(String(phone.planned_sale_price));
    else setSalePrice("");
  }

  function addAccessory() {
    if (!accessoryToAdd) return;
    const accessory = accessories.find((a) => a.id === accessoryToAdd);
    if (!accessory) return;

    setCart((current) => {
      const existing = current.find((line) => line.accessoryId === accessory.id);
      if (existing) {
        if (existing.quantity >= accessory.quantity_in_stock) return current;
        return current.map((line) =>
          line.accessoryId === accessory.id
            ? { ...line, quantity: line.quantity + 1 }
            : line,
        );
      }
      return [
        ...current,
        {
          accessoryId: accessory.id,
          name: accessory.name,
          quantity: 1,
          unitPrice: accessory.sale_price,
          maxQuantity: accessory.quantity_in_stock,
        },
      ];
    });
    setAccessoryToAdd("");
  }

  const cartPayload = JSON.stringify(
    cart.map((line) => ({
      accessory_id: line.accessoryId,
      quantity: line.quantity,
      unit_price: line.unitPrice,
    })),
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="phone_id" value={phoneId} />
      <input type="hidden" name="client_id" value={clientId} />
      <input type="hidden" name="sale_price" value={phoneId ? salePrice || "0" : "0"} />
      <input type="hidden" name="cart" value={cartPayload} />

      <Card>
        <CardHeader>
          <CardTitle>Téléphone (optionnel)</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Select
            label="Téléphone"
            value={phoneId}
            onChange={(event) => handlePhoneChange(event.target.value)}
            disabled={!!preselectedPhoneId}
          >
            <option value="">Aucun (accessoires seuls)</option>
            {phones.map((phone) => (
              <option key={phone.id} value={phone.id}>
                {phone.brand} {phone.model} · {phone.imei}
              </option>
            ))}
          </Select>
          <Input
            label="Prix de vente du téléphone"
            type="number"
            min={0}
            disabled={!phoneId}
            value={salePrice}
            onChange={(event) => setSalePrice(event.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Accessoires</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Ajouter un accessoire"
                value={accessoryToAdd}
                onChange={(event) => setAccessoryToAdd(event.target.value)}
              >
                <option value="">Choisir…</option>
                {accessories.map((accessory) => (
                  <option
                    key={accessory.id}
                    value={accessory.id}
                    disabled={accessory.quantity_in_stock === 0}
                  >
                    {accessory.name} ({ACCESSORY_CATEGORY_LABELS[accessory.category]}) —{" "}
                    {accessory.quantity_in_stock} en stock
                  </option>
                ))}
              </Select>
            </div>
            <Button type="button" variant="outline" onClick={addAccessory}>
              Ajouter
            </Button>
          </div>

          {cart.length > 0 ? (
            <div className="flex flex-col gap-2">
              {cart.map((line) => (
                <CartItemRow
                  key={line.accessoryId}
                  line={line}
                  onChangeQuantity={(quantity) =>
                    setCart((current) =>
                      current.map((l) =>
                        l.accessoryId === line.accessoryId
                          ? { ...l, quantity: Math.min(quantity, l.maxQuantity) }
                          : l,
                      ),
                    )
                  }
                  onChangePrice={(price) =>
                    setCart((current) =>
                      current.map((l) =>
                        l.accessoryId === line.accessoryId ? { ...l, unitPrice: price } : l,
                      ),
                    )
                  }
                  onRemove={() =>
                    setCart((current) => current.filter((l) => l.accessoryId !== line.accessoryId))
                  }
                />
              ))}
              <div className="flex items-center justify-between border-t border-border pt-2 text-sm font-semibold">
                <span>Sous-total accessoires</span>
                <span className="tabular">{formatFCFA(cartSubtotal)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted">Aucun accessoire ajouté.</p>
          )}
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
            label="Remise accordée (sur le total)"
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

      <Button
        type="submit"
        size="lg"
        disabled={pending || !clientId || (!phoneId && cart.length === 0)}
        className="self-start"
      >
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

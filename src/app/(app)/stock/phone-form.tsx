"use client";

import { useActionState, useMemo, useState } from "react";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatFCFA } from "@/lib/utils";
import { COMMON_BRANDS, RAM_OPTIONS, STORAGE_OPTIONS } from "@/lib/constants";
import { SupplierQuickCreateModal } from "../fournisseurs/supplier-quick-create-modal";
import type { PhoneFormState } from "./actions";
import type { PhoneMasked } from "@/types";

interface SupplierOption {
  id: string;
  name: string;
}

/**
 * Tous les champs texte/select sont volontairement contrôlés (useState),
 * jamais en `defaultValue` seul : après un échec de soumission (IMEI en
 * double, champ manquant…), React 19 réinitialise les champs non
 * contrôlés d'un `<form action>` — l'utilisateur perdait sa saisie et
 * devait tout retaper (retour utilisateur du 2026-09-04). Un champ
 * contrôlé garde sa valeur quoi qu'il arrive à l'action.
 */
export function PhoneForm({
  action,
  phone,
  supplierOptions,
  isOwner,
  showPurchaseFields = true,
}: {
  action: (state: PhoneFormState, formData: FormData) => Promise<PhoneFormState>;
  phone?: PhoneMasked;
  supplierOptions: SupplierOption[];
  isOwner: boolean;
  /** false pour un gérant sans droit sur le prix d'achat (prompt 12) —
   * masque prix d'achat/frais/bénéfice y compris en modification, pour ne
   * jamais les révéler via le formulaire d'édition. */
  showPurchaseFields?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [options, setOptions] = useState(supplierOptions);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const [brand, setBrand] = useState(phone?.brand ?? "");
  const [model, setModel] = useState(phone?.model ?? "");
  const [imei, setImei] = useState(phone?.imei ?? "");
  const [condition, setCondition] = useState(phone?.condition ?? "");
  const [ram, setRam] = useState(phone?.ram ?? "");
  const [storage, setStorage] = useState(phone?.storage ?? "");
  const [color, setColor] = useState(phone?.color ?? "");
  const [email, setEmail] = useState(phone?.email ?? "");
  const [selectedSupplier, setSelectedSupplier] = useState(phone?.supplier_id ?? "");
  const [arrivalDate, setArrivalDate] = useState(
    phone?.arrival_date ?? new Date().toISOString().slice(0, 10),
  );

  const [purchasePrice, setPurchasePrice] = useState(
    phone?.purchase_price?.toString() ?? "",
  );
  const [extraFees, setExtraFees] = useState(phone?.extra_fees?.toString() ?? "0");
  const [salePrice, setSalePrice] = useState(
    phone?.planned_sale_price?.toString() ?? "",
  );

  const profit = useMemo(() => {
    const p = Number(purchasePrice) || 0;
    const f = Number(extraFees) || 0;
    const s = Number(salePrice) || 0;
    return s - p - f;
  }, [purchasePrice, extraFees, salePrice]);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations téléphone</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Marque"
            name="brand"
            required
            list="brand-options"
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
          />
          <datalist id="brand-options">
            {COMMON_BRANDS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
          <Input
            label="Modèle / Série"
            name="model"
            required
            value={model}
            onChange={(event) => setModel(event.target.value)}
          />
          <Input
            label="IMEI"
            name="imei"
            required
            value={imei}
            onChange={(event) => setImei(event.target.value)}
            error={state.error?.startsWith("Cet IMEI") ? state.error : undefined}
          />
          <Select
            label="État"
            name="condition"
            required
            value={condition}
            onChange={(event) => setCondition(event.target.value)}
          >
            <option value="" disabled>
              Choisir…
            </option>
            <option value="neuf">Neuf</option>
            <option value="quasi_neuf">Quasi neuf</option>
          </Select>
          <Select label="RAM" name="ram" value={ram} onChange={(event) => setRam(event.target.value)}>
            <option value="">—</option>
            {RAM_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Select
            label="Stockage"
            name="storage"
            required
            value={storage}
            onChange={(event) => setStorage(event.target.value)}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {STORAGE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </Select>
          <Input
            label="Couleur"
            name="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
          />
          <Input
            label="Adresse mail"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations d&apos;achat</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="supplier_id" className="text-sm font-semibold">
                Fournisseur
              </label>
              {isOwner ? (
                <button
                  type="button"
                  onClick={() => setQuickCreateOpen(true)}
                  className="text-xs font-semibold text-accent hover:underline"
                >
                  + Créer un fournisseur
                </button>
              ) : null}
            </div>
            <select
              id="supplier_id"
              name="supplier_id"
              value={selectedSupplier}
              onChange={(event) => setSelectedSupplier(event.target.value)}
              className="h-10 w-full rounded-md border border-border bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option value="">—</option>
              {options.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Date d'arrivée"
            name="arrival_date"
            type="date"
            required
            value={arrivalDate}
            onChange={(event) => setArrivalDate(event.target.value)}
          />
          {showPurchaseFields ? (
            <>
              <Input
                label="Prix d'achat"
                name="purchase_price"
                type="number"
                min={0}
                required
                value={purchasePrice}
                onChange={(event) => setPurchasePrice(event.target.value)}
              />
              <Input
                label="Frais supplémentaires"
                name="extra_fees"
                type="number"
                min={0}
                value={extraFees}
                onChange={(event) => setExtraFees(event.target.value)}
              />
            </>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informations de vente</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Prix de vente"
            name="planned_sale_price"
            type="number"
            min={0}
            required
            value={salePrice}
            onChange={(event) => setSalePrice(event.target.value)}
          />
          {showPurchaseFields ? (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-semibold">Bénéfice calculé automatiquement</span>
              <p className="tabular flex h-10 items-center rounded-md border border-border bg-surface-raised px-3 text-sm font-bold text-brass">
                {formatFCFA(profit)}
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {state.error && !state.error.startsWith("Cet IMEI") ? (
        <p className="text-sm font-medium text-danger">{state.error}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? "Enregistrement…" : "ENREGISTRER LE TÉLÉPHONE"}
      </Button>

      {isOwner ? (
        <SupplierQuickCreateModal
          open={quickCreateOpen}
          onClose={() => setQuickCreateOpen(false)}
          onCreated={(supplier) => {
            setOptions((current) =>
              [...current, supplier].sort((a, b) => a.name.localeCompare(b.name)),
            );
            setSelectedSupplier(supplier.id);
          }}
        />
      ) : null}
    </form>
  );
}

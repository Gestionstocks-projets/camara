"use client";

import { useActionState, useState } from "react";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ACCESSORY_CATEGORY_LABELS } from "@/lib/constants";
import { PhotoUpload } from "../stock/photo-upload";
import { SupplierQuickCreateModal } from "../fournisseurs/supplier-quick-create-modal";
import type { AccessoryFormState } from "./actions";
import type { AccessoryMasked } from "@/types";

interface SupplierOption {
  id: string;
  name: string;
}

export function AccessoryForm({
  action,
  accessory,
  supplierOptions,
  isOwner,
  showPurchaseField = true,
}: {
  action: (state: AccessoryFormState, formData: FormData) => Promise<AccessoryFormState>;
  accessory?: AccessoryMasked;
  supplierOptions: SupplierOption[];
  isOwner: boolean;
  showPurchaseField?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [options, setOptions] = useState(supplierOptions);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const [name, setName] = useState(accessory?.name ?? "");
  const [category, setCategory] = useState(accessory?.category ?? "");
  const [compatibleWith, setCompatibleWith] = useState(accessory?.compatible_with ?? "");
  const [selectedSupplier, setSelectedSupplier] = useState(accessory?.supplier_id ?? "");
  const [photoUrl, setPhotoUrl] = useState(accessory?.photo_url ?? "");
  const [purchasePrice, setPurchasePrice] = useState(
    accessory?.purchase_price?.toString() ?? "0",
  );
  const [salePrice, setSalePrice] = useState(accessory?.sale_price?.toString() ?? "");
  const [quantity, setQuantity] = useState(accessory?.quantity_in_stock?.toString() ?? "0");
  const [threshold, setThreshold] = useState(
    accessory?.low_stock_threshold?.toString() ?? "3",
  );

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Informations accessoire</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <PhotoUpload value={photoUrl} onChange={setPhotoUrl} />
            <input type="hidden" name="photo_url" value={photoUrl} />
          </div>
          <Input
            label="Nom"
            name="name"
            required
            placeholder="Ex. Chargeur USB-C 20W"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <Select
            label="Catégorie"
            name="category"
            required
            value={category}
            onChange={(event) => setCategory(event.target.value as typeof category)}
          >
            <option value="" disabled>
              Choisir…
            </option>
            {Object.entries(ACCESSORY_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </Select>
          <Input
            label="Compatibilité"
            name="compatible_with"
            placeholder="Ex. iPhone 13"
            className="sm:col-span-2"
            value={compatibleWith}
            onChange={(event) => setCompatibleWith(event.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Achat &amp; stock</CardTitle>
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
          {showPurchaseField ? (
            <Input
              label="Prix d'achat (unitaire)"
              name="purchase_price"
              type="number"
              min={0}
              required
              value={purchasePrice}
              onChange={(event) => setPurchasePrice(event.target.value)}
            />
          ) : null}
          <Input
            label="Prix de vente (unitaire)"
            name="sale_price"
            type="number"
            min={0}
            required
            value={salePrice}
            onChange={(event) => setSalePrice(event.target.value)}
          />
          <Input
            label="Quantité en stock"
            name="quantity_in_stock"
            type="number"
            min={0}
            required
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
          <Input
            label="Seuil d'alerte stock bas"
            name="low_stock_threshold"
            type="number"
            min={0}
            hint="Une alerte apparaît sur le Dashboard sous ce seuil."
            value={threshold}
            onChange={(event) => setThreshold(event.target.value)}
          />
        </CardContent>
      </Card>

      {state.error ? (
        <p className="text-sm font-medium text-danger">{state.error}</p>
      ) : null}

      <Button type="submit" size="lg" disabled={pending} className="self-start">
        {pending ? "Enregistrement…" : "ENREGISTRER L'ACCESSOIRE"}
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

"use client";

import { useActionState } from "react";
import { Input, Select } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { PAYMENT_METHOD_LABELS } from "@/lib/constants";
import { recordPayment } from "../actions";

export function RecordPaymentForm({ saleId }: { saleId: string }) {
  const boundAction = recordPayment.bind(null, saleId);
  const [state, formAction, pending] = useActionState(boundAction, {});

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <Input label="Montant" name="amount" type="number" min={0} required className="w-32" />
      <Select label="Mode" name="method" required defaultValue="">
        <option value="" disabled>
          Choisir…
        </option>
        {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer le paiement"}
      </Button>
      {state.error ? <p className="w-full text-sm font-medium text-danger">{state.error}</p> : null}
    </form>
  );
}

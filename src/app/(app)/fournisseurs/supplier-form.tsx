"use client";

import { useActionState } from "react";
import { Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Supplier } from "@/types";
import type { SupplierFormState } from "./actions";

export function SupplierForm({
  action,
  supplier,
}: {
  action: (state: SupplierFormState, formData: FormData) => Promise<SupplierFormState>;
  supplier?: Supplier;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Nom"
        name="name"
        required
        defaultValue={supplier?.name}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Téléphone" name="phone" defaultValue={supplier?.phone ?? ""} />
        <Input
          label="WhatsApp"
          name="whatsapp"
          defaultValue={supplier?.whatsapp ?? ""}
        />
      </div>
      <Input label="Ville" name="city" defaultValue={supplier?.city ?? ""} />
      <Textarea
        label="Observations"
        name="notes"
        defaultValue={supplier?.notes ?? ""}
      />
      {state.error ? (
        <p className="text-sm font-medium text-danger">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}

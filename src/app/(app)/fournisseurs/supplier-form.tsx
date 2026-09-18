"use client";

import { useActionState, useEffect, useState } from "react";
import { Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Supplier } from "@/types";
import type { SupplierFormState } from "./actions";

export function SupplierForm({
  action,
  supplier,
  onSuccess,
}: {
  action: (state: SupplierFormState, formData: FormData) => Promise<SupplierFormState>;
  supplier?: Supplier;
  /** Cf. ClientForm — ferme la modale de modification après succès. */
  onSuccess?: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  useEffect(() => {
    if (state.success) onSuccess?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);
  const [name, setName] = useState(supplier?.name ?? "");
  const [phone, setPhone] = useState(supplier?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(supplier?.whatsapp ?? "");
  const [city, setCity] = useState(supplier?.city ?? "");
  const [notes, setNotes] = useState(supplier?.notes ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <Input
        label="Nom"
        name="name"
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Téléphone"
          name="phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        <Input
          label="WhatsApp"
          name="whatsapp"
          value={whatsapp}
          onChange={(event) => setWhatsapp(event.target.value)}
        />
      </div>
      <Input
        label="Ville"
        name="city"
        value={city}
        onChange={(event) => setCity(event.target.value)}
      />
      <Textarea
        label="Observations"
        name="notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
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

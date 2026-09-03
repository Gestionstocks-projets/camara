"use client";

import { useActionState } from "react";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import type { Client } from "@/types";
import type { ClientFormState } from "./actions";

export function ClientForm({
  action,
  client,
}: {
  action: (state: ClientFormState, formData: FormData) => Promise<ClientFormState>;
  client?: Client;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Prénom" name="first_name" required defaultValue={client?.first_name} />
        <Input label="Nom" name="last_name" required defaultValue={client?.last_name} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Téléphone" name="phone" defaultValue={client?.phone ?? ""} />
        <Input label="WhatsApp" name="whatsapp" defaultValue={client?.whatsapp ?? ""} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Email" name="email" type="email" defaultValue={client?.email ?? ""} />
        <Input label="Ville" name="city" defaultValue={client?.city ?? ""} />
      </div>
      {state.error ? (
        <p className="text-sm font-medium text-danger">{state.error}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}

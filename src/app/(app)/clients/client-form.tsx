"use client";

import { useActionState, useState } from "react";
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
  const [firstName, setFirstName] = useState(client?.first_name ?? "");
  const [lastName, setLastName] = useState(client?.last_name ?? "");
  const [phone, setPhone] = useState(client?.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(client?.whatsapp ?? "");
  const [email, setEmail] = useState(client?.email ?? "");
  const [city, setCity] = useState(client?.city ?? "");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Prénom"
          name="first_name"
          required
          value={firstName}
          onChange={(event) => setFirstName(event.target.value)}
        />
        <Input
          label="Nom"
          name="last_name"
          required
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
        />
      </div>
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Email"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Ville"
          name="city"
          value={city}
          onChange={(event) => setCity(event.target.value)}
        />
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

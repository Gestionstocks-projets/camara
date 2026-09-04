"use client";

import { useActionState, useEffect, useState } from "react";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { createClientQuick, type QuickCreateState } from "./actions";
import type { Client } from "@/types";

interface ClientQuickCreateModalProps {
  open: boolean;
  onClose: () => void;
  /** Appelé avec le client fraîchement créé — utilisé par le flux de
   * vente (prompt 08) pour le sélectionner immédiatement sans quitter l'écran. */
  onCreated: (client: Pick<Client, "id" | "first_name" | "last_name">) => void;
}

const initialState: QuickCreateState = {};

export function ClientQuickCreateModal({
  open,
  onClose,
  onCreated,
}: ClientQuickCreateModalProps) {
  const [state, formAction, pending] = useActionState(
    createClientQuick,
    initialState,
  );
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (state.client) {
      onCreated(state.client);
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.client]);

  return (
    <Modal open={open} onClose={onClose} title="Nouveau client">
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
        <Input
          label="Téléphone"
          name="phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        {state.error ? (
          <p className="text-sm font-medium text-danger">{state.error}</p>
        ) : null}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Création…" : "Créer le client"}
        </Button>
      </form>
    </Modal>
  );
}

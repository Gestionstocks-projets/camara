"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ClientForm } from "../client-form";
import { updateClientRecord, type ClientFormState } from "../actions";
import type { Client } from "@/types";

export function EditClientButton({ client }: { client: Client }) {
  const [open, setOpen] = useState(false);
  const boundAction = (state: ClientFormState, formData: FormData) =>
    updateClientRecord(client.id, state, formData);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" /> Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier le client">
        <ClientForm action={boundAction} client={client} />
      </Modal>
    </>
  );
}

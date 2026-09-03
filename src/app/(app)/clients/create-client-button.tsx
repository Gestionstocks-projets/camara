"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { ClientForm } from "./client-form";
import { createClientRecord } from "./actions";

export function CreateClientButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Nouveau client
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau client">
        <ClientForm action={createClientRecord} />
      </Modal>
    </>
  );
}

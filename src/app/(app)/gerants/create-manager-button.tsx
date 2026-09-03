"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/field";
import { createManager } from "./actions";

export function CreateManagerButton() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createManager, {});

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Nouveau gérant
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nouveau gérant">
        <form action={formAction} className="flex flex-col gap-4">
          <Input label="Nom complet" name="full_name" required />
          <Input label="Email" name="email" type="email" required />
          <Input label="Téléphone" name="phone" />
          <Input
            label="Mot de passe temporaire"
            name="password"
            type="text"
            required
            hint="À communiquer au gérant — il pourra le changer plus tard."
          />
          {state.error ? (
            <p className="text-sm font-medium text-danger">{state.error}</p>
          ) : null}
          <Button type="submit" disabled={pending} className="self-start">
            {pending ? "Création…" : "Créer le compte"}
          </Button>
        </form>
      </Modal>
    </>
  );
}

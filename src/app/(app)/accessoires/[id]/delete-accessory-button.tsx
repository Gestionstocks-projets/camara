"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { deleteAccessory } from "../actions";

export function DeleteAccessoryButton({ accessoryId }: { accessoryId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" /> Supprimer
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Supprimer cet accessoire ?">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Cette action est irréversible. Impossible si cet accessoire a déjà été vendu.
          </p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deleteAccessory(accessoryId);
                  if (result?.error) toast.error(result.error);
                })
              }
            >
              {pending ? "Suppression…" : "Confirmer la suppression"}
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { deletePhone } from "../actions";

export function DeletePhoneButton({ phoneId }: { phoneId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <>
      <Button variant="danger" size="sm" onClick={() => setOpen(true)}>
        <Trash2 className="h-4 w-4" /> Supprimer
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Supprimer ce téléphone ?">
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Cette action est irréversible. Un téléphone déjà vendu ne peut pas
            être supprimé.
          </p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await deletePhone(phoneId);
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

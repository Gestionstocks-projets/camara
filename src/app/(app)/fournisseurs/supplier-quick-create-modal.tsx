"use client";

import { useActionState, useEffect } from "react";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { createSupplierQuick, type QuickSupplierState } from "./actions";

interface SupplierQuickCreateModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (supplier: { id: string; name: string }) => void;
}

const initialState: QuickSupplierState = {};

export function SupplierQuickCreateModal({
  open,
  onClose,
  onCreated,
}: SupplierQuickCreateModalProps) {
  const [state, formAction, pending] = useActionState(
    createSupplierQuick,
    initialState,
  );

  useEffect(() => {
    if (state.supplier) {
      onCreated(state.supplier);
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.supplier]);

  return (
    <Modal open={open} onClose={onClose} title="Nouveau fournisseur">
      <form action={formAction} className="flex flex-col gap-4">
        <Input label="Nom" name="name" required />
        <Input label="Téléphone" name="phone" />
        {state.error ? (
          <p className="text-sm font-medium text-danger">{state.error}</p>
        ) : null}
        <Button type="submit" disabled={pending} className="self-start">
          {pending ? "Création…" : "Créer le fournisseur"}
        </Button>
      </form>
    </Modal>
  );
}

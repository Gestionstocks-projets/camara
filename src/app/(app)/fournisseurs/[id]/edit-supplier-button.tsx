"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SupplierForm } from "../supplier-form";
import { updateSupplier, type SupplierFormState } from "../actions";
import type { Supplier } from "@/types";

export function EditSupplierButton({ supplier }: { supplier: Supplier }) {
  const [open, setOpen] = useState(false);
  const boundAction = (state: SupplierFormState, formData: FormData) =>
    updateSupplier(supplier.id, state, formData);

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" /> Modifier
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Modifier le fournisseur">
        <SupplierForm action={boundAction} supplier={supplier} />
      </Modal>
    </>
  );
}

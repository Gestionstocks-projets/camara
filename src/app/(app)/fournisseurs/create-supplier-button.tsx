"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { SupplierForm } from "./supplier-form";
import { createSupplier } from "./actions";

export function CreateSupplierButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Nouveau fournisseur
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Nouveau fournisseur"
      >
        <SupplierForm action={createSupplier} />
      </Modal>
    </>
  );
}

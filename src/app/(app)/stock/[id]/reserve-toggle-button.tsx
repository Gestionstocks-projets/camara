"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { setPhoneReserved } from "../actions";

export function ReserveToggleButton({
  phoneId,
  reserved,
}: {
  phoneId: string;
  reserved: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setPhoneReserved(phoneId, !reserved);
          if (result?.error) toast.error(result.error);
          else toast.success(reserved ? "Réservation annulée." : "Téléphone réservé.");
        })
      }
    >
      {reserved ? "Annuler la réservation" : "Marquer réservé"}
    </Button>
  );
}

"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { setManagerDisabled } from "./actions";

export function ToggleManagerButton({
  managerId,
  disabled,
}: {
  managerId: string;
  disabled: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  return (
    <Button
      variant={disabled ? "outline" : "danger"}
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await setManagerDisabled(managerId, !disabled);
          if (result?.error) toast.error(result.error);
          else toast.success(disabled ? "Compte réactivé." : "Compte désactivé.");
        })
      }
    >
      {disabled ? "Réactiver" : "Désactiver"}
    </Button>
  );
}

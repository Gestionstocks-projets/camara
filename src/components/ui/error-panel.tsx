"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ErrorPanel({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-danger/40 px-6 py-14 text-center">
      <AlertTriangle className="h-8 w-8 text-danger" strokeWidth={1.5} />
      <div>
        <p className="font-display text-sm font-bold">Une erreur est survenue</p>
        <p className="mt-1 text-sm text-muted">
          Réessayez, ou contactez le propriétaire si le problème persiste.
        </p>
      </div>
      <Button variant="outline" size="sm" onClick={reset}>
        Réessayer
      </Button>
    </div>
  );
}

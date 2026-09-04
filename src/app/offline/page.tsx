import { WifiOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <WifiOff className="h-10 w-10 text-muted" strokeWidth={1.5} />
      <div>
        <h1 className="font-display text-lg font-bold">Pas de connexion</h1>
        <p className="mt-1 max-w-sm text-sm text-muted">
          Cette application a besoin d&apos;internet pour fonctionner (stock,
          ventes et factures sont stockés en ligne). Reconnectez-vous puis
          réessayez.
        </p>
      </div>
      <a href="/dashboard" className={buttonVariants({ size: "sm" })}>
        Réessayer
      </a>
    </div>
  );
}

import Link from "next/link";
import { SearchX } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <SearchX className="h-10 w-10 text-muted" strokeWidth={1.5} />
      <div>
        <h1 className="font-display text-lg font-bold">Page introuvable</h1>
        <p className="mt-1 text-sm text-muted">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
      </div>
      <Link href="/dashboard" className={buttonVariants({ size: "sm" })}>
        Retour au dashboard
      </Link>
    </div>
  );
}

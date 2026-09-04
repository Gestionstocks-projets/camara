"use client";

import { useActionState, useState } from "react";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export function LoginForm({
  shopName,
  logoUrl,
}: {
  shopName: string;
  logoUrl: string | null;
}) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [email, setEmail] = useState("");

  return (
    <div className="w-full max-w-sm rounded-lg border border-border bg-surface p-8">
      <div className="mb-6 flex flex-col items-center gap-2 text-center">
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logoUrl}
            alt={shopName}
            className="h-11 w-11 rounded-lg border border-border object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Store className="h-5 w-5" />
          </div>
        )}
        <h1 className="font-display text-lg font-bold">{shopName}</h1>
        <p className="text-sm text-muted">Connectez-vous à votre espace de gestion.</p>
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Mot de passe"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
        {state.error ? (
          <p className="text-sm font-medium text-danger">{state.error}</p>
        ) : null}
        <Button type="submit" size="lg" disabled={pending} className="mt-2">
          {pending ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </div>
  );
}

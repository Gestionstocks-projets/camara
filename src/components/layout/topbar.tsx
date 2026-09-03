"use client";

import { Menu, LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";
import { GlobalSearch } from "./global-search";
import type { Profile } from "@/types";

const ROLE_LABELS: Record<Profile["role"], string> = {
  owner: "Propriétaire",
  manager: "Gérant",
};

export function Topbar({
  profile,
  onOpenMobile,
}: {
  profile: Profile;
  onOpenMobile: () => void;
}) {
  return (
    <header className="no-print flex h-16 shrink-0 items-center gap-3 border-b border-border bg-surface px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenMobile}
        className="rounded-md p-2 text-muted hover:bg-surface-raised hover:text-foreground md:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <GlobalSearch />

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-semibold leading-tight">{profile.full_name}</p>
          <p className="text-xs text-muted leading-tight">{ROLE_LABELS[profile.role]}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-md p-2 text-sm text-muted hover:bg-surface-raised hover:text-foreground"
            aria-label="Se déconnecter"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </form>
      </div>
    </header>
  );
}

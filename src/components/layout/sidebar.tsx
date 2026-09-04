"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Store, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import type { UserRole } from "@/types";

interface SidebarProps {
  role: UserRole;
  shopName: string;
  shopLogoUrl: string | null;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({
  role,
  shopName,
  shopLogoUrl,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const items = NAV_ITEMS.filter((item) => !item.ownerOnly || role === "owner");

  return (
    <>
      {mobileOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={onCloseMobile}
        />
      ) : null}
      <aside
        className={cn(
          "no-print fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground transition-transform md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between gap-2 px-5 py-5">
          <div className="flex items-center gap-2">
            {shopLogoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={shopLogoUrl}
                alt={shopName}
                className="h-8 w-8 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10">
                <Store className="h-4 w-4" />
              </div>
            )}
            <span className="font-display text-sm font-bold">{shopName}</span>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1 text-sidebar-muted hover:text-white md:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href) &&
                item.href !== "/stock/nouveau");
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-semibold text-sidebar-muted transition-colors hover:text-white",
                  active && "bg-sidebar-active text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

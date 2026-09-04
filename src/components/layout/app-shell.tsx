"use client";

import { useState, type ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import type { Profile } from "@/types";

export function AppShell({
  profile,
  shopName,
  shopLogoUrl,
  children,
}: {
  profile: Profile;
  shopName: string;
  shopLogoUrl: string | null;
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        role={profile.role}
        shopName={shopName}
        shopLogoUrl={shopLogoUrl}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-h-screen flex-1 flex-col md:pl-0">
        <Topbar profile={profile} onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1 bg-background p-4 sm:p-6">{children}</main>
      </div>
      <InstallPrompt />
    </div>
  );
}

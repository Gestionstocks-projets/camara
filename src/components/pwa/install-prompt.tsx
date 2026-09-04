"use client";

import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISSED_KEY = "pwa-install-dismissed";

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return localStorage.getItem(DISMISSED_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    function handler(event: Event) {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!deferredPrompt || dismissed) return null;

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  function handleDismiss() {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      // stockage indisponible : le bandeau réapparaîtra à la prochaine visite
    }
  }

  return (
    <div className="no-print fixed bottom-4 left-4 right-4 z-50 flex items-center gap-3 rounded-lg border border-border bg-surface p-3 shadow-lg sm:left-auto sm:right-4 sm:w-80">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
        <Download className="h-4 w-4" />
      </div>
      <div className="flex-1 text-sm">
        <p className="font-semibold">Installer l&apos;application</p>
        <p className="text-xs text-muted">Accès rapide depuis l&apos;écran d&apos;accueil.</p>
      </div>
      <Button size="sm" onClick={handleInstall}>
        Installer
      </Button>
      <button
        type="button"
        onClick={handleDismiss}
        aria-label="Fermer"
        className="text-muted hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

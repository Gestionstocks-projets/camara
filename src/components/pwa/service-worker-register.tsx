"use client";

import { useEffect } from "react";

export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Échec silencieux : l'app fonctionne normalement sans le SW,
        // simplement sans mise en cache ni page hors-ligne.
      });
    });
  }, []);

  return null;
}

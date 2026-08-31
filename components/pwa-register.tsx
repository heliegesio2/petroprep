"use client";

import { useEffect } from "react";

/**
 * Registra o service worker em produção. Em dev, remove qualquer SW antigo
 * para não servir bundle velho durante o desenvolvimento.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => regs.forEach((r) => r.unregister()))
        .catch(() => {});
      return;
    }

    const registrar = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    };

    if (document.readyState === "complete") {
      registrar();
    } else {
      window.addEventListener("load", registrar, { once: true });
      return () => window.removeEventListener("load", registrar);
    }
  }, []);

  return null;
}

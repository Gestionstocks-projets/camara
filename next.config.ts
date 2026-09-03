import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Défaut 1 Mo trop bas pour l'upload du logo boutique (Paramètres, prompt 12).
    serverActions: {
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;

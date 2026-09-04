import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("shop_name, shop_logo_url")
    .single();

  const shopName = settings?.shop_name ?? "Ma Boutique";
  const logoUrl = settings?.shop_logo_url;

  const icons: MetadataRoute.Manifest["icons"] = logoUrl
    ? [
        { src: logoUrl, sizes: "192x192", type: "image/png", purpose: "any" },
        { src: logoUrl, sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/api/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "maskable" },
        { src: "/api/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ]
    : [
        { src: "/api/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/api/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/api/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "maskable" },
        { src: "/api/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ];

  return {
    name: `${shopName} — Gestion`,
    short_name: shopName,
    description:
      "Gestion de stock, ventes, clients et factures pour boutique de téléphones.",
    start_url: "/dashboard",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#F6F3EC",
    theme_color: "#2E2A6E",
    lang: "fr",
    icons,
    shortcuts: [
      {
        name: "Ajouter un téléphone",
        url: "/stock/nouveau",
      },
      {
        name: "Nouvelle vente",
        url: "/ventes/nouvelle",
      },
      {
        name: "Dashboard",
        url: "/dashboard",
      },
    ],
  };
}

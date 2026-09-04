import type { Metadata, Viewport } from "next";
import { Unbounded, Manrope } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { ServiceWorkerRegister } from "@/components/pwa/service-worker-register";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin"],
  weight: ["700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Ma Boutique — Gestion",
  description:
    "Gestion de stock, ventes, clients et factures pour boutique de téléphones.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ma Boutique",
  },
};

export const viewport: Viewport = {
  themeColor: "#2E2A6E",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${unbounded.variable} ${manrope.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ToastProvider>{children}</ToastProvider>
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

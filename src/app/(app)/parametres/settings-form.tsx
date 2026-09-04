"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateSettings, uploadShopLogo } from "./actions";
import type { Settings } from "@/types";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [state, formAction, pending] = useActionState(updateSettings, {});
  const [logoState, logoAction, logoPending] = useActionState(uploadShopLogo, {});
  const [seePurchasePrice, setSeePurchasePrice] = useState(
    settings.managers_see_purchase_price,
  );
  const [seeProfit, setSeeProfit] = useState(settings.managers_see_profit);
  const logoUrl = logoState.url ?? settings.shop_logo_url;

  const [shopName, setShopName] = useState(settings.shop_name);
  const [shopPhone, setShopPhone] = useState(settings.shop_phone ?? "");
  const [shopWhatsapp, setShopWhatsapp] = useState(settings.shop_whatsapp ?? "");
  const [shopEmail, setShopEmail] = useState(settings.shop_email ?? "");
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoice_prefix);
  const [shopAddress, setShopAddress] = useState(settings.shop_address ?? "");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Logo de la boutique</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          {logoUrl ? (
            <Image
              src={logoUrl}
              alt="Logo de la boutique"
              width={56}
              height={56}
              className="h-14 w-14 rounded-md border border-border object-cover"
              unoptimized
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-md border border-dashed border-border text-xs text-muted">
              Aucun
            </div>
          )}
          <form action={logoAction} className="flex items-center gap-2">
            <input
              type="file"
              name="logo"
              accept="image/*"
              className="text-xs"
              required
            />
            <Button type="submit" size="sm" variant="outline" disabled={logoPending}>
              {logoPending ? "Envoi…" : "Téléverser"}
            </Button>
          </form>
        </CardContent>
        {logoState.error ? (
          <p className="px-6 pb-4 text-sm font-medium text-danger">{logoState.error}</p>
        ) : null}
      </Card>

      <form action={formAction} className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informations boutique</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nom de la boutique"
              name="shop_name"
              required
              value={shopName}
              onChange={(event) => setShopName(event.target.value)}
              className="sm:col-span-2"
            />
            <Input
              label="Téléphone"
              name="shop_phone"
              value={shopPhone}
              onChange={(event) => setShopPhone(event.target.value)}
            />
            <Input
              label="WhatsApp"
              name="shop_whatsapp"
              value={shopWhatsapp}
              onChange={(event) => setShopWhatsapp(event.target.value)}
            />
            <Input
              label="Email"
              name="shop_email"
              type="email"
              value={shopEmail}
              onChange={(event) => setShopEmail(event.target.value)}
            />
            <Input
              label="Préfixe de facture"
              name="invoice_prefix"
              value={invoicePrefix}
              onChange={(event) => setInvoicePrefix(event.target.value)}
              hint="N'affecte que les futures factures."
            />
            <Input
              label="Adresse"
              name="shop_address"
              value={shopAddress}
              onChange={(event) => setShopAddress(event.target.value)}
              className="sm:col-span-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Permissions des gérants</CardTitle>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            <Switch
              label="Les gérants voient le prix d'achat"
              description="Prix d'achat et frais supplémentaires sur Stock, Ventes et exports."
              checked={seePurchasePrice}
              onChange={setSeePurchasePrice}
            />
            <input
              type="hidden"
              name="managers_see_purchase_price"
              value={seePurchasePrice ? "on" : "off"}
            />
            <Switch
              label="Les gérants voient le bénéfice"
              description="Bénéfice sur Stock, Ventes, Dashboard et exports."
              checked={seeProfit}
              onChange={setSeeProfit}
            />
            <input
              type="hidden"
              name="managers_see_profit"
              value={seeProfit ? "on" : "off"}
            />
          </CardContent>
        </Card>

        {state.error ? (
          <p className="text-sm font-medium text-danger">{state.error}</p>
        ) : null}
        <Button type="submit" size="lg" disabled={pending} className="self-start">
          {pending ? "Enregistrement…" : "Enregistrer les paramètres"}
        </Button>
      </form>
    </div>
  );
}

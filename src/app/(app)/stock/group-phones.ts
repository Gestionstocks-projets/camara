import type { PhoneMasked } from "@/types";

/**
 * Un lot d'unités identiques (même marque/modèle/état/stockage/RAM/
 * couleur/statut) — l'enregistrement par lot (prompt 15) crée souvent
 * plusieurs lignes `phones` d'un coup ; les regrouper évite une liste qui
 * répète la même fiche N fois pour N IMEI.
 */
export interface PhoneGroup {
  key: string;
  brand: string;
  model: string;
  condition: PhoneMasked["condition"];
  status: PhoneMasked["status"];
  storage: string;
  ram: string | null;
  color: string | null;
  photo_url: string | null;
  units: PhoneMasked[];
}

export function groupPhones(phones: PhoneMasked[]): PhoneGroup[] {
  const groups = new Map<string, PhoneGroup>();

  for (const phone of phones) {
    const key = [
      phone.brand,
      phone.model,
      phone.condition,
      phone.status,
      phone.storage,
      phone.ram ?? "",
      phone.color ?? "",
    ]
      .join("|")
      .toLowerCase();

    const existing = groups.get(key);
    if (existing) {
      existing.units.push(phone);
      if (!existing.photo_url && phone.photo_url) existing.photo_url = phone.photo_url;
      continue;
    }

    groups.set(key, {
      key,
      brand: phone.brand,
      model: phone.model,
      condition: phone.condition,
      status: phone.status,
      storage: phone.storage,
      ram: phone.ram,
      color: phone.color,
      photo_url: phone.photo_url,
      units: [phone],
    });
  }

  return [...groups.values()];
}

export function priceRangeLabel(
  units: PhoneMasked[],
  format: (amount: number) => string,
): string {
  const prices = [...new Set(units.map((unit) => unit.planned_sale_price))];
  const [first] = prices;
  if (first === undefined) return "—";
  if (prices.length === 1) return format(first);
  return `${format(Math.min(...prices))} – ${format(Math.max(...prices))}`;
}

export function arrivalRangeLabel(
  units: PhoneMasked[],
  format: (date: string) => string,
): string {
  const dates = [...new Set(units.map((unit) => unit.arrival_date))].sort();
  const first = dates[0];
  const last = dates[dates.length - 1];
  if (first === undefined || last === undefined) return "—";
  if (dates.length === 1) return format(first);
  return `${format(first)} – ${format(last)}`;
}

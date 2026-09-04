import { createClient } from "@/lib/supabase/server";
import type { PhoneCondition } from "@/types";

export interface SearchResult {
  id: string;
  title: string;
  subtitle?: string;
  href: string;
}

export interface SearchResults {
  phones: SearchResult[];
  accessories: SearchResult[];
  clients: SearchResult[];
  suppliers: SearchResult[];
  invoices: SearchResult[];
}

const CONDITION_MATCHES: Array<{ value: PhoneCondition; labels: string[] }> = [
  { value: "neuf", labels: ["neuf"] },
  { value: "quasi_neuf", labels: ["quasi neuf", "quasi-neuf", "quasi_neuf"] },
];

function matchingCondition(query: string): PhoneCondition | null {
  const normalized = query.trim().toLowerCase();
  for (const entry of CONDITION_MATCHES) {
    if (entry.labels.some((label) => label.startsWith(normalized) || normalized.startsWith(label))) {
      return entry.value;
    }
  }
  return null;
}

export async function globalSearch(
  query: string,
  isOwner: boolean,
): Promise<SearchResults> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return { phones: [], accessories: [], clients: [], suppliers: [], invoices: [] };
  }

  const supabase = await createClient();
  const like = `%${trimmed}%`;
  const condition = matchingCondition(trimmed);

  const phoneOrParts = [
    `brand.ilike.${like}`,
    `model.ilike.${like}`,
    `imei.ilike.${like}`,
    `ram.ilike.${like}`,
    `storage.ilike.${like}`,
    `color.ilike.${like}`,
    `email.ilike.${like}`,
  ];
  if (condition) phoneOrParts.push(`condition.eq.${condition}`);

  const [phonesRes, accessoriesRes, clientsRes, suppliersRes, invoicesRes] = await Promise.all([
    supabase
      .from("phones")
      .select("id, brand, model, imei")
      .or(phoneOrParts.join(","))
      .limit(5),
    supabase
      .from("accessories")
      .select("id, name, compatible_with")
      .or(`name.ilike.${like},compatible_with.ilike.${like}`)
      .limit(5),
    supabase
      .from("clients")
      .select("id, first_name, last_name, phone")
      .or(`first_name.ilike.${like},last_name.ilike.${like},phone.ilike.${like}`)
      .limit(5),
    isOwner
      ? supabase.from("suppliers").select("id, name").ilike("name", like).limit(5)
      : Promise.resolve({ data: [] as { id: string; name: string }[] }),
    supabase.from("invoices").select("id, number").ilike("number", like).limit(5),
  ]);

  return {
    phones: (phonesRes.data ?? []).map((phone) => ({
      id: phone.id,
      title: `${phone.brand} ${phone.model}`,
      subtitle: phone.imei,
      href: `/stock/${phone.id}`,
    })),
    accessories: (accessoriesRes.data ?? []).map((accessory) => ({
      id: accessory.id,
      title: accessory.name,
      subtitle: accessory.compatible_with ?? undefined,
      href: `/accessoires/${accessory.id}`,
    })),
    clients: (clientsRes.data ?? []).map((client) => ({
      id: client.id,
      title: `${client.first_name} ${client.last_name}`,
      subtitle: client.phone ?? undefined,
      href: `/clients/${client.id}`,
    })),
    suppliers: (suppliersRes.data ?? []).map((supplier) => ({
      id: supplier.id,
      title: supplier.name,
      href: `/fournisseurs/${supplier.id}`,
    })),
    invoices: (invoicesRes.data ?? []).map((invoice) => ({
      id: invoice.id,
      title: invoice.number,
      href: `/factures/${invoice.id}`,
    })),
  };
}

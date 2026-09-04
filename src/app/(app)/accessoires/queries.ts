import { createClient } from "@/lib/supabase/server";
import { getVisibilityFlags } from "@/lib/permissions";
import type { Profile, AccessoryCategory, AccessoryMasked } from "@/types";

export interface AccessoryFilters {
  category?: AccessoryCategory;
  lowStockOnly?: boolean;
}

const ACCESSORY_COLUMNS =
  "id, name, category, compatible_with, supplier_id, purchase_price, sale_price, quantity_in_stock, low_stock_threshold, photo_url, created_by, created_at, updated_at";

function maskAccessory(
  accessory: AccessoryMasked,
  seePurchasePrice: boolean,
): AccessoryMasked {
  if (seePurchasePrice) return accessory;
  const masked: AccessoryMasked = { ...accessory };
  delete masked.purchase_price;
  return masked;
}

export async function getAccessories(profile: Profile, filters: AccessoryFilters) {
  const supabase = await createClient();
  const { seePurchasePrice } = await getVisibilityFlags(profile);

  let query = supabase.from("accessories").select(ACCESSORY_COLUMNS).order("name");

  if (filters.category) query = query.eq("category", filters.category);

  const { data } = await query;
  let rows = (data ?? []).map((row) => maskAccessory(row, seePurchasePrice));

  if (filters.lowStockOnly) {
    rows = rows.filter((row) => row.quantity_in_stock <= row.low_stock_threshold);
  }

  return rows;
}

export async function getAccessoryById(profile: Profile, id: string) {
  const supabase = await createClient();
  const { seePurchasePrice } = await getVisibilityFlags(profile);

  const { data } = await supabase.from("accessories").select(ACCESSORY_COLUMNS).eq("id", id).single();
  if (!data) return null;
  return maskAccessory(data, seePurchasePrice);
}

import { createClient } from "@/lib/supabase/server";
import { getVisibilityFlags } from "@/lib/permissions";
import type { Profile, PhoneCondition, PhoneStatus, PhoneMasked } from "@/types";

export interface PhoneFilters {
  brand?: string;
  condition?: PhoneCondition;
  status?: PhoneStatus;
  storage?: string;
  ram?: string;
  color?: string;
  priceMin?: number;
  priceMax?: number;
  arrivalFrom?: string;
  arrivalTo?: string;
}

const PHONE_COLUMNS =
  "id, brand, model, imei, condition, ram, storage, color, email, photo_url, status, supplier_id, arrival_date, purchase_price, extra_fees, planned_sale_price, created_by, created_at, updated_at";

function maskPhone(
  phone: PhoneMasked,
  seePurchasePrice: boolean,
): PhoneMasked {
  if (seePurchasePrice) return phone;
  const masked: PhoneMasked = { ...phone };
  delete masked.purchase_price;
  delete masked.extra_fees;
  return masked;
}

export async function getPhones(profile: Profile, filters: PhoneFilters) {
  const supabase = await createClient();
  const { seePurchasePrice } = await getVisibilityFlags(profile);

  let query = supabase.from("phones").select(PHONE_COLUMNS).order("arrival_date", {
    ascending: false,
  });

  if (filters.brand) query = query.ilike("brand", `%${filters.brand}%`);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.status) query = query.eq("status", filters.status);
  if (filters.storage) query = query.eq("storage", filters.storage);
  if (filters.ram) query = query.eq("ram", filters.ram);
  if (filters.color) query = query.ilike("color", `%${filters.color}%`);
  if (filters.priceMin !== undefined)
    query = query.gte("planned_sale_price", filters.priceMin);
  if (filters.priceMax !== undefined)
    query = query.lte("planned_sale_price", filters.priceMax);
  if (filters.arrivalFrom) query = query.gte("arrival_date", filters.arrivalFrom);
  if (filters.arrivalTo) query = query.lte("arrival_date", filters.arrivalTo);

  const { data } = await query;
  return (data ?? []).map((phone) => maskPhone(phone, seePurchasePrice));
}

export async function getPhoneById(profile: Profile, id: string) {
  const supabase = await createClient();
  const { seePurchasePrice } = await getVisibilityFlags(profile);

  const { data } = await supabase
    .from("phones")
    .select(PHONE_COLUMNS)
    .eq("id", id)
    .single();

  if (!data) return null;
  return maskPhone(data, seePurchasePrice);
}

import { createClient } from "@/lib/supabase/server";
import { getVisibilityFlags } from "@/lib/permissions";
import type { Profile } from "@/types";
import type { PhoneVariantWithDetails, PhoneUnitWithHistory } from "@/types/inventory";

export async function getVariantsWithStock(
  profile: Profile,
  filters?: {
    brand?: string;
    model?: string;
    condition?: "neuf" | "quasi_neuf";
    storage?: string;
  },
): Promise<PhoneVariantWithDetails[]> {
  const supabase = await createClient();
  const { seePurchasePrice } = await getVisibilityFlags(profile);

  let query = supabase
    .from("phone_variants")
    .select(
      `
      *,
      phone_models (
        id, model_name, photo_url,
        phone_brands (id, name)
      ),
      variant_pricing (*),
      variant_metrics (*),
      phone_units (id, status, imei, acquired_at)
    `,
    )
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (filters?.brand) {
    query = query.ilike("phone_models.phone_brands.name", `%${filters.brand}%`);
  }
  if (filters?.model) {
    query = query.ilike("phone_models.model_name", `%${filters.model}%`);
  }
  if (filters?.condition) {
    query = query.eq("condition", filters.condition);
  }
  if (filters?.storage) {
    query = query.eq("storage", filters.storage);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching variants:", error);
    return [];
  }

  return (data || []).map((variant: any) => ({
    ...variant,
    // Mask pricing si pas le droit
    variant_pricing: seePurchasePrice
      ? variant.variant_pricing
      : variant.variant_pricing
        ? {
            ...variant.variant_pricing,
            base_cost: undefined,
            total_acquisition_cost: undefined,
          }
        : undefined,
  }));
}

export async function getVariantById(
  profile: Profile,
  variantId: string,
): Promise<PhoneVariantWithDetails | null> {
  const supabase = await createClient();
  const { seePurchasePrice } = await getVisibilityFlags(profile);

  const { data, error } = await supabase
    .from("phone_variants")
    .select(
      `
      *,
      phone_models (
        id, model_name, photo_url,
        phone_brands (id, name)
      ),
      variant_pricing (*),
      variant_metrics (*),
      phone_units (
        id, imei, serial_number, status, quality_check,
        acquired_at, acquisition_cost, sold_at, sale_id
      )
    `,
    )
    .eq("id", variantId)
    .eq("is_active", true)
    .single();

  if (error || !data) {
    console.error("Error fetching variant:", error);
    return null;
  }

  return {
    ...data,
    variant_pricing: seePurchasePrice
      ? data.variant_pricing
      : data.variant_pricing
        ? {
            ...data.variant_pricing,
            base_cost: undefined,
            total_acquisition_cost: undefined,
          }
        : undefined,
  };
}

/**
 * Get unités spécifiques d'une variante
 * Utilisé pour traçabilité IMEI
 */
export async function getUnitsByVariant(
  profile: Profile,
  variantId: string,
  filters?: {
    status?: "in_stock" | "reserved" | "sold" | "damaged";
  },
): Promise<PhoneUnitWithHistory[]> {
  const supabase = await createClient();

  let query = supabase
    .from("phone_units")
    .select(
      `
      *,
      quality_checks (*),
      phone_variants (id, sku)
    `,
    )
    .eq("variant_id", variantId)
    .order("acquired_at", { ascending: true });

  if (filters?.status) {
    query = query.eq("status", filters.status);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching units:", error);
    return [];
  }

  return data || [];
}

/**
 * Get historique complet d'une unité
 * Pour audit trail
 */
export async function getUnitHistory(unitId: string): Promise<any[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory_event_logs")
    .select("*")
    .eq("entity_id", unitId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching unit history:", error);
    return [];
  }

  return data || [];
}

/**
 * Récupère toutes les alertes stock non résolues
 */
export async function getActiveAlerts() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("inventory_alerts")
    .select(
      `
      *,
      phone_variants (
        id, sku, quantity_in_stock,
        phone_models (model_name)
      )
    `,
    )
    .is("resolved_at", null)
    .order("severity", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }

  return data || [];
}

/**
 * Récupère stock summary par marque
 */
export async function getStockByBrand() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("phone_variants")
    .select(
      `
      phone_models (
        phone_brands (name)
      ),
      quantity_in_stock,
      phone_units (id)
    `,
    )
    .eq("is_active", true);

  if (error) {
    console.error("Error fetching stock by brand:", error);
    return {};
  }

  const summary: Record<string, { quantity: number; variants: number }> = {};

  (data || []).forEach((variant: any) => {
    const brand = variant.phone_models?.phone_brands?.name || "Unknown";
    if (!summary[brand]) {
      summary[brand] = { quantity: 0, variants: 0 };
    }
    summary[brand].quantity += variant.quantity_in_stock || 0;
    summary[brand].variants += 1;
  });

  return summary;
}

/**
 * Récupère métriques de performance inventaire
 */
export async function getInventoryMetrics() {
  const supabase = await createClient();

  // Total units
  const { count: totalUnits } = await supabase
    .from("phone_units")
    .select("*", { count: "exact" })
    .eq("status", "in_stock");

  // Reserved
  const { count: reserved } = await supabase
    .from("phone_units")
    .select("*", { count: "exact" })
    .eq("status", "reserved");

  // Variants
  const { count: totalVariants } = await supabase
    .from("phone_variants")
    .select("*", { count: "exact" })
    .eq("is_active", true);

  // Low stock
  const { data: lowStockData } = await supabase
    .from("phone_variants")
    .select("id, quantity_in_stock, variant_metrics(min_stock)")
    .eq("is_active", true);

  const lowStock = (lowStockData || []).filter(
    (v: any) => v.quantity_in_stock <= (v.variant_metrics?.[0]?.min_stock || 2),
  ).length;

  return {
    total_units: totalUnits || 0,
    total_variants: totalVariants || 0,
    units_reserved: reserved || 0,
    low_stock_count: lowStock,
    availability_percent: totalUnits ? Math.round(((totalUnits - (reserved || 0)) / totalUnits) * 100) : 0,
  };
}

/**
 * Recherche rapidement des unités par IMEI
 */
export async function searchUnitByImei(imei: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("phone_units")
    .select(
      `
      *,
      phone_variants (
        sku,
        phone_models (
          model_name,
          phone_brands (name)
        )
      )
    `,
    )
    .ilike("imei", `%${imei}%`)
    .limit(10);

  if (error) {
    console.error("Error searching IMEI:", error);
    return [];
  }

  return data || [];
}

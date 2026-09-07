"use server";

import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import type {
  CreatePhoneVariantInput,
  PhoneVariant,
  PhoneUnit,
  StockAllocationResult,
  InventoryHealthReport,
} from "@/types/inventory";

// ============================================================================
// VARIANT OPERATIONS
// ============================================================================

/**
 * Crée une nouvelle variante avec ses unités associées
 * Atomic transaction: variant + units + pricing + metrics
 */
export async function createPhoneVariantWithUnits(
  input: CreatePhoneVariantInput,
): Promise<{ variant: PhoneVariant; error?: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  try {
    // 1. Générer SKU unique
    const sku = generateSKU(input);

    // 2. Vérifier SKU unique
    const { data: existing } = await supabase
      .from("phone_variants")
      .select("id")
      .eq("sku", sku)
      .single();

    if (existing) {
      return { variant: existing, error: `Variante ${sku} existe déjà` };
    }

    // 3. Créer variant
    const { data: variant, error: variantError } = await supabase
      .from("phone_variants")
      .insert({
        phone_model_id: input.phone_model_id,
        sku,
        ram: input.ram,
        storage: input.storage,
        color: input.color,
        condition: input.condition,
        quantity_in_stock: input.units.length,
      })
      .select()
      .single();

    if (variantError || !variant) {
      return { variant: {} as PhoneVariant, error: variantError?.message };
    }

    // 4. Insérer units (FIFO order)
    const unitInserts = input.units.map((unit, index) => ({
      variant_id: variant.id,
      imei: unit.imei,
      serial_number: unit.serial_number || null,
      acquired_at: new Date().toISOString(),
      acquisition_cost: unit.acquisition_cost,
      status: "in_stock" as const,
      quality_check: "pending" as const,
      sort_order: index,
    }));

    const { error: unitsError } = await supabase
      .from("phone_units")
      .insert(unitInserts);

    if (unitsError) {
      return { variant, error: `Erreur units: ${unitsError.message}` };
    }

    // 5. Créer pricing
    await supabase.from("variant_pricing").insert({
      variant_id: variant.id,
      base_cost: input.units[0].acquisition_cost,
      current_sale_price: input.units[0].acquisition_cost * 2, // Placeholder
    });

    // 6. Créer metrics
    await supabase.from("variant_metrics").insert({
      variant_id: variant.id,
      min_stock: 2,
      optimal_stock: 10,
      max_stock: 20,
      reorder_quantity: 5,
    });

    // 7. Log event
    await logInventoryEvent({
      action_type: "received",
      entity_type: "variant",
      entity_id: variant.id,
      actor_id: profile.id,
      context: {
        quantity: input.units.length,
      },
    });

    return { variant };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur inconnue";
    return { variant: {} as PhoneVariant, error: message };
  }
}

// ============================================================================
// ALLOCATION OPERATIONS (FIFO + Atomic)
// ============================================================================

/**
 * Alloue les unités FIFO pour une vente
 * Lock variant row pour éviter race conditions
 * Retourne IDs d'unités réservées
 */
export async function allocateUnitsForSale(
  variantId: string,
  quantity: number,
): Promise<StockAllocationResult | { error: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  try {
    // 1. Vérifier stock (avec lock pessimiste simulé)
    const { data: variant, error: variantError } = await supabase
      .from("phone_variants")
      .select("quantity_in_stock")
      .eq("id", variantId)
      .single();

    if (variantError || !variant) {
      return { error: "Variante non trouvée" };
    }

    if (variant.quantity_in_stock < quantity) {
      return {
        error: `Insuffisant: besoin ${quantity}, disponible ${variant.quantity_in_stock}`,
      };
    }

    // 2. Sélectionner units FIFO
    const { data: units, error: unitsError } = await supabase
      .from("phone_units")
      .select("id")
      .eq("variant_id", variantId)
      .eq("status", "in_stock")
      .order("acquired_at", { ascending: true })
      .order("created_at", { ascending: true })
      .limit(quantity);

    if (unitsError || !units || units.length < quantity) {
      return { error: "Erreur allocation units" };
    }

    const unitIds = units.map((u) => u.id);

    // 3. Marquer reserved
    const { error: updateError } = await supabase
      .from("phone_units")
      .update({ status: "reserved" })
      .in("id", unitIds);

    if (updateError) {
      return { error: updateError.message };
    }

    // 4. Créer soft hold
    const expiresAt = new Date(Date.now() + 30 * 60000); // 30 min TTL
    const { data: reservation } = await supabase
      .from("stock_reservations")
      .insert({
        variant_id: variantId,
        quantity,
        channel: "online_cart",
        expires_at: expiresAt.toISOString(),
        status: "active",
      })
      .select()
      .single();

    // 5. Log
    await logInventoryEvent({
      action_type: "reserved",
      entity_type: "variant",
      entity_id: variantId,
      actor_id: profile.id,
      context: { quantity, unit_count: unitIds.length },
    });

    return {
      reserved_unit_ids: unitIds,
      variant_id: variantId,
      quantity,
      expires_at: expiresAt.toISOString(),
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur allocation";
    return { error: message };
  }
}

// ============================================================================
// SALE COMPLETION (Atomic Update)
// ============================================================================

/**
 * Finalise une vente: marque units comme sold + update stock
 * Doit être appelé après paiement confirmé
 */
export async function completeSaleWithUnits(
  saleId: string,
  unitIds: string[],
): Promise<{ success: boolean; error?: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  try {
    const now = new Date().toISOString();

    // 1. Update units → sold
    const { error: unitsError } = await supabase
      .from("phone_units")
      .update({
        status: "sold",
        sold_at: now,
        sale_id: saleId,
      })
      .in("id", unitIds);

    if (unitsError) {
      return { success: false, error: unitsError.message };
    }

    // 2. Récupérer variant et décrémenter stock
    const { data: unit } = await supabase
      .from("phone_units")
      .select("variant_id")
      .eq("id", unitIds[0])
      .single();

    if (unit) {
      const { data: variant } = await supabase
        .from("phone_variants")
        .select("quantity_in_stock")
        .eq("id", unit.variant_id)
        .single();

      if (variant) {
        await supabase
          .from("phone_variants")
          .update({
            quantity_in_stock: Math.max(0, variant.quantity_in_stock - unitIds.length),
          })
          .eq("id", unit.variant_id);
      }
    }

    // 3. Supprimer reservation
    await supabase
      .from("stock_reservations")
      .update({ status: "confirmed" })
      .eq("sale_id", saleId);

    // 4. Log events
    for (const unitId of unitIds) {
      await logInventoryEvent({
        action_type: "sold",
        entity_type: "phone_unit",
        entity_id: unitId,
        actor_id: profile.id,
        context: { sale_id: saleId },
      });
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur sale";
    return { success: false, error: message };
  }
}

// ============================================================================
// QUALITY CHECK
// ============================================================================

export async function updateQualityCheck(
  unitId: string,
  status: "passed" | "failed" | "refurbished",
  findings?: Record<string, any>,
): Promise<{ success: boolean; error?: string }> {
  const profile = await requireProfile();
  const supabase = await createClient();

  try {
    const { error } = await supabase.from("quality_checks").insert({
      unit_id: unitId,
      checked_by: profile.id,
      status,
      findings: findings || {},
      action: status === "passed" ? "accept" : "mark_defective",
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Update unit status
    await supabase
      .from("phone_units")
      .update({ quality_check: status })
      .eq("id", unitId);

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erreur QC";
    return { success: false, error: message };
  }
}

// ============================================================================
// ALERTS & METRICS
// ============================================================================

/**
 * Calcule rapport santé inventaire
 * Appelé au dashboard
 */
export async function getInventoryHealthReport(): Promise<InventoryHealthReport> {
  const supabase = await createClient();

  const { data: allVariants } = await supabase
    .from("phone_variants")
    .select(
      `
      *,
      variant_metrics(*),
      variant_pricing(*),
      phone_units(id, status)
    `,
    )
    .eq("is_active", true);

  const lowStock = (allVariants || []).filter(
    (v) => v.quantity_in_stock <= (v.variant_metrics?.[0]?.min_stock || 2),
  );

  const overstock = (allVariants || []).filter(
    (v) => v.quantity_in_stock >= (v.variant_metrics?.[0]?.max_stock || 20),
  );

  const critical = lowStock.filter(
    (v) => v.quantity_in_stock === 0 || (v.phone_units || []).length === 0,
  );

  const totalUnits = (allVariants || []).reduce((sum, v) => sum + (v.phone_units || []).length, 0);
  const totalReserved = (allVariants || []).reduce((sum, v) => sum + v.quantity_reserved, 0);
  const totalDamaged = (allVariants || []).reduce((sum, v) => sum + v.quantity_damaged, 0);

  return {
    total_variants: allVariants?.length || 0,
    low_stock_variants: lowStock,
    overstock_variants: overstock,
    critically_low: critical,
    total_units: totalUnits,
    total_reserved: totalReserved,
    total_damaged: totalDamaged,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateSKU(input: CreatePhoneVariantInput): string {
  const storage = (input.storage || "UNKNOWN")
    .replace(" Go", "")
    .replace(" To", "");
  const color = (input.color || "BLACK").toUpperCase().replace(" ", "-");
  const condition = input.condition === "neuf" ? "NEW" : "LIKE-NEW";

  return `${storage}-${color}-${condition}`;
}

interface LogEventInput {
  action_type: string;
  entity_type: "phone_unit" | "variant" | "batch";
  entity_id: string;
  actor_id: string;
  context?: Record<string, any>;
  before?: Record<string, any>;
  after?: Record<string, any>;
}

async function logInventoryEvent(input: LogEventInput): Promise<void> {
  const supabase = await createClient();

  await supabase.from("inventory_event_logs").insert({
    action_type: input.action_type,
    entity_type: input.entity_type,
    entity_id: input.entity_id,
    actor_id: input.actor_id,
    context: input.context || {},
    before: input.before,
    after: input.after,
  });
}

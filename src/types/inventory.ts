import type { Database } from "./database";

// ============================================================================
// CATALOG TYPES
// ============================================================================

export type PhoneBrand = Database["public"]["Tables"]["phone_brands"]["Row"];
export type PhoneModel = Database["public"]["Tables"]["phone_models"]["Row"];

// ============================================================================
// INVENTORY TYPES
// ============================================================================

export type PhoneVariant = Database["public"]["Tables"]["phone_variants"]["Row"];
export type PhoneUnit = Database["public"]["Tables"]["phone_units"]["Row"];
export type StockReservation = Database["public"]["Tables"]["stock_reservations"]["Row"];

export type PhoneUnitStatus = "created" | "in_stock" | "reserved" | "sold" | "returned" | "damaged" | "scrapped";
export type QualityCheckStatus = "pending" | "passed" | "failed" | "refurbished";
export type ReservationChannel = "online_cart" | "phone_call" | "physical_store" | "internal";

// ============================================================================
// PRICING TYPES
// ============================================================================

export type VariantPricing = Database["public"]["Tables"]["variant_pricing"]["Row"];

export interface PriceHistoryEntry {
  set_at: string;
  base_price: number;
  discount: number;
  final_price: number;
  set_by: string;
  reason?: "promotion" | "market_adjustment" | "competitor";
}

// ============================================================================
// METRICS TYPES
// ============================================================================

export type VariantMetrics = Database["public"]["Tables"]["variant_metrics"]["Row"];
export type InventoryAlert = Database["public"]["Tables"]["inventory_alerts"]["Row"];

export type AlertSeverity = "info" | "warning" | "critical";
export type AlertType = "low_stock" | "overstock" | "stockout" | "price_anomaly";

// ============================================================================
// AUDIT TYPES
// ============================================================================

export type InventoryEventLog = Database["public"]["Tables"]["inventory_event_logs"]["Row"];
export type QualityCheck = Database["public"]["Tables"]["quality_checks"]["Row"];
export type ReturnRequest = Database["public"]["Tables"]["return_requests"]["Row"];

export type ActionType = "received" | "quality_checked" | "moved" | "reserved" | "sold" | "returned" | "scrapped";
export type EntityType = "phone_unit" | "variant" | "batch";

export interface InventoryEvent {
  action: ActionType;
  entity_type: EntityType;
  entity_id: string;
  before?: Record<string, any>;
  after?: Record<string, any>;
  context?: {
    sale_id?: string;
    import_batch_id?: string;
    reason?: string;
    channel?: string;
  };
}

// ============================================================================
// LOCATION TYPES
// ============================================================================

export type InventoryLocation = Database["public"]["Tables"]["inventory_locations"]["Row"];
export type StockLedger = Database["public"]["Tables"]["stock_ledger"]["Row"];

export type LocationType = "warehouse" | "shop_physical" | "counter_online";

// ============================================================================
// COMPOSITE VIEW TYPES
// ============================================================================

export interface PhoneVariantWithDetails extends PhoneVariant {
  model?: PhoneModel;
  pricing?: VariantPricing;
  metrics?: VariantMetrics;
  units?: PhoneUnit[];
}

export interface PhoneUnitWithHistory extends PhoneUnit {
  variant?: PhoneVariant;
  quality_check?: QualityCheck;
  events?: InventoryEventLog[];
}

export interface StockSnapshot {
  variant_id: string;
  total_quantity: number;
  quantity_in_stock: number;
  quantity_reserved: number;
  quantity_damaged: number;
  availability_percentage: number;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface CreatePhoneVariantInput {
  phone_model_id: string;
  ram?: string;
  storage: string;
  color?: string;
  condition: "neuf" | "quasi_neuf";
  units: {
    imei: string;
    serial_number?: string;
    acquisition_cost: number;
  }[];
}

export interface UpdatePhoneVariantInput {
  storage?: string;
  color?: string;
  min_stock?: number;
  optimal_stock?: number;
  max_stock?: number;
  reorder_quantity?: number;
}

export interface UpdateSalePriceInput {
  base_price: number;
  discount?: number;
  reason?: string;
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

export interface StockAllocationResult {
  reserved_unit_ids: string[];
  variant_id: string;
  quantity: number;
  expires_at: string;
}

export interface InventoryHealthReport {
  total_variants: number;
  low_stock_variants: PhoneVariantWithDetails[];
  overstock_variants: PhoneVariantWithDetails[];
  critically_low: PhoneVariantWithDetails[];
  total_units: number;
  total_reserved: number;
  total_damaged: number;
}

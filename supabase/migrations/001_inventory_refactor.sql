-- ============================================================================
-- INVENTORY REFACTORING MIGRATION
-- Transforms flat phones table into professional variant-based inventory system
-- ============================================================================

-- ============================================================================
-- LAYER 1: CATALOG (Reference Data)
-- ============================================================================

CREATE TABLE IF NOT EXISTS phone_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  market_share_pct DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Populate brands from existing phones data
INSERT INTO phone_brands (name)
SELECT DISTINCT brand FROM phones
ON CONFLICT (name) DO NOTHING;

CREATE TABLE IF NOT EXISTS phone_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand_id UUID NOT NULL REFERENCES phone_brands(id) ON DELETE CASCADE,
  model_name TEXT NOT NULL,
  release_date DATE,
  photo_url TEXT,
  specs JSONB DEFAULT '{}'::JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(brand_id, model_name)
);

-- Populate models from existing phones
INSERT INTO phone_models (brand_id, model_name, photo_url)
SELECT b.id, p.model, p.photo_url
FROM (SELECT DISTINCT brand, model, photo_url FROM phones) p
JOIN phone_brands b ON b.name = p.brand
ON CONFLICT (brand_id, model_name) DO NOTHING;

-- ============================================================================
-- LAYER 2: INVENTORY (Variants & Units)
-- ============================================================================

CREATE TABLE IF NOT EXISTS phone_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_model_id UUID NOT NULL REFERENCES phone_models(id) ON DELETE CASCADE,
  sku TEXT NOT NULL UNIQUE,
  ram TEXT,
  storage TEXT NOT NULL,
  color TEXT,
  color_hex TEXT,
  condition TEXT NOT NULL CHECK (condition IN ('neuf', 'quasi_neuf')),
  quantity_in_stock INTEGER NOT NULL DEFAULT 0,
  quantity_reserved INTEGER NOT NULL DEFAULT 0,
  quantity_damaged INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  archived_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_variants_sku ON phone_variants(sku) WHERE archived_at IS NULL;
CREATE INDEX idx_variants_active_model ON phone_variants(phone_model_id, is_active) WHERE is_active = TRUE;
CREATE INDEX idx_variants_stock ON phone_variants(quantity_in_stock) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS phone_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES phone_variants(id) ON DELETE CASCADE,
  imei TEXT NOT NULL UNIQUE,
  serial_number TEXT UNIQUE,
  acquired_at TIMESTAMP WITH TIME ZONE NOT NULL,
  acquisition_cost DECIMAL(12,2) NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  purchase_order_id UUID,
  current_location_id UUID,
  status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('created', 'in_stock', 'reserved', 'sold', 'returned', 'damaged', 'scrapped')),
  quality_check TEXT DEFAULT 'pending' CHECK (quality_check IN ('pending', 'passed', 'failed', 'refurbished')),
  sold_at TIMESTAMP WITH TIME ZONE,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_units_variant_status ON phone_units(variant_id, status) WHERE status IN ('in_stock', 'reserved');
CREATE INDEX idx_units_imei ON phone_units(imei);
CREATE INDEX idx_units_acquired ON phone_units(acquired_at DESC);
CREATE INDEX idx_units_location ON phone_units(current_location_id, status);
CREATE INDEX idx_units_sale ON phone_units(sale_id) WHERE sale_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES phone_variants(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  channel TEXT DEFAULT 'online_cart' CHECK (channel IN ('online_cart', 'phone_call', 'physical_store', 'internal')),
  customer_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  sale_id UUID REFERENCES sales(id) ON DELETE SET NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  specific_units TEXT[] DEFAULT '{}',
  can_substitute BOOLEAN DEFAULT TRUE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'confirmed', 'cancelled', 'expired')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reservations_active ON stock_reservations(variant_id, status) WHERE status = 'active' AND expires_at > NOW();

-- ============================================================================
-- LAYER 3: PRICING (Immutable History)
-- ============================================================================

CREATE TABLE IF NOT EXISTS variant_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL UNIQUE REFERENCES phone_variants(id) ON DELETE CASCADE,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  base_cost DECIMAL(12,2) NOT NULL,
  additional_costs JSONB DEFAULT '{}',
  total_acquisition_cost DECIMAL(12,2) GENERATED ALWAYS AS (
    base_cost + COALESCE((additional_costs->>'import_duty')::decimal, 0) +
    COALESCE((additional_costs->>'logistics')::decimal, 0) +
    COALESCE((additional_costs->>'handling')::decimal, 0)
  ) STORED,
  pricing_history JSONB DEFAULT '[]',
  current_sale_price DECIMAL(12,2),
  margin_percentage DECIMAL(5,2),
  markup_percentage DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pricing_variant ON variant_pricing(variant_id);

-- ============================================================================
-- LAYER 4: METRICS & ALERTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS variant_metrics (
  variant_id UUID PRIMARY KEY REFERENCES phone_variants(id) ON DELETE CASCADE,
  avg_daily_sales_30d DECIMAL(8,2) DEFAULT 0,
  min_stock INTEGER DEFAULT 2,
  optimal_stock INTEGER DEFAULT 10,
  max_stock INTEGER DEFAULT 20,
  reorder_quantity INTEGER DEFAULT 5,
  days_of_stock_remaining DECIMAL(10,2),
  lead_time_days INTEGER DEFAULT 7,
  should_reorder_now BOOLEAN DEFAULT FALSE,
  predicted_stockout_date TIMESTAMP WITH TIME ZONE,
  last_reorder_date TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES phone_variants(id) ON DELETE CASCADE,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  type TEXT NOT NULL CHECK (type IN ('low_stock', 'overstock', 'stockout', 'price_anomaly')),
  message TEXT NOT NULL,
  action_required TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_alerts_severity ON inventory_alerts(severity, created_at DESC) WHERE resolved_at IS NULL;

-- ============================================================================
-- LAYER 5: AUDIT & COMPLIANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
  actor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('received', 'quality_checked', 'moved', 'reserved', 'sold', 'returned', 'scrapped')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('phone_unit', 'variant', 'batch')),
  entity_id UUID NOT NULL,
  before JSONB,
  after JSONB,
  context JSONB DEFAULT '{}',
  ip_address TEXT
);

CREATE INDEX idx_events_unit_date ON inventory_event_logs(entity_id, created_at DESC) WHERE entity_type = 'phone_unit';
CREATE INDEX idx_events_actor ON inventory_event_logs(actor_id, created_at DESC);
CREATE INDEX idx_events_action ON inventory_event_logs(action_type, created_at DESC);

CREATE TABLE IF NOT EXISTS quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES phone_units(id) ON DELETE CASCADE,
  checked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  checked_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed', 'refurbished')),
  findings JSONB DEFAULT '{}',
  action TEXT DEFAULT 'accept' CHECK (action IN ('accept', 'refund', 'mark_defective', 'refurbish')),
  refurbish_cost DECIMAL(12,2),
  notes TEXT
);

CREATE INDEX idx_quality_checks_unit ON quality_checks(unit_id, checked_at DESC);

CREATE TABLE IF NOT EXISTS return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  unit_id UUID NOT NULL REFERENCES phone_units(id) ON DELETE CASCADE,
  initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reason TEXT NOT NULL CHECK (reason IN ('defective', 'not_as_described', 'damaged_shipping', 'changed_mind')),
  inspection_id UUID REFERENCES quality_checks(id) ON DELETE SET NULL,
  resolution TEXT CHECK (resolution IN ('refund', 'exchange', 'store_credit')),
  refund_amount DECIMAL(12,2),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- LAYER 6: MULTI-LOCATION
-- ============================================================================

CREATE TABLE IF NOT EXISTS inventory_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('warehouse', 'shop_physical', 'counter_online')),
  address TEXT,
  capacity INTEGER,
  current_utilization DECIMAL(5,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stock_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES phone_variants(id) ON DELETE CASCADE,
  from_location_id UUID REFERENCES inventory_locations(id),
  to_location_id UUID REFERENCES inventory_locations(id),
  quantity_moved INTEGER NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- MIGRATION: Populate from old phones table
-- ============================================================================

DO $$
DECLARE
  v_count INTEGER := 0;
BEGIN
  -- Generate SKUs and create variants
  INSERT INTO phone_variants (phone_model_id, sku, ram, storage, color, condition, quantity_in_stock)
  SELECT
    pm.id,
    CONCAT(
      UPPER(pb.name), '-',
      REPLACE(UPPER(pm.model_name), ' ', ''), '-',
      REGEXP_REPLACE(UPPER(COALESCE(p.storage, 'UNKNOWN')), ' Go| To', ''),
      '-',
      UPPER(COALESCE(REGEXP_REPLACE(p.color, ' ', '-'), 'BLACK')),
      '-',
      CASE WHEN p.condition = 'neuf' THEN 'NEW' ELSE 'LIKE-NEW' END
    ) as sku,
    p.ram,
    p.storage,
    p.color,
    p.condition,
    COUNT(*) as quantity
  FROM phones p
  JOIN phone_models pm ON pm.model_name = p.model AND pm.is_active = TRUE
  JOIN phone_brands pb ON pb.id = pm.brand_id
  GROUP BY pm.id, pb.name, pm.model_name, p.ram, p.storage, p.color, p.condition
  ON CONFLICT (sku) DO UPDATE SET quantity_in_stock = EXCLUDED.quantity_in_stock;

  -- Populate pricing from first unit of each variant
  INSERT INTO variant_pricing (variant_id, base_cost, current_sale_price)
  SELECT
    pv.id,
    AVG(p.purchase_price),
    AVG(p.planned_sale_price)
  FROM phone_variants pv
  JOIN phone_models pm ON pm.id = pv.phone_model_id
  JOIN phones p ON p.model = pm.model_name AND
                   p.ram = pv.ram AND
                   p.storage = pv.storage AND
                   p.color = pv.color AND
                   p.condition = pv.condition
  GROUP BY pv.id
  ON CONFLICT (variant_id) DO NOTHING;

  -- Populate units
  INSERT INTO phone_units (variant_id, imei, acquired_at, acquisition_cost, supplier_id, sale_id, status)
  SELECT
    pv.id,
    p.imei,
    p.arrival_date,
    p.purchase_price,
    p.supplier_id,
    NULL,
    CASE
      WHEN p.status = 'vendu' THEN 'sold'
      WHEN p.status = 'reserve' THEN 'reserved'
      ELSE 'in_stock'
    END
  FROM phones p
  JOIN phone_models pm ON pm.model_name = p.model AND pm.is_active = TRUE
  JOIN phone_variants pv ON pv.phone_model_id = pm.id AND
                             pv.ram = p.ram AND
                             pv.storage = p.storage AND
                             pv.color = p.color AND
                             pv.condition = p.condition
  ON CONFLICT (imei) DO NOTHING;

  SELECT COUNT(*) INTO v_count FROM phone_units;
  RAISE NOTICE 'Migration completed: % units imported', v_count;
END $$;

-- ============================================================================
-- CLEANUP & VERIFICATION
-- ============================================================================

-- Verify migration
SELECT
  'phone_variants' as table_name, COUNT(*) as row_count FROM phone_variants
UNION ALL
SELECT 'phone_units', COUNT(*) FROM phone_units
UNION ALL
SELECT 'stock_reservations', COUNT(*) FROM stock_reservations;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

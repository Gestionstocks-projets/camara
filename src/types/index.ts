import type { Database } from "./database";

export type {
  UserRole,
  PhoneCondition,
  PhoneStatus,
  PaymentMethod,
  PaymentStatus,
  AccessoryCategory,
} from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Settings = Database["public"]["Tables"]["settings"]["Row"];
export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Phone = Database["public"]["Tables"]["phones"]["Row"];
export type Sale = Database["public"]["Tables"]["sales"]["Row"];
export type SaleItem = Database["public"]["Tables"]["sale_items"]["Row"];
export type SalePayment = Database["public"]["Tables"]["sale_payments"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];
export type Accessory = Database["public"]["Tables"]["accessories"]["Row"];

/** Téléphone tel que renvoyé à un `manager` sans droit sur les montants
 * d'achat/bénéfice (prompt 07) : champs sensibles omis, jamais nullifiés. */
export type PhoneMasked = Omit<
  Phone,
  "purchase_price" | "extra_fees"
> & {
  purchase_price?: number;
  extra_fees?: number;
};

/** Accessoire tel que renvoyé à un `manager` sans droit sur le prix
 * d'achat — même logique de masquage que pour les téléphones. */
export type AccessoryMasked = Omit<Accessory, "purchase_price"> & {
  purchase_price?: number;
};

export type SaleMasked = Omit<Sale, "profit" | "accessories_profit"> & {
  profit?: number;
  accessories_profit?: number;
};

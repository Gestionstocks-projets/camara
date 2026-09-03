import type { Database } from "./database";

export type {
  UserRole,
  PhoneCondition,
  PhoneStatus,
  PaymentMethod,
  PaymentStatus,
} from "./database";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Settings = Database["public"]["Tables"]["settings"]["Row"];
export type Supplier = Database["public"]["Tables"]["suppliers"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Phone = Database["public"]["Tables"]["phones"]["Row"];
export type Sale = Database["public"]["Tables"]["sales"]["Row"];
export type SalePayment = Database["public"]["Tables"]["sale_payments"]["Row"];
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"];

/** Téléphone tel que renvoyé à un `manager` sans droit sur les montants
 * d'achat/bénéfice (prompt 07) : champs sensibles omis, jamais nullifiés. */
export type PhoneMasked = Omit<
  Phone,
  "purchase_price" | "extra_fees"
> & {
  purchase_price?: number;
  extra_fees?: number;
};

export type SaleMasked = Omit<Sale, "profit"> & { profit?: number };

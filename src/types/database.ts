/**
 * Types Supabase écrits à la main, reflet exact de
 * supabase/migrations/0001_init.sql + 0002_functions_triggers.sql.
 *
 * À remplacer par `npx supabase gen types typescript --project-id <id>`
 * dès que le projet Supabase de production est accessible (prompt 03,
 * critère d'acceptation) — la structure ci-dessous doit alors rester
 * identique, sans quoi les types métier de `src/types/index.ts` cesseront
 * de correspondre au schéma réel.
 */

export type UserRole = "owner" | "manager";
export type PhoneCondition = "neuf" | "quasi_neuf";
export type PhoneStatus = "en_stock" | "reserve" | "vendu";
export type PaymentMethod =
  | "especes"
  | "orange_money"
  | "wave"
  | "carte"
  | "autre";
export type PaymentStatus = "paye" | "partiel" | "en_attente";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: UserRole;
          phone: string | null;
          disabled: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          role?: UserRole;
          phone?: string | null;
          disabled?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          id: number;
          shop_name: string;
          shop_logo_url: string | null;
          shop_phone: string | null;
          shop_whatsapp: string | null;
          shop_email: string | null;
          shop_address: string | null;
          managers_see_purchase_price: boolean;
          managers_see_profit: boolean;
          invoice_prefix: string;
        };
        Insert: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
        Update: Partial<Database["public"]["Tables"]["settings"]["Row"]>;
        Relationships: [];
      };
      suppliers: {
        Row: {
          id: string;
          name: string;
          phone: string | null;
          whatsapp: string | null;
          city: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone?: string | null;
          whatsapp?: string | null;
          city?: string | null;
          notes?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["suppliers"]["Insert"]>;
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          phone: string | null;
          whatsapp: string | null;
          email: string | null;
          city: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          phone?: string | null;
          whatsapp?: string | null;
          email?: string | null;
          city?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: [];
      };
      phones: {
        Row: {
          id: string;
          brand: string;
          model: string;
          imei: string;
          condition: PhoneCondition;
          ram: string | null;
          storage: string;
          color: string | null;
          email: string | null;
          photo_url: string | null;
          status: PhoneStatus;
          supplier_id: string | null;
          arrival_date: string;
          purchase_price: number;
          extra_fees: number;
          planned_sale_price: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          brand: string;
          model: string;
          imei: string;
          condition: PhoneCondition;
          ram?: string | null;
          storage: string;
          color?: string | null;
          email?: string | null;
          photo_url?: string | null;
          status?: PhoneStatus;
          supplier_id?: string | null;
          arrival_date?: string;
          purchase_price: number;
          extra_fees?: number;
          planned_sale_price: number;
          created_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["phones"]["Insert"]>;
        Relationships: [];
      };
      sales: {
        Row: {
          id: string;
          phone_id: string;
          client_id: string;
          sale_date: string;
          sale_price: number;
          discount: number;
          profit: number;
          payment_method: PaymentMethod;
          warranty: string | null;
          payment_status: PaymentStatus;
          amount_paid: number;
          amount_due: number;
          sold_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          phone_id: string;
          client_id: string;
          sale_date?: string;
          sale_price: number;
          discount?: number;
          payment_method: PaymentMethod;
          warranty?: string | null;
          payment_status?: PaymentStatus;
          amount_paid?: number;
          sold_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["sales"]["Insert"]>;
        Relationships: [];
      };
      sale_payments: {
        Row: {
          id: string;
          sale_id: string;
          amount: number;
          method: PaymentMethod;
          paid_at: string;
          recorded_by: string | null;
        };
        Insert: {
          id?: string;
          sale_id: string;
          amount: number;
          method: PaymentMethod;
          paid_at?: string;
          recorded_by?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["sale_payments"]["Insert"]>;
        Relationships: [];
      };
      invoices: {
        Row: {
          id: string;
          sale_id: string;
          number: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          sale_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

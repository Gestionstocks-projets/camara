export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accessories: {
        Row: {
          category: Database["public"]["Enums"]["accessory_category"]
          compatible_with: string | null
          created_at: string
          created_by: string | null
          id: string
          low_stock_threshold: number
          name: string
          photo_url: string | null
          purchase_price: number
          quantity_in_stock: number
          sale_price: number
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["accessory_category"]
          compatible_with?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          low_stock_threshold?: number
          name: string
          photo_url?: string | null
          purchase_price?: number
          quantity_in_stock?: number
          sale_price: number
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["accessory_category"]
          compatible_with?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          low_stock_threshold?: number
          name?: string
          photo_url?: string | null
          purchase_price?: number
          quantity_in_stock?: number
          sale_price?: number
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "accessories_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accessories_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          city: string | null
          created_at: string
          email: string | null
          first_name: string
          id: string
          last_name: string
          phone: string | null
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          id?: string
          last_name: string
          phone?: string | null
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      invoice_counters: {
        Row: {
          last_number: number
          year: number
        }
        Insert: {
          last_number?: number
          year: number
        }
        Update: {
          last_number?: number
          year?: number
        }
        Relationships: []
      }
      invoices: {
        Row: {
          created_at: string
          id: string
          number: string
          sale_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          number: string
          sale_id: string
        }
        Update: {
          created_at?: string
          id?: string
          number?: string
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: true
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      phones: {
        Row: {
          arrival_date: string
          brand: string
          color: string | null
          condition: Database["public"]["Enums"]["phone_condition"]
          created_at: string
          created_by: string | null
          email: string | null
          extra_fees: number
          id: string
          imei: string
          model: string
          photo_url: string | null
          planned_sale_price: number
          purchase_price: number
          ram: string | null
          status: Database["public"]["Enums"]["phone_status"]
          storage: string
          supplier_id: string | null
          updated_at: string
        }
        Insert: {
          arrival_date?: string
          brand: string
          color?: string | null
          condition: Database["public"]["Enums"]["phone_condition"]
          created_at?: string
          created_by?: string | null
          email?: string | null
          extra_fees?: number
          id?: string
          imei: string
          model: string
          photo_url?: string | null
          planned_sale_price: number
          purchase_price: number
          ram?: string | null
          status?: Database["public"]["Enums"]["phone_status"]
          storage: string
          supplier_id?: string | null
          updated_at?: string
        }
        Update: {
          arrival_date?: string
          brand?: string
          color?: string | null
          condition?: Database["public"]["Enums"]["phone_condition"]
          created_at?: string
          created_by?: string | null
          email?: string | null
          extra_fees?: number
          id?: string
          imei?: string
          model?: string
          photo_url?: string | null
          planned_sale_price?: number
          purchase_price?: number
          ram?: string | null
          status?: Database["public"]["Enums"]["phone_status"]
          storage?: string
          supplier_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "phones_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "phones_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          disabled: boolean
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          created_at?: string
          disabled?: boolean
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          created_at?: string
          disabled?: boolean
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      sale_items: {
        Row: {
          accessory_id: string
          created_at: string
          id: string
          quantity: number
          sale_id: string
          unit_cost: number
          unit_price: number
        }
        Insert: {
          accessory_id: string
          created_at?: string
          id?: string
          quantity: number
          sale_id: string
          unit_cost: number
          unit_price: number
        }
        Update: {
          accessory_id?: string
          created_at?: string
          id?: string
          quantity?: number
          sale_id?: string
          unit_cost?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "sale_items_accessory_id_fkey"
            columns: ["accessory_id"]
            isOneToOne: false
            referencedRelation: "accessories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_items_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sale_payments: {
        Row: {
          amount: number
          id: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string
          recorded_by: string | null
          sale_id: string
        }
        Insert: {
          amount: number
          id?: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          recorded_by?: string | null
          sale_id: string
        }
        Update: {
          amount?: number
          id?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string
          recorded_by?: string | null
          sale_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sale_payments_recorded_by_fkey"
            columns: ["recorded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sale_payments_sale_id_fkey"
            columns: ["sale_id"]
            isOneToOne: false
            referencedRelation: "sales"
            referencedColumns: ["id"]
          },
        ]
      }
      sales: {
        Row: {
          accessories_profit: number
          accessories_total: number
          amount_due: number
          amount_paid: number
          client_id: string
          created_at: string
          discount: number
          id: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone_id: string | null
          profit: number
          sale_date: string
          sale_price: number
          sold_by: string | null
          warranty: string | null
        }
        Insert: {
          accessories_profit?: number
          accessories_total?: number
          amount_due?: number
          amount_paid?: number
          client_id: string
          created_at?: string
          discount?: number
          id?: string
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone_id?: string | null
          profit?: number
          sale_date?: string
          sale_price?: number
          sold_by?: string | null
          warranty?: string | null
        }
        Update: {
          accessories_profit?: number
          accessories_total?: number
          amount_due?: number
          amount_paid?: number
          client_id?: string
          created_at?: string
          discount?: number
          id?: string
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone_id?: string | null
          profit?: number
          sale_date?: string
          sale_price?: number
          sold_by?: string | null
          warranty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_phone_id_fkey"
            columns: ["phone_id"]
            isOneToOne: true
            referencedRelation: "phones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_sold_by_fkey"
            columns: ["sold_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          id: number
          invoice_prefix: string
          managers_see_profit: boolean
          managers_see_purchase_price: boolean
          shop_address: string | null
          shop_email: string | null
          shop_logo_url: string | null
          shop_name: string
          shop_phone: string | null
          shop_whatsapp: string | null
        }
        Insert: {
          id?: number
          invoice_prefix?: string
          managers_see_profit?: boolean
          managers_see_purchase_price?: boolean
          shop_address?: string | null
          shop_email?: string | null
          shop_logo_url?: string | null
          shop_name?: string
          shop_phone?: string | null
          shop_whatsapp?: string | null
        }
        Update: {
          id?: number
          invoice_prefix?: string
          managers_see_profit?: boolean
          managers_see_purchase_price?: boolean
          shop_address?: string | null
          shop_email?: string | null
          shop_logo_url?: string | null
          shop_name?: string
          shop_phone?: string | null
          shop_whatsapp?: string | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          city: string | null
          created_at: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_owner: { Args: never; Returns: boolean }
    }
    Enums: {
      accessory_category:
        | "chargeur"
        | "ecran"
        | "batterie"
        | "ecouteurs"
        | "airpods"
        | "coque"
        | "cable"
        | "autre"
      payment_method: "especes" | "orange_money" | "wave" | "carte" | "autre"
      payment_status: "paye" | "partiel" | "en_attente"
      phone_condition: "neuf" | "quasi_neuf"
      phone_status: "en_stock" | "reserve" | "vendu"
      user_role: "owner" | "manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      accessory_category: [
        "chargeur",
        "ecran",
        "batterie",
        "ecouteurs",
        "airpods",
        "coque",
        "cable",
        "autre",
      ],
      payment_method: ["especes", "orange_money", "wave", "carte", "autre"],
      payment_status: ["paye", "partiel", "en_attente"],
      phone_condition: ["neuf", "quasi_neuf"],
      phone_status: ["en_stock", "reserve", "vendu"],
      user_role: ["owner", "manager"],
    },
  },
} as const

/**
 * Alias pratiques vers les enums, utilisés dans toute l'app plutôt que le
 * chemin complet `Database["public"]["Enums"][...]`.
 */
export type UserRole = Database["public"]["Enums"]["user_role"];
export type PhoneCondition = Database["public"]["Enums"]["phone_condition"];
export type PhoneStatus = Database["public"]["Enums"]["phone_status"];
export type PaymentMethod = Database["public"]["Enums"]["payment_method"];
export type PaymentStatus = Database["public"]["Enums"]["payment_status"];
export type AccessoryCategory = Database["public"]["Enums"]["accessory_category"];

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      coupons: {
        Row: {
          claimed_count: number | null
          coupon_type: string
          created_at: string | null
          discount_value: number
          id: string
          is_active: boolean | null
          min_order_amount: number | null
          name: string
          total_quota: number | null
          valid_days: number | null
        }
        Insert: {
          claimed_count?: number | null
          coupon_type: string
          created_at?: string | null
          discount_value: number
          id?: string
          is_active?: boolean | null
          min_order_amount?: number | null
          name: string
          total_quota?: number | null
          valid_days?: number | null
        }
        Update: {
          claimed_count?: number | null
          coupon_type?: string
          created_at?: string | null
          discount_value?: number
          id?: string
          is_active?: boolean | null
          min_order_amount?: number | null
          name?: string
          total_quota?: number | null
          valid_days?: number | null
        }
        Relationships: []
      }
      inventory_logs: {
        Row: {
          after_amount: number | null
          before_amount: number | null
          change_amount: number
          change_type: string
          created_at: string | null
          id: string
          material_id: string
          material_type: string
          operator_id: string | null
          reference_id: string | null
          store_id: string
        }
        Insert: {
          after_amount?: number | null
          before_amount?: number | null
          change_amount: number
          change_type: string
          created_at?: string | null
          id?: string
          material_id: string
          material_type: string
          operator_id?: string | null
          reference_id?: string | null
          store_id: string
        }
        Update: {
          after_amount?: number | null
          before_amount?: number | null
          change_amount?: number
          change_type?: string
          created_at?: string | null
          id?: string
          material_id?: string
          material_type?: string
          operator_id?: string | null
          reference_id?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      membership_levels: {
        Row: {
          benefits: Json | null
          created_at: string | null
          discount_rate: number | null
          id: string
          min_points: number
          name: string
        }
        Insert: {
          benefits?: Json | null
          created_at?: string | null
          discount_rate?: number | null
          id?: string
          min_points?: number
          name: string
        }
        Update: {
          benefits?: Json | null
          created_at?: string | null
          discount_rate?: number | null
          id?: string
          min_points?: number
          name?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          options: Json | null
          order_id: string
          product_id: string | null
          product_name: string
          quantity: number
          subtotal: number
          unit_price: number
        }
        Insert: {
          id?: string
          options?: Json | null
          order_id: string
          product_id?: string | null
          product_name: string
          quantity?: number
          subtotal: number
          unit_price: number
        }
        Update: {
          id?: string
          options?: Json | null
          order_id?: string
          product_id?: string | null
          product_name?: string
          quantity?: number
          subtotal?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_logs: {
        Row: {
          created_at: string | null
          from_status: Database["public"]["Enums"]["order_status"] | null
          id: string
          note: string | null
          operator_id: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          created_at?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          operator_id?: string | null
          order_id: string
          to_status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          created_at?: string | null
          from_status?: Database["public"]["Enums"]["order_status"] | null
          id?: string
          note?: string | null
          operator_id?: string | null
          order_id?: string
          to_status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          accepted_at: string | null
          completed_at: string | null
          coupon_discount: number | null
          created_at: string | null
          customer_id: string | null
          delivery_address: string | null
          delivery_phone: string | null
          final_amount: number
          id: string
          merchant_share: number | null
          order_no: string
          platform_share: number | null
          remark: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          store_id: string
          total_amount: number
        }
        Insert: {
          accepted_at?: string | null
          completed_at?: string | null
          coupon_discount?: number | null
          created_at?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_phone?: string | null
          final_amount: number
          id?: string
          merchant_share?: number | null
          order_no: string
          platform_share?: number | null
          remark?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          store_id: string
          total_amount: number
        }
        Update: {
          accepted_at?: string | null
          completed_at?: string | null
          coupon_discount?: number | null
          created_at?: string | null
          customer_id?: string | null
          delivery_address?: string | null
          delivery_phone?: string | null
          final_amount?: number
          id?: string
          merchant_share?: number | null
          order_no?: string
          platform_share?: number | null
          remark?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          store_id?: string
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      packaging_materials: {
        Row: {
          created_at: string
          current_amount: number
          id: string
          max_amount: number
          name: string
          store_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          id?: string
          max_amount: number
          name: string
          store_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          id?: string
          max_amount?: number
          name?: string
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "packaging_materials_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          id: string
          is_default: boolean | null
          option_type: string
          option_value: string
          price_adjustment: number | null
          product_id: string
        }
        Insert: {
          id?: string
          is_default?: boolean | null
          option_type: string
          option_value: string
          price_adjustment?: number | null
          product_id: string
        }
        Update: {
          id?: string
          is_default?: boolean | null
          option_type?: string
          option_value?: string
          price_adjustment?: number | null
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          base_price: number
          category: string
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          name_en: string | null
          sort_order: number | null
        }
        Insert: {
          base_price: number
          category: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_en?: string | null
          sort_order?: number | null
        }
        Update: {
          base_price?: number
          category?: string
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_en?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          membership_level_id: string | null
          phone: string | null
          points: number | null
          store_id: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          membership_level_id?: string | null
          phone?: string | null
          points?: number | null
          store_id?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          membership_level_id?: string | null
          phone?: string | null
          points?: number | null
          store_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_membership_level_id_fkey"
            columns: ["membership_level_id"]
            isOneToOne: false
            referencedRelation: "membership_levels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_materials: {
        Row: {
          created_at: string
          current_amount: number
          icon: string
          id: string
          max_amount: number
          name: string
          store_id: string
          unit: string
          updated_at: string
          usage_per_cup: number
        }
        Insert: {
          created_at?: string
          current_amount?: number
          icon: string
          id?: string
          max_amount: number
          name: string
          store_id: string
          unit: string
          updated_at?: string
          usage_per_cup: number
        }
        Update: {
          created_at?: string
          current_amount?: number
          icon?: string
          id?: string
          max_amount?: number
          name?: string
          store_id?: string
          unit?: string
          updated_at?: string
          usage_per_cup?: number
        }
        Relationships: [
          {
            foreignKeyName: "raw_materials_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      restock_items: {
        Row: {
          id: string
          item_name: string
          item_type: string
          quantity: string
          shipment_id: string
        }
        Insert: {
          id?: string
          item_name: string
          item_type: string
          quantity: string
          shipment_id: string
        }
        Update: {
          id?: string
          item_name?: string
          item_type?: string
          quantity?: string
          shipment_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restock_items_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "restock_shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      restock_shipments: {
        Row: {
          created_at: string
          delivered_at: string | null
          estimated_days: number | null
          id: string
          status: string
          store_id: string
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          estimated_days?: number | null
          id?: string
          status?: string
          store_id: string
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          estimated_days?: number | null
          id?: string
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restock_shipments_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          created_at: string | null
          id: string
          reply_text: string
          review_id: string
          store_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reply_text: string
          review_id: string
          store_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reply_text?: string
          review_id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "review_replies_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          customer_id: string
          id: string
          images: Json | null
          is_complaint: boolean | null
          order_id: string | null
          rating: number | null
          status: string | null
          store_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          customer_id: string
          id?: string
          images?: Json | null
          is_complaint?: boolean | null
          order_id?: string | null
          rating?: number | null
          status?: string | null
          store_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          customer_id?: string
          id?: string
          images?: Json | null
          is_complaint?: boolean | null
          order_id?: string | null
          rating?: number | null
          status?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: true
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      settlements: {
        Row: {
          created_at: string | null
          final_payout: number | null
          id: string
          merchant_share: number | null
          paid_at: string | null
          period_end: string
          period_start: string
          platform_share: number | null
          restock_cost: number | null
          status: string | null
          store_id: string
          total_orders: number | null
          total_revenue: number | null
        }
        Insert: {
          created_at?: string | null
          final_payout?: number | null
          id?: string
          merchant_share?: number | null
          paid_at?: string | null
          period_end: string
          period_start: string
          platform_share?: number | null
          restock_cost?: number | null
          status?: string | null
          store_id: string
          total_orders?: number | null
          total_revenue?: number | null
        }
        Update: {
          created_at?: string | null
          final_payout?: number | null
          id?: string
          merchant_share?: number | null
          paid_at?: string | null
          period_end?: string
          period_start?: string
          platform_share?: number | null
          restock_cost?: number | null
          status?: string | null
          store_id?: string
          total_orders?: number | null
          total_revenue?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "settlements_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_documents: {
        Row: {
          doc_type: string
          file_url: string
          id: string
          store_id: string
          uploaded_at: string | null
        }
        Insert: {
          doc_type: string
          file_url: string
          id?: string
          store_id: string
          uploaded_at?: string | null
        }
        Update: {
          doc_type?: string
          file_url?: string
          id?: string
          store_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_documents_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_products: {
        Row: {
          id: string
          is_available: boolean | null
          local_price: number | null
          product_id: string
          stock_count: number | null
          store_id: string
        }
        Insert: {
          id?: string
          is_available?: boolean | null
          local_price?: number | null
          product_id: string
          stock_count?: number | null
          store_id: string
        }
        Update: {
          id?: string
          is_available?: boolean | null
          local_price?: number | null
          product_id?: string
          stock_count?: number | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_products_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_settings: {
        Row: {
          auto_accept: boolean | null
          closing_time: string | null
          id: string
          is_online: boolean | null
          opening_time: string | null
          store_id: string
          updated_at: string | null
        }
        Insert: {
          auto_accept?: boolean | null
          closing_time?: string | null
          id?: string
          is_online?: boolean | null
          opening_time?: string | null
          store_id: string
          updated_at?: string | null
        }
        Update: {
          auto_accept?: boolean | null
          closing_time?: string | null
          id?: string
          is_online?: boolean | null
          opening_time?: string | null
          store_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "store_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: true
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string | null
          approved_at: string | null
          barista_name: string | null
          brand: string
          code: string
          contact_phone: string | null
          coordinates: string | null
          created_at: string
          id: string
          intro: string | null
          message: string | null
          name: string
          rating: number | null
          status: string | null
          total_orders: number | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          barista_name?: string | null
          brand?: string
          code: string
          contact_phone?: string | null
          coordinates?: string | null
          created_at?: string
          id?: string
          intro?: string | null
          message?: string | null
          name: string
          rating?: number | null
          status?: string | null
          total_orders?: number | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          barista_name?: string | null
          brand?: string
          code?: string
          contact_phone?: string | null
          coordinates?: string | null
          created_at?: string
          id?: string
          intro?: string | null
          message?: string | null
          name?: string
          rating?: number | null
          status?: string | null
          total_orders?: number | null
        }
        Relationships: []
      }
      user_coupons: {
        Row: {
          coupon_id: string
          created_at: string | null
          expires_at: string
          id: string
          status: string | null
          used_order_id: string | null
          user_id: string
        }
        Insert: {
          coupon_id: string
          created_at?: string | null
          expires_at: string
          id?: string
          status?: string | null
          used_order_id?: string | null
          user_id: string
        }
        Update: {
          coupon_id?: string
          created_at?: string | null
          expires_at?: string
          id?: string
          status?: string | null
          used_order_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_coupons_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_coupons_used_order_id_fkey"
            columns: ["used_order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_store_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "store_staff" | "customer"
      order_status:
        | "pending"
        | "accepted"
        | "making"
        | "ready"
        | "delivering"
        | "delivered"
        | "cancelled"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "store_staff", "customer"],
      order_status: [
        "pending",
        "accepted",
        "making",
        "ready",
        "delivering",
        "delivered",
        "cancelled",
      ],
    },
  },
} as const

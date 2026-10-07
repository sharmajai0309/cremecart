export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string;
          created_at: string;
          full_name: string;
          id: string;
          is_default: boolean;
          label: string;
          line1: string;
          line2: string;
          phone: string;
          pincode: string;
          user_id: string;
        };
        Insert: {
          city: string;
          created_at?: string;
          full_name: string;
          id?: string;
          is_default?: boolean;
          label?: string;
          line1: string;
          line2?: string;
          phone: string;
          pincode: string;
          user_id: string;
        };
        Update: {
          city?: string;
          created_at?: string;
          full_name?: string;
          id?: string;
          is_default?: boolean;
          label?: string;
          line1?: string;
          line2?: string;
          phone?: string;
          pincode?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          slug: string;
          sort_order: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          name: string;
          slug: string;
          sort_order?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          slug?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          is_read: boolean;
          message: string;
          name: string;
          order_number: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          is_read?: boolean;
          message: string;
          name: string;
          order_number?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          is_read?: boolean;
          message?: string;
          name?: string;
          order_number?: string | null;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          code: string;
          discount_type: string;
          discount_value: number;
          expires_at: string | null;
          id: string;
          is_active: boolean;
          max_discount: number | null;
          min_order_amount: number;
        };
        Insert: {
          code: string;
          discount_type?: string;
          discount_value: number;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_discount?: number | null;
          min_order_amount?: number;
        };
        Update: {
          code?: string;
          discount_type?: string;
          discount_value?: number;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean;
          max_discount?: number | null;
          min_order_amount?: number;
        };
        Relationships: [];
      };
      delivery_zones: {
        Row: {
          delivery_fee: number;
          fixed_time_available: boolean;
          id: string;
          is_active: boolean;
          location_id: string;
          midnight_available: boolean;
          pincode: string;
          same_day_available: boolean;
          sixty_minute_available: boolean;
        };
        Insert: {
          delivery_fee?: number;
          fixed_time_available?: boolean;
          id?: string;
          is_active?: boolean;
          location_id: string;
          midnight_available?: boolean;
          pincode: string;
          same_day_available?: boolean;
          sixty_minute_available?: boolean;
        };
        Update: {
          delivery_fee?: number;
          fixed_time_available?: boolean;
          id?: string;
          is_active?: boolean;
          location_id?: string;
          midnight_available?: boolean;
          pincode?: string;
          same_day_available?: boolean;
          sixty_minute_available?: boolean;
        };
        Relationships: [
          {
            foreignKeyName: "delivery_zones_location_id_fkey";
            columns: ["location_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["id"];
          },
        ];
      };
      inventory_transactions: {
        Row: {
          created_at: string;
          id: string;
          notes: string | null;
          order_id: string | null;
          product_id: string;
          quantity_change: number;
          type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          order_id?: string | null;
          product_id: string;
          quantity_change: number;
          type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          notes?: string | null;
          order_id?: string | null;
          product_id?: string;
          quantity_change?: number;
          type?: string;
        };
        Relationships: [
          {
            foreignKeyName: "inventory_transactions_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "inventory_transactions_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      locations: {
        Row: {
          city: string;
          created_at: string;
          id: string;
          is_active: boolean;
          state: string;
        };
        Insert: {
          city: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          state?: string;
        };
        Update: {
          city?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          state?: string;
        };
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: {
          created_at: string;
          email: string;
          id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          eggless: boolean;
          flavor: string | null;
          id: string;
          image: string | null;
          line_total: number;
          message: string | null;
          order_id: string;
          product_id: string | null;
          product_name: string;
          quantity: number;
          sku: string | null;
          unit_price: number;
          weight: string | null;
        };
        Insert: {
          eggless?: boolean;
          flavor?: string | null;
          id?: string;
          image?: string | null;
          line_total: number;
          message?: string | null;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          quantity?: number;
          sku?: string | null;
          unit_price: number;
          weight?: string | null;
        };
        Update: {
          eggless?: boolean;
          flavor?: string | null;
          id?: string;
          image?: string | null;
          line_total?: number;
          message?: string | null;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          quantity?: number;
          sku?: string | null;
          unit_price?: number;
          weight?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      order_status_history: {
        Row: {
          created_at: string;
          from_status: string | null;
          id: string;
          notes: string | null;
          order_id: string;
          to_status: string;
        };
        Insert: {
          created_at?: string;
          from_status?: string | null;
          id?: string;
          notes?: string | null;
          order_id: string;
          to_status: string;
        };
        Update: {
          created_at?: string;
          from_status?: string | null;
          id?: string;
          notes?: string | null;
          order_id?: string;
          to_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          admin_notes: string | null;
          coupon_code: string | null;
          created_at: string;
          customer_email: string | null;
          customer_name: string;
          customer_notes: string | null;
          customer_phone: string;
          delivery_address: NonNullable<Json>;
          delivery_date: string | null;
          delivery_fee: number;
          delivery_slot: string | null;
          delivery_type: string | null;
          discount_amount: number;
          gift_message: string | null;
          gift_recipient_name: string | null;
          id: string;
          is_gift: boolean;
          order_number: string;
          payment_method: string;
          payment_reference: string | null;
          payment_status: string;
          status: string;
          subtotal: number;
          total_amount: number;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          admin_notes?: string | null;
          coupon_code?: string | null;
          created_at?: string;
          customer_email?: string | null;
          customer_name: string;
          customer_notes?: string | null;
          customer_phone: string;
          delivery_address: NonNullable<Json>;
          delivery_date?: string | null;
          delivery_fee?: number;
          delivery_slot?: string | null;
          delivery_type?: string | null;
          discount_amount?: number;
          gift_message?: string | null;
          gift_recipient_name?: string | null;
          id?: string;
          is_gift?: boolean;
          order_number: string;
          payment_method?: string;
          payment_reference?: string | null;
          payment_status?: string;
          status?: string;
          subtotal: number;
          total_amount: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          admin_notes?: string | null;
          coupon_code?: string | null;
          created_at?: string;
          customer_email?: string | null;
          customer_name?: string;
          customer_notes?: string | null;
          customer_phone?: string;
          delivery_address?: NonNullable<Json>;
          delivery_date?: string | null;
          delivery_fee?: number;
          delivery_slot?: string | null;
          delivery_type?: string | null;
          discount_amount?: number;
          gift_message?: string | null;
          gift_recipient_name?: string | null;
          id?: string;
          is_gift?: boolean;
          order_number?: string;
          payment_method?: string;
          payment_reference?: string | null;
          payment_status?: string;
          status?: string;
          subtotal?: number;
          total_amount?: number;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          price_multiplier: number;
          product_id: string;
          serves: string;
          sort_order: number;
          weight: string;
        };
        Insert: {
          id?: string;
          price_multiplier?: number;
          product_id: string;
          serves?: string;
          sort_order?: number;
          weight: string;
        };
        Update: {
          id?: string;
          price_multiplier?: number;
          product_id?: string;
          serves?: string;
          sort_order?: number;
          weight?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          allergens: string[];
          base_price: number;
          bestseller: boolean;
          category: string;
          category_id: string | null;
          created_at: string;
          default_weight: string;
          delivery_eligibility: string[];
          description: string;
          eggless_available: boolean;
          eggless_price_premium: number;
          flavors: string[];
          id: string;
          images: string[];
          ingredients: string[];
          is_active: boolean;
          name: string;
          rating: number;
          review_count: number;
          sale_price: number | null;
          shelf_life: string;
          sku: string;
          slug: string;
          stock: number;
          subcategories: string[];
          updated_at: string;
        };
        Insert: {
          allergens?: string[];
          base_price: number;
          bestseller?: boolean;
          category: string;
          category_id?: string | null;
          created_at?: string;
          default_weight: string;
          delivery_eligibility?: string[];
          description?: string;
          eggless_available?: boolean;
          eggless_price_premium?: number;
          flavors?: string[];
          id?: string;
          images?: string[];
          ingredients?: string[];
          is_active?: boolean;
          name: string;
          rating?: number;
          review_count?: number;
          sale_price?: number | null;
          shelf_life?: string;
          sku: string;
          slug: string;
          stock?: number;
          subcategories?: string[];
          updated_at?: string;
        };
        Update: {
          allergens?: string[];
          base_price?: number;
          bestseller?: boolean;
          category?: string;
          category_id?: string | null;
          created_at?: string;
          default_weight?: string;
          delivery_eligibility?: string[];
          description?: string;
          eggless_available?: boolean;
          eggless_price_premium?: number;
          flavors?: string[];
          id?: string;
          images?: string[];
          ingredients?: string[];
          is_active?: boolean;
          name?: string;
          rating?: number;
          review_count?: number;
          sale_price?: number | null;
          shelf_life?: string;
          sku?: string;
          slug?: string;
          stock?: number;
          subcategories?: string[];
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      reviews: {
        Row: {
          comment: string;
          created_at: string;
          customer_name: string;
          id: string;
          images: string[];
          is_hidden: boolean;
          order_item_id: string;
          product_id: string;
          rating: number;
        };
        Insert: {
          comment?: string;
          created_at?: string;
          customer_name: string;
          id?: string;
          images?: string[];
          is_hidden?: boolean;
          order_item_id: string;
          product_id: string;
          rating: number;
        };
        Update: {
          comment?: string;
          created_at?: string;
          customer_name?: string;
          id?: string;
          images?: string[];
          is_hidden?: boolean;
          order_item_id?: string;
          product_id?: string;
          rating?: number;
        };
        Relationships: [
          {
            foreignKeyName: "reviews_order_item_id_fkey";
            columns: ["order_item_id"];
            isOneToOne: true;
            referencedRelation: "order_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "reviews_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          accent_color: string;
          announcement_text: string;
          delivery_options: Json;
          featured_product_ids: string[];
          font_pairing: string;
          gifting_collections: Json;
          hero_cta_link: string;
          hero_cta_text: string;
          hero_heading: string;
          hero_image_url: string;
          hero_stats: Json;
          hero_subtitle: string;
          hero_video_url: string | null;
          homepage_sections: NonNullable<Json>;
          id: number;
          ink_color: string;
          ink_soft_color: string;
          ink_variant_color: string;
          line_color: string;
          line_strong_color: string;
          surface_color: string;
          surface_container_color: string;
          surface_high_color: string;
          surface_highest_color: string;
          surface_low_color: string;
          logo_url: string | null;
          primary_color: string;
          trust_badges: Json;
          updated_at: string;
        };
        Insert: {
          accent_color?: string;
          announcement_text?: string;
          delivery_options?: Json;
          featured_product_ids?: string[];
          font_pairing?: string;
          gifting_collections?: Json;
          hero_cta_link?: string;
          hero_cta_text?: string;
          hero_heading?: string;
          hero_image_url?: string;
          hero_stats?: Json;
          hero_subtitle?: string;
          hero_video_url?: string | null;
          homepage_sections?: NonNullable<Json>;
          id?: number;
          ink_color?: string;
          ink_soft_color?: string;
          ink_variant_color?: string;
          line_color?: string;
          line_strong_color?: string;
          surface_color?: string;
          surface_container_color?: string;
          surface_high_color?: string;
          surface_highest_color?: string;
          surface_low_color?: string;
          logo_url?: string | null;
          primary_color?: string;
          trust_badges?: Json;
          updated_at?: string;
        };
        Update: {
          accent_color?: string;
          announcement_text?: string;
          delivery_options?: Json;
          featured_product_ids?: string[];
          font_pairing?: string;
          gifting_collections?: Json;
          hero_cta_link?: string;
          hero_cta_text?: string;
          hero_heading?: string;
          hero_image_url?: string;
          hero_stats?: Json;
          hero_subtitle?: string;
          hero_video_url?: string | null;
          homepage_sections?: NonNullable<Json>;
          id?: number;
          ink_color?: string;
          ink_soft_color?: string;
          ink_variant_color?: string;
          line_color?: string;
          line_strong_color?: string;
          surface_color?: string;
          surface_container_color?: string;
          surface_high_color?: string;
          surface_highest_color?: string;
          surface_low_color?: string;
          logo_url?: string | null;
          primary_color?: string;
          trust_badges?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      wishlist_items: {
        Row: {
          created_at: string;
          id: string;
          product_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          product_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          product_id?: string;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      decrement_stock: {
        Args: { p_order_id: string; p_product_id: string; p_quantity: number };
        Returns: undefined;
      };
      is_order_item_delivered: { Args: { item_id: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;

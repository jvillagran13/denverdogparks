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
  public: {
    Tables: {
      ad_creatives: {
        Row: {
          accent: string
          advertiser: string
          body: string
          color: string
          cta: string
          headline: string
          id: string
          logo_text: string
        }
        Insert: {
          accent: string
          advertiser: string
          body: string
          color: string
          cta: string
          headline: string
          id?: string
          logo_text: string
        }
        Update: {
          accent?: string
          advertiser?: string
          body?: string
          color?: string
          cta?: string
          headline?: string
          id?: string
          logo_text?: string
        }
        Relationships: []
      }
      emergency_vets: {
        Row: {
          address: string
          coords_x: number
          coords_y: number
          hours_24: boolean
          id: string
          name: string
          phone: string
          promoted: boolean
          sponsor_label: string | null
          tagline: string | null
          triage_min: number | null
        }
        Insert: {
          address: string
          coords_x: number
          coords_y: number
          hours_24?: boolean
          id?: string
          name: string
          phone: string
          promoted?: boolean
          sponsor_label?: string | null
          tagline?: string | null
          triage_min?: number | null
        }
        Update: {
          address?: string
          coords_x?: number
          coords_y?: number
          hours_24?: boolean
          id?: string
          name?: string
          phone?: string
          promoted?: boolean
          sponsor_label?: string | null
          tagline?: string | null
          triage_min?: number | null
        }
        Relationships: []
      }
      nearby_resources: {
        Row: {
          distance: number
          hours: string
          id: string
          name: string
          park_slug: string
          promoted: boolean
          type: string
        }
        Insert: {
          distance: number
          hours: string
          id?: string
          name: string
          park_slug: string
          promoted?: boolean
          type: string
        }
        Update: {
          distance?: number
          hours?: string
          id?: string
          name?: string
          park_slug?: string
          promoted?: boolean
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "nearby_resources_park_slug_fkey"
            columns: ["park_slug"]
            isOneToOne: false
            referencedRelation: "parks"
            referencedColumns: ["slug"]
          },
        ]
      }
      park_scores: {
        Row: {
          category: string
          park_slug: string
          value: number
        }
        Insert: {
          category: string
          park_slug: string
          value: number
        }
        Update: {
          category?: string
          park_slug?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "park_scores_park_slug_fkey"
            columns: ["park_slug"]
            isOneToOne: false
            referencedRelation: "parks"
            referencedColumns: ["slug"]
          },
        ]
      }
      parks: {
        Row: {
          acres: number
          blurb: string
          coords_x: number
          coords_y: number
          created_at: string
          crowd: string
          fee: string
          fenced: boolean
          hours: string
          image: string
          name: string
          neighborhood: string
          photo_hue: number
          promoted: boolean
          rating: number
          reviews_count: number
          size: string
          slug: string
          surface: string
          updated_at: string
          water: boolean
        }
        Insert: {
          acres: number
          blurb: string
          coords_x: number
          coords_y: number
          created_at?: string
          crowd: string
          fee: string
          fenced?: boolean
          hours: string
          image: string
          name: string
          neighborhood: string
          photo_hue?: number
          promoted?: boolean
          rating: number
          reviews_count?: number
          size: string
          slug: string
          surface: string
          updated_at?: string
          water?: boolean
        }
        Update: {
          acres?: number
          blurb?: string
          coords_x?: number
          coords_y?: number
          created_at?: string
          crowd?: string
          fee?: string
          fenced?: boolean
          hours?: string
          image?: string
          name?: string
          neighborhood?: string
          photo_hue?: number
          promoted?: boolean
          rating?: number
          reviews_count?: number
          size?: string
          slug?: string
          surface?: string
          updated_at?: string
          water?: boolean
        }
        Relationships: []
      }
      reviews: {
        Row: {
          body: string
          created_at: string
          dog: string
          id: string
          park_slug: string
          rating: number
          time_ago: string
          username: string
        }
        Insert: {
          body: string
          created_at?: string
          dog: string
          id?: string
          park_slug: string
          rating: number
          time_ago: string
          username: string
        }
        Update: {
          body?: string
          created_at?: string
          dog?: string
          id?: string
          park_slug?: string
          rating?: number
          time_ago?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_park_slug_fkey"
            columns: ["park_slug"]
            isOneToOne: false
            referencedRelation: "parks"
            referencedColumns: ["slug"]
          },
        ]
      }
      sponsors: {
        Row: {
          created_at: string
          distance: string
          id: string
          name: string
          park_slug: string
          tagline: string
          type: string
        }
        Insert: {
          created_at?: string
          distance: string
          id?: string
          name: string
          park_slug: string
          tagline: string
          type: string
        }
        Update: {
          created_at?: string
          distance?: string
          id?: string
          name?: string
          park_slug?: string
          tagline?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "sponsors_park_slug_fkey"
            columns: ["park_slug"]
            isOneToOne: true
            referencedRelation: "parks"
            referencedColumns: ["slug"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

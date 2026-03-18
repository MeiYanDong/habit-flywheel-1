export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      habit_completions: {
        Row: {
          completed_at: string
          evidence_type: string | null
          energy_gained: number
          habit_id: string
          id: string
          notes: string | null
          frequency_bucket: string | null
          plan_id_snapshot: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          evidence_type?: string | null
          energy_gained?: number
          habit_id: string
          id?: string
          notes?: string | null
          frequency_bucket?: string | null
          plan_id_snapshot?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string
          evidence_type?: string | null
          energy_gained?: number
          habit_id?: string
          id?: string
          notes?: string | null
          frequency_bucket?: string | null
          plan_id_snapshot?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_completions_plan_id_snapshot_fkey"
            columns: ["plan_id_snapshot"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          binding_reward_id: string | null
          color: string | null
          created_at: string
          description: string | null
          energy_value: number
          frequency: string
          id: string
          is_archived: boolean
          name: string
          target_count: number
          updated_at: string
          user_id: string
        }
        Insert: {
          binding_reward_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          energy_value?: number
          frequency?: string
          id?: string
          is_archived?: boolean
          name: string
          target_count?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          binding_reward_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          energy_value?: number
          frequency?: string
          id?: string
          is_archived?: boolean
          name?: string
          target_count?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_habits_binding_reward"
            columns: ["binding_reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          abandon_reason: string | null
          created_at: string
          current_energy: number
          description: string | null
          energy_cost: number
          id: string
          is_redeemed: boolean
          motivation_note: string | null
          name: string
          plan_type: string
          priority: number
          redeemed_at: string | null
          reflection_note: string | null
          status: string
          target_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          abandon_reason?: string | null
          created_at?: string
          current_energy?: number
          description?: string | null
          energy_cost?: number
          id?: string
          is_redeemed?: boolean
          motivation_note?: string | null
          name: string
          plan_type?: string
          priority?: number
          redeemed_at?: string | null
          reflection_note?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          abandon_reason?: string | null
          created_at?: string
          current_energy?: number
          description?: string | null
          energy_cost?: number
          id?: string
          is_redeemed?: boolean
          motivation_note?: string | null
          name?: string
          plan_type?: string
          priority?: number
          redeemed_at?: string | null
          reflection_note?: string | null
          status?: string
          target_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reward_bindings: {
        Row: {
          allocation_mode: string
          allocation_ratio: number
          created_at: string
          habit_id: string
          id: string
          reward_id: string
          user_id: string
        }
        Insert: {
          allocation_mode?: string
          allocation_ratio?: number
          created_at?: string
          habit_id: string
          id?: string
          reward_id: string
          user_id: string
        }
        Update: {
          allocation_mode?: string
          allocation_ratio?: number
          created_at?: string
          habit_id?: string
          id?: string
          reward_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reward_bindings_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reward_bindings_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_energy: {
        Row: {
          total_energy: number
          updated_at: string
          user_id: string
        }
        Insert: {
          total_energy?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          total_energy?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

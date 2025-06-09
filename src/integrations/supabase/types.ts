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
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          color: string | null
          completed: boolean | null
          created_at: string
          current_amount: number | null
          deadline: string | null
          id: string
          target_amount: number
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          completed?: boolean | null
          created_at?: string
          current_amount?: number | null
          deadline?: string | null
          id?: string
          target_amount: number
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          completed?: boolean | null
          created_at?: string
          current_amount?: number | null
          deadline?: string | null
          id?: string
          target_amount?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      income: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date?: string
          description: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          current_value: number | null
          id: string
          name: string
          purchase_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          current_value?: number | null
          id?: string
          name: string
          purchase_date?: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          current_value?: number | null
          id?: string
          name?: string
          purchase_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          points_earned: number | null
          unlocked_at: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          points_earned?: number | null
          unlocked_at?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          points_earned?: number | null
          unlocked_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_stats: {
        Row: {
          created_at: string
          current_streak: number | null
          last_activity: string | null
          level: number | null
          longest_streak: number | null
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          last_activity?: string | null
          level?: number | null
          longest_streak?: number | null
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          last_activity?: string | null
          level?: number | null
          longest_streak?: number | null
          total_points?: number | null
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
      award_achievement: {
        Args: { p_user_id: string; p_achievement_id: string; p_points: number }
        Returns: boolean
      }
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

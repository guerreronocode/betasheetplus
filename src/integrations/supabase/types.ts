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
      achievement_definitions: {
        Row: {
          category: string
          created_at: string
          criteria: Json
          description: string
          icon: string
          id: string
          is_active: boolean | null
          points: number
          title: string
        }
        Insert: {
          category: string
          created_at?: string
          criteria: Json
          description: string
          icon: string
          id: string
          is_active?: boolean | null
          points?: number
          title: string
        }
        Update: {
          category?: string
          created_at?: string
          criteria?: Json
          description?: string
          icon?: string
          id?: string
          is_active?: boolean | null
          points?: number
          title?: string
        }
        Relationships: []
      }
      asset_prices: {
        Row: {
          base_currency: string | null
          change_percent: number | null
          created_at: string
          exchange: string | null
          id: string
          last_update: string
          market_type: string
          price: number
          quote_currency: string | null
          source: string
          symbol: string
          update_date: string
        }
        Insert: {
          base_currency?: string | null
          change_percent?: number | null
          created_at?: string
          exchange?: string | null
          id?: string
          last_update?: string
          market_type?: string
          price: number
          quote_currency?: string | null
          source: string
          symbol: string
          update_date?: string
        }
        Update: {
          base_currency?: string | null
          change_percent?: number | null
          created_at?: string
          exchange?: string | null
          id?: string
          last_update?: string
          market_type?: string
          price?: number
          quote_currency?: string | null
          source?: string
          symbol?: string
          update_date?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          category: string
          created_at: string | null
          current_value: number
          description: string | null
          id: string
          name: string
          purchase_date: string | null
          purchase_value: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          current_value?: number
          description?: string | null
          id?: string
          name: string
          purchase_date?: string | null
          purchase_value?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          current_value?: number
          description?: string | null
          id?: string
          name?: string
          purchase_date?: string | null
          purchase_value?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      bank_accounts: {
        Row: {
          account_type: string
          balance: number
          bank_name: string
          color: string | null
          created_at: string
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type?: string
          balance?: number
          bank_name: string
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          balance?: number
          bank_name?: string
          color?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          bank_account_id: string | null
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
          bank_account_id?: string | null
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
          bank_account_id?: string | null
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      goals: {
        Row: {
          color: string | null
          completed: boolean | null
          created_at: string
          current_amount: number | null
          deadline: string | null
          id: string
          linked_investment_id: string | null
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
          linked_investment_id?: string | null
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
          linked_investment_id?: string | null
          target_amount?: number
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_linked_investment_id_fkey"
            columns: ["linked_investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      income: {
        Row: {
          amount: number
          bank_account_id: string | null
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
          bank_account_id?: string | null
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
          bank_account_id?: string | null
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      interest_rates: {
        Row: {
          id: string
          last_update: string
          rate_type: string
          rate_value: number
          reference_date: string
        }
        Insert: {
          id?: string
          last_update?: string
          rate_type: string
          rate_value: number
          reference_date: string
        }
        Update: {
          id?: string
          last_update?: string
          rate_type?: string
          rate_value?: number
          reference_date?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount: number
          bank_account_id: string | null
          created_at: string
          current_value: number | null
          id: string
          last_yield_update: string | null
          name: string
          purchase_date: string
          type: string
          updated_at: string
          user_id: string
          yield_rate: number | null
          yield_type: string | null
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          created_at?: string
          current_value?: number | null
          id?: string
          last_yield_update?: string | null
          name: string
          purchase_date?: string
          type: string
          updated_at?: string
          user_id: string
          yield_rate?: number | null
          yield_type?: string | null
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          created_at?: string
          current_value?: number | null
          id?: string
          last_yield_update?: string | null
          name?: string
          purchase_date?: string
          type?: string
          updated_at?: string
          user_id?: string
          yield_rate?: number | null
          yield_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      liabilities: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          interest_rate: number | null
          monthly_payment: number | null
          name: string
          remaining_amount: number
          total_amount: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          name: string
          remaining_amount: number
          total_amount: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          interest_rate?: number | null
          monthly_payment?: number | null
          name?: string
          remaining_amount?: number
          total_amount?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      market_data: {
        Row: {
          change_percent: number | null
          current_price: number | null
          data_source: string | null
          id: string
          last_update: string
          market_cap: number | null
          name: string
          symbol: string
          volume: number | null
        }
        Insert: {
          change_percent?: number | null
          current_price?: number | null
          data_source?: string | null
          id?: string
          last_update?: string
          market_cap?: number | null
          name: string
          symbol: string
          volume?: number | null
        }
        Update: {
          change_percent?: number | null
          current_price?: number | null
          data_source?: string | null
          id?: string
          last_update?: string
          market_cap?: number | null
          name?: string
          symbol?: string
          volume?: number | null
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
          consecutive_days_accessed: number | null
          created_at: string
          current_streak: number | null
          goals_completed: number | null
          last_activity: string | null
          level: number | null
          longest_streak: number | null
          positive_balance_days: number | null
          total_points: number | null
          total_transactions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          consecutive_days_accessed?: number | null
          created_at?: string
          current_streak?: number | null
          goals_completed?: number | null
          last_activity?: string | null
          level?: number | null
          longest_streak?: number | null
          positive_balance_days?: number | null
          total_points?: number | null
          total_transactions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          consecutive_days_accessed?: number | null
          created_at?: string
          current_streak?: number | null
          goals_completed?: number | null
          last_activity?: string | null
          level?: number | null
          longest_streak?: number | null
          positive_balance_days?: number | null
          total_points?: number | null
          total_transactions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      yield_rates: {
        Row: {
          created_at: string
          id: string
          last_update: string
          periodicity: string | null
          rate_type: string
          rate_value: number
          reference_date: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_update?: string
          periodicity?: string | null
          rate_type: string
          rate_value: number
          reference_date: string
        }
        Update: {
          created_at?: string
          id?: string
          last_update?: string
          periodicity?: string | null
          rate_type?: string
          rate_value?: number
          reference_date?: string
        }
        Relationships: []
      }
      yield_rates_history: {
        Row: {
          created_at: string | null
          id: string
          rate_type: string
          rate_value: number
          reference_date: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          rate_type: string
          rate_value: number
          reference_date: string
        }
        Update: {
          created_at?: string | null
          id?: string
          rate_type?: string
          rate_value?: number
          reference_date?: string
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
      update_investment_yields: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

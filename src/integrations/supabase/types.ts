export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
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
      budget_categories: {
        Row: {
          budget_id: string
          category: string
          created_at: string
          id: string
          planned_amount: number
          updated_at: string
        }
        Insert: {
          budget_id: string
          category: string
          created_at?: string
          id?: string
          planned_amount: number
          updated_at?: string
        }
        Update: {
          budget_id?: string
          category?: string
          created_at?: string
          id?: string
          planned_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_categories_budget_id_fkey"
            columns: ["budget_id"]
            isOneToOne: false
            referencedRelation: "budgets"
            referencedColumns: ["id"]
          },
        ]
      }
      budgets: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          period_date: string
          period_type: string
          total_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          period_date: string
          period_type: string
          total_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          period_date?: string
          period_type?: string
          total_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      credit_card_bills: {
        Row: {
          bill_month: string
          closing_date: string
          created_at: string
          credit_card_id: string
          due_date: string
          id: string
          is_paid: boolean
          paid_account_id: string | null
          paid_at: string | null
          paid_date: string | null
          payment_account_id: string | null
          total_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          bill_month: string
          closing_date: string
          created_at?: string
          credit_card_id: string
          due_date: string
          id?: string
          is_paid?: boolean
          paid_account_id?: string | null
          paid_at?: string | null
          paid_date?: string | null
          payment_account_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          bill_month?: string
          closing_date?: string
          created_at?: string
          credit_card_id?: string
          due_date?: string
          id?: string
          is_paid?: boolean
          paid_account_id?: string | null
          paid_at?: string | null
          paid_date?: string | null
          payment_account_id?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_card_bills_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_card_bills_paid_account_id_fkey"
            columns: ["paid_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_card_bills_payment_account_id_fkey"
            columns: ["payment_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_card_installments: {
        Row: {
          amount: number
          bill_month: string
          created_at: string
          credit_card_id: string
          due_date: string
          id: string
          installment_number: number
          is_paid: boolean
          paid_at: string | null
          payment_account_id: string | null
          purchase_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bill_month: string
          created_at?: string
          credit_card_id: string
          due_date: string
          id?: string
          installment_number: number
          is_paid?: boolean
          paid_at?: string | null
          payment_account_id?: string | null
          purchase_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bill_month?: string
          created_at?: string
          credit_card_id?: string
          due_date?: string
          id?: string
          installment_number?: number
          is_paid?: boolean
          paid_at?: string | null
          payment_account_id?: string | null
          purchase_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_card_installments_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_card_installments_payment_account_id_fkey"
            columns: ["payment_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "credit_card_installments_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "credit_card_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_card_purchases: {
        Row: {
          amount: number
          category: string
          created_at: string
          credit_card_id: string
          description: string
          id: string
          installments: number
          purchase_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          credit_card_id: string
          description: string
          id?: string
          installments?: number
          purchase_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          credit_card_id?: string
          description?: string
          id?: string
          installments?: number
          purchase_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_card_purchases_credit_card_id_fkey"
            columns: ["credit_card_id"]
            isOneToOne: false
            referencedRelation: "credit_cards"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_cards: {
        Row: {
          add_to_net_worth: boolean
          closing_day: number
          created_at: string
          credit_limit: number
          due_day: number
          id: string
          include_in_patrimony: boolean
          is_active: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          add_to_net_worth?: boolean
          closing_day: number
          created_at?: string
          credit_limit?: number
          due_day: number
          id?: string
          include_in_patrimony?: boolean
          is_active?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          add_to_net_worth?: boolean
          closing_day?: number
          created_at?: string
          credit_limit?: number
          due_day?: number
          id?: string
          include_in_patrimony?: boolean
          is_active?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      debts: {
        Row: {
          category: string | null
          created_at: string
          creditor: string
          description: string
          due_date: string
          financed_amount: number
          id: string
          installment_value: number
          notes: string | null
          paid_installments: number
          remaining_balance: number
          start_date: string
          status: string
          total_debt_amount: number
          total_installments: number
          total_interest_amount: number
          total_interest_percentage: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          creditor: string
          description: string
          due_date: string
          financed_amount: number
          id?: string
          installment_value: number
          notes?: string | null
          paid_installments?: number
          remaining_balance: number
          start_date: string
          status: string
          total_debt_amount: number
          total_installments: number
          total_interest_amount: number
          total_interest_percentage: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          creditor?: string
          description?: string
          due_date?: string
          financed_amount?: number
          id?: string
          installment_value?: number
          notes?: string | null
          paid_installments?: number
          remaining_balance?: number
          start_date?: string
          status?: string
          total_debt_amount?: number
          total_installments?: number
          total_interest_amount?: number
          total_interest_percentage?: number
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
          recurring_transaction_id: string | null
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
          recurring_transaction_id?: string | null
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
          recurring_transaction_id?: string | null
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
          {
            foreignKeyName: "expenses_recurring_transaction_id_fkey"
            columns: ["recurring_transaction_id"]
            isOneToOne: false
            referencedRelation: "recurring_transactions"
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
          recurring_transaction_id: string | null
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
          recurring_transaction_id?: string | null
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
          recurring_transaction_id?: string | null
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
          {
            foreignKeyName: "income_recurring_transaction_id_fkey"
            columns: ["recurring_transaction_id"]
            isOneToOne: false
            referencedRelation: "recurring_transactions"
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
      investment_plans: {
        Row: {
          created_at: string
          emergency_reserve_current: number
          emergency_reserve_target: number
          id: string
          is_emergency_reserve_complete: boolean
          long_term_allocation: number
          medium_term_allocation: number
          monthly_investment_capacity: number
          profile_id: string
          short_term_allocation: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          emergency_reserve_current?: number
          emergency_reserve_target?: number
          id?: string
          is_emergency_reserve_complete?: boolean
          long_term_allocation?: number
          medium_term_allocation?: number
          monthly_investment_capacity?: number
          profile_id: string
          short_term_allocation?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          emergency_reserve_current?: number
          emergency_reserve_target?: number
          id?: string
          is_emergency_reserve_complete?: boolean
          long_term_allocation?: number
          medium_term_allocation?: number
          monthly_investment_capacity?: number
          profile_id?: string
          short_term_allocation?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_plans_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "investment_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_profiles: {
        Row: {
          age: number
          created_at: string
          employment_type: string
          id: string
          long_term_goals: string[] | null
          main_objective: string
          medium_term_goals: string[] | null
          monthly_expenses: number
          monthly_income: number
          organization_level: string
          risk_profile: string
          short_term_goals: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          age: number
          created_at?: string
          employment_type?: string
          id?: string
          long_term_goals?: string[] | null
          main_objective: string
          medium_term_goals?: string[] | null
          monthly_expenses?: number
          monthly_income?: number
          organization_level: string
          risk_profile: string
          short_term_goals?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          age?: number
          created_at?: string
          employment_type?: string
          id?: string
          long_term_goals?: string[] | null
          main_objective?: string
          medium_term_goals?: string[] | null
          monthly_expenses?: number
          monthly_income?: number
          organization_level?: string
          risk_profile?: string
          short_term_goals?: string[] | null
          updated_at?: string
          user_id?: string
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
          liquidity: string | null
          maturity_date: string | null
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
          liquidity?: string | null
          maturity_date?: string | null
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
          liquidity?: string | null
          maturity_date?: string | null
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
      monthly_objectives: {
        Row: {
          calculation_type: string
          category: string | null
          completed_at: string | null
          created_at: string
          current_percentage: number | null
          current_value: number | null
          description: string | null
          id: string
          is_active: boolean
          month: string
          objective_type: string
          related_data: Json | null
          status: string
          target_percentage: number | null
          target_value: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          calculation_type: string
          category?: string | null
          completed_at?: string | null
          created_at?: string
          current_percentage?: number | null
          current_value?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          month: string
          objective_type: string
          related_data?: Json | null
          status?: string
          target_percentage?: number | null
          target_value?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          calculation_type?: string
          category?: string | null
          completed_at?: string | null
          created_at?: string
          current_percentage?: number | null
          current_value?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          month?: string
          objective_type?: string
          related_data?: Json | null
          status?: string
          target_percentage?: number | null
          target_value?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      planned_income: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          month: string
          planned_amount: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          month: string
          planned_amount: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          month?: string
          planned_amount?: number
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
      recurring_transactions: {
        Row: {
          amount: number
          bank_account_id: string | null
          category: string
          created_at: string
          description: string
          end_date: string | null
          frequency: string
          id: string
          is_active: boolean
          start_date: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id?: string | null
          category: string
          created_at?: string
          description: string
          end_date?: string | null
          frequency: string
          id?: string
          is_active?: boolean
          start_date: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string | null
          category?: string
          created_at?: string
          description?: string
          end_date?: string | null
          frequency?: string
          id?: string
          is_active?: boolean
          start_date?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recurring_transactions_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
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
      calculate_actual_spending: {
        Args: {
          p_user_id: string
          p_period_start: string
          p_period_end: string
          p_category?: string
        }
        Returns: number
      }
      calculate_bill_month: {
        Args: { purchase_date: string; closing_day: number }
        Returns: string
      }
      calculate_credit_cards_patrimony: {
        Args: { p_user_id: string }
        Returns: number
      }
      calculate_objective_progress: {
        Args: { p_user_id: string; p_month: string; p_objective_id: string }
        Returns: undefined
      }
      calculate_projected_credit_limit: {
        Args: { p_credit_card_id: string; p_months_ahead?: number }
        Returns: {
          month: string
          projected_available_limit: number
        }[]
      }
      sync_credit_card_debts_to_patrimony: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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

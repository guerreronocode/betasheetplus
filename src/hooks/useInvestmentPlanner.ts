
import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface InvestmentProfile {
  id?: string;
  user_id?: string;
  age: number;
  main_objective: string;
  risk_profile: 'conservative' | 'moderate' | 'aggressive';
  organization_level: 'no_reserve' | 'building_reserve' | 'reserve_completed';
  employment_type: 'clt' | 'civil_servant' | 'freelancer' | 'entrepreneur';
  monthly_income: number;
  monthly_expenses: number;
  short_term_goals: string[];
  medium_term_goals: string[];
  long_term_goals: string[];
  created_at?: string;
  updated_at?: string;
}

export interface InvestmentPlan {
  id?: string;
  profile_id: string;
  emergency_reserve_target: number;
  emergency_reserve_current: number;
  short_term_allocation: number;
  medium_term_allocation: number;
  long_term_allocation: number;
  monthly_investment_capacity: number;
  is_emergency_reserve_complete: boolean;
  created_at?: string;
  updated_at?: string;
}

export const useInvestmentPlanner = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [currentStep, setCurrentStep] = useState<'profile' | 'reserve' | 'plan' | 'summary'>('profile');

  // Buscar perfil existente
  const {
    data: profile,
    isLoading: isLoadingProfile,
    error: profileError
  } = useQuery({
    queryKey: ['investment-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('investment_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching investment profile:', error);
        throw error;
      }

      return data as InvestmentProfile | null;
    },
    enabled: !!user,
  });

  // Buscar plano existente
  const {
    data: plan,
    isLoading: isLoadingPlan,
    error: planError
  } = useQuery({
    queryKey: ['investment-plan', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return null;

      const { data, error } = await supabase
        .from('investment_plans')
        .select('*')
        .eq('profile_id', profile.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching investment plan:', error);
        throw error;
      }

      return data as InvestmentPlan | null;
    },
    enabled: !!profile?.id,
  });

  // Salvar perfil
  const saveProfileMutation = useMutation({
    mutationFn: async (profileData: Omit<InvestmentProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');

      const payload = {
        ...profileData,
        user_id: user.id,
      };

      if (profile?.id) {
        const { data, error } = await supabase
          .from('investment_profiles')
          .update(payload)
          .eq('id', profile.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating investment profile:', error);
          throw error;
        }
        return data;
      } else {
        const { data, error } = await supabase
          .from('investment_profiles')
          .insert([payload])
          .select()
          .single();

        if (error) {
          console.error('Error creating investment profile:', error);
          throw error;
        }
        return data;
      }
    },
    onSuccess: (data) => {
      console.log('Profile saved successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['investment-profile'] });
      setCurrentStep('reserve');
    },
    onError: (error) => {
      console.error('Error saving profile:', error);
    }
  });

  // Salvar plano
  const savePlanMutation = useMutation({
    mutationFn: async (planData: Omit<InvestmentPlan, 'id' | 'created_at' | 'updated_at'>) => {
      if (!profile?.id) throw new Error('Profile not found');

      const payload = {
        ...planData,
        profile_id: profile.id,
      };

      if (plan?.id) {
        const { data, error } = await supabase
          .from('investment_plans')
          .update(payload)
          .eq('id', plan.id)
          .select()
          .single();

        if (error) {
          console.error('Error updating investment plan:', error);
          throw error;
        }
        return data;
      } else {
        const { data, error } = await supabase
          .from('investment_plans')
          .insert([payload])
          .select()
          .single();

        if (error) {
          console.error('Error creating investment plan:', error);
          throw error;
        }
        return data;
      }
    },
    onSuccess: (data) => {
      console.log('Plan saved successfully:', data);
      queryClient.invalidateQueries({ queryKey: ['investment-plan'] });
      setCurrentStep('summary');
    },
    onError: (error) => {
      console.error('Error saving plan:', error);
    }
  });

  // Cálculos do planejador
  const calculations = useMemo(() => {
    if (!profile) return null;

    const monthlyInvestmentCapacity = Math.max(0, profile.monthly_income - profile.monthly_expenses);

    // Cálculo da reserva de emergência baseado no tipo de emprego
    let emergencyReserveMultiplier = 6; // Padrão CLT
    
    if (profile.employment_type === 'freelancer' || profile.employment_type === 'entrepreneur') {
      emergencyReserveMultiplier = 18; // Autônomo/Empreendedor
    } else if (profile.employment_type === 'civil_servant') {
      emergencyReserveMultiplier = 6; // Concursado
    } else if (profile.employment_type === 'clt') {
      emergencyReserveMultiplier = 6; // CLT padrão (usuário pode ajustar)
    }

    const emergencyReserveTarget = profile.monthly_expenses * emergencyReserveMultiplier;

    // Sugestões de alocação baseadas no perfil de risco
    let shortTermAllocation = 10;
    let mediumTermAllocation = 20;
    let longTermAllocation = 70;

    if (profile.risk_profile === 'conservative') {
      shortTermAllocation = 20;
      mediumTermAllocation = 30;
      longTermAllocation = 50;
    } else if (profile.risk_profile === 'aggressive') {
      shortTermAllocation = 5;
      mediumTermAllocation = 15;
      longTermAllocation = 80;
    }

    return {
      monthlyInvestmentCapacity,
      emergencyReserveTarget,
      emergencyReserveMultiplier,
      shortTermAllocation,
      mediumTermAllocation,
      longTermAllocation,
    };
  }, [profile]);

  // Função para navegar entre as etapas com validação
  const navigateToStep = (step: 'profile' | 'reserve' | 'plan' | 'summary') => {
    console.log('Navigating to step:', step);
    
    // Verificar se pode navegar para a etapa desejada
    if (step === 'reserve' && !profile) {
      console.warn('Cannot navigate to reserve without profile');
      return;
    }
    
    if (step === 'plan' && !profile) {
      console.warn('Cannot navigate to plan without profile');
      return;
    }
    
    if (step === 'summary' && (!profile || !plan)) {
      console.warn('Cannot navigate to summary without profile and plan');
      return;
    }
    
    setCurrentStep(step);
  };

  return {
    // Estado
    currentStep,
    setCurrentStep: navigateToStep,
    profile,
    plan,
    calculations,

    // Loading states
    isLoadingProfile,
    isLoadingPlan,
    isLoading: isLoadingProfile || isLoadingPlan,

    // Errors
    profileError,
    planError,
    error: profileError || planError,

    // Mutations
    saveProfile: saveProfileMutation.mutate,
    savePlan: savePlanMutation.mutate,
    isSavingProfile: saveProfileMutation.isPending,
    isSavingPlan: savePlanMutation.isPending,
    isSaving: saveProfileMutation.isPending || savePlanMutation.isPending,

    // Helpers
    hasProfile: !!profile,
    hasPlan: !!plan,
    isEmergencyReserveComplete: plan?.is_emergency_reserve_complete || false,
  };
};

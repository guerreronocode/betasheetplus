
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserStats {
  user_id: string;
  level: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  last_activity: string;
  consecutive_days_accessed: number;
  total_transactions: number;
  positive_balance_days: number;
  goals_completed: number;
}

export interface Achievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  points_earned: number;
}

export interface AchievementDefinition {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  icon: string;
  criteria: any;
}

export const useUserStats = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user_stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      // Transform data to match our UserStats interface
      return {
        user_id: data.user_id,
        level: data.level || 1,
        total_points: data.total_points || 0,
        current_streak: data.current_streak || 0,
        longest_streak: data.longest_streak || 0,
        last_activity: data.last_activity || new Date().toISOString().split('T')[0],
        consecutive_days_accessed: (data as any).consecutive_days_accessed || 0,
        total_transactions: (data as any).total_transactions || 0,
        positive_balance_days: (data as any).positive_balance_days || 0,
        goals_completed: (data as any).goals_completed || 0,
      } as UserStats;
    },
    enabled: !!user,
  });

  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['user_achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      return data as Achievement[];
    },
    enabled: !!user,
  });

  // Achievement definitions - using RPC to access new table
  const { data: achievementDefinitions = [], isLoading: definitionsLoading } = useQuery({
    queryKey: ['achievement_definitions'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_achievement_definitions');
      if (error) {
        console.log('Error fetching achievement definitions:', error);
        return [];
      }
      return (data || []) as AchievementDefinition[];
    },
  });

  const awardAchievementMutation = useMutation({
    mutationFn: async ({ achievement_id, points }: { achievement_id: string; points: number }) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase.rpc('award_achievement', {
        p_user_id: user.id,
        p_achievement_id: achievement_id,
        p_points: points
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
      queryClient.invalidateQueries({ queryKey: ['user_achievements'] });
    },
  });

  const updateUserStatsMutation = useMutation({
    mutationFn: async (updates: Partial<UserStats>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('user_stats')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
    },
  });

  // Group achievements by category for easier display
  const achievementsByCategory = achievementDefinitions.reduce((acc, def) => {
    if (!acc[def.category]) {
      acc[def.category] = [];
    }
    acc[def.category].push(def);
    return acc;
  }, {} as Record<string, AchievementDefinition[]>);

  // Get unlocked achievement IDs for quick lookup
  const unlockedAchievementIds = new Set(achievements.map(a => a.achievement_id));

  return {
    userStats,
    achievements,
    achievementDefinitions,
    achievementsByCategory,
    unlockedAchievementIds,
    isLoading: statsLoading || achievementsLoading || definitionsLoading,
    awardAchievement: awardAchievementMutation.mutate,
    updateUserStats: updateUserStatsMutation.mutate,
    isAwarding: awardAchievementMutation.isPending,
    isUpdatingStats: updateUserStatsMutation.isPending,
  };
};

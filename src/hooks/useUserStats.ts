
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
}

export interface Achievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
  points_earned: number;
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
      return data as UserStats;
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

  return {
    userStats,
    achievements,
    isLoading: statsLoading || achievementsLoading,
    awardAchievement: awardAchievementMutation.mutate,
    isAwarding: awardAchievementMutation.isPending,
  };
};

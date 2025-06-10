
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface UserStats {
  user_id: string;
  level: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  consecutive_days_accessed: number;
  total_transactions: number;
  positive_balance_days: number;
  goals_completed: number;
  last_activity: string;
  created_at: string;
  updated_at: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: string;
  points: number;
  icon: string;
  criteria: any;
  is_active: boolean;
  unlocked_at?: string;
  points_earned?: number;
}

export const useGamification = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user_stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as UserStats;
    },
    enabled: !!user,
  });

  // Fetch user achievements
  const { data: userAchievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['user_achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement_definitions (
            id,
            title,
            description,
            category,
            points,
            icon,
            criteria,
            is_active
          )
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });
      
      if (error) throw error;
      return data.map(item => ({
        ...item.achievement_definitions,
        unlocked_at: item.unlocked_at,
        points_earned: item.points_earned
      })) as Achievement[];
    },
    enabled: !!user,
  });

  // Fetch all available achievements
  const { data: allAchievements = [] } = useQuery({
    queryKey: ['achievement_definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      
      if (error) throw error;
      return data as Achievement[];
    },
  });

  // Award achievement mutation
  const awardAchievementMutation = useMutation({
    mutationFn: async ({ achievementId, points }: { achievementId: string; points: number }) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc('award_achievement', {
        p_user_id: user.id,
        p_achievement_id: achievementId,
        p_points: points
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: (awarded, variables) => {
      if (awarded) {
        queryClient.invalidateQueries({ queryKey: ['user_stats'] });
        queryClient.invalidateQueries({ queryKey: ['user_achievements'] });
        
        const achievement = allAchievements.find(a => a.id === variables.achievementId);
        if (achievement) {
          toast({
            title: '🏆 Conquista Desbloqueada!',
            description: `${achievement.title} - ${achievement.description} (+${variables.points} pontos)`,
          });
        }
      }
    },
  });

  // Update user stats mutation
  const updateStatsMutation = useMutation({
    mutationFn: async (updates: Partial<UserStats>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('user_stats')
        .upsert({
          user_id: user.id,
          ...updates,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user_stats'] });
    },
  });

  // Check and award achievements based on user activity
  const checkAchievements = async (activityType: string, data?: any) => {
    if (!user || !userStats) return;

    // Check for achievements based on activity type
    for (const achievement of allAchievements) {
      const criteria = achievement.criteria;
      const isAlreadyUnlocked = userAchievements.some(ua => ua.id === achievement.id);
      
      if (isAlreadyUnlocked) continue;

      let shouldAward = false;

      switch (criteria.type) {
        case 'first_transaction':
          if (activityType === 'transaction' && criteria.transaction_type === data?.type) {
            shouldAward = true;
          }
          break;
        
        case 'first_goal':
          if (activityType === 'goal_created') {
            shouldAward = true;
          }
          break;
        
        case 'transaction_count':
          if (userStats.total_transactions >= criteria.count) {
            shouldAward = true;
          }
          break;
        
        case 'consecutive_days':
          if (userStats.consecutive_days_accessed >= criteria.days) {
            shouldAward = true;
          }
          break;
        
        case 'positive_balance_days':
          if (userStats.positive_balance_days >= criteria.days) {
            shouldAward = true;
          }
          break;
        
        case 'goals_completed':
          if (userStats.goals_completed >= criteria.count) {
            shouldAward = true;
          }
          break;
        
        // Add more achievement criteria as needed
      }

      if (shouldAward) {
        await awardAchievementMutation.mutateAsync({
          achievementId: achievement.id,
          points: achievement.points
        });
      }
    }
  };

  // Track user activity
  const trackActivity = async (activityType: string, data?: any) => {
    if (!user || !userStats) return;

    const updates: Partial<UserStats> = {
      last_activity: new Date().toISOString().split('T')[0]
    };

    switch (activityType) {
      case 'transaction':
        updates.total_transactions = (userStats.total_transactions || 0) + 1;
        break;
      
      case 'goal_completed':
        updates.goals_completed = (userStats.goals_completed || 0) + 1;
        break;
      
      case 'daily_access':
        const lastActivity = userStats.last_activity ? new Date(userStats.last_activity) : null;
        const today = new Date();
        
        if (!lastActivity || lastActivity.toDateString() !== today.toDateString()) {
          const daysDiff = lastActivity ? 
            Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24)) : 0;
          
          if (daysDiff === 1) {
            updates.current_streak = (userStats.current_streak || 0) + 1;
            updates.consecutive_days_accessed = (userStats.consecutive_days_accessed || 0) + 1;
          } else if (daysDiff > 1) {
            updates.current_streak = 1;
            updates.consecutive_days_accessed = (userStats.consecutive_days_accessed || 0) + 1;
          }
          
          updates.longest_streak = Math.max(
            userStats.longest_streak || 0, 
            updates.current_streak || 0
          );
        }
        break;
    }

    await updateStatsMutation.mutateAsync(updates);
    await checkAchievements(activityType, data);
  };

  return {
    userStats,
    userAchievements,
    allAchievements,
    isLoading: statsLoading || achievementsLoading,
    trackActivity,
    checkAchievements,
    awardAchievement: awardAchievementMutation.mutate,
    updateStats: updateStatsMutation.mutate
  };
};

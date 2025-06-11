
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  points: number;
  unlocked_at?: string;
  category: string;
  points_earned?: number;
}

export interface UserStats {
  level: number;
  total_points: number;
  current_streak: number;
  longest_streak: number;
  goals_completed: number;
  total_transactions: number;
  positive_balance_days: number;
  consecutive_days_accessed: number;
}

export const useGamification = () => {
  const { user } = useAuth();

  // Get user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user_stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      // Return default stats if no record exists
      return data || {
        level: 1,
        total_points: 0,
        current_streak: 0,
        longest_streak: 0,
        goals_completed: 0,
        total_transactions: 0,
        positive_balance_days: 0,
        consecutive_days_accessed: 0
      };
    },
    enabled: !!user,
  });

  // Get user achievements
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['user_achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      // Transform to Achievement format
      return (data || []).map(item => ({
        id: item.achievement_id,
        title: `Achievement ${item.achievement_id}`,
        description: `You earned this achievement!`,
        icon: '🏆',
        points: item.points_earned || 0,
        points_earned: item.points_earned || 0,
        unlocked_at: item.unlocked_at,
        category: 'general'
      })) as Achievement[];
    },
    enabled: !!user,
  });

  // Get achievement definitions (available achievements)
  const { data: availableAchievements = [] } = useQuery({
    queryKey: ['achievement_definitions'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-achievement-definitions');
      if (error) {
        console.log('Error fetching achievement definitions:', error);
        return [];
      }
      return data || [];
    },
  });

  // Calculate level from points
  const calculateLevel = (points: number) => {
    return Math.floor(points / 100) + 1;
  };

  // Calculate points needed for next level
  const getPointsForNextLevel = (currentPoints: number) => {
    const currentLevel = calculateLevel(currentPoints);
    const nextLevelPoints = currentLevel * 100;
    return nextLevelPoints - currentPoints;
  };

  // Calculate progress to next level
  const getLevelProgress = (currentPoints: number) => {
    const currentLevel = calculateLevel(currentPoints);
    const pointsInCurrentLevel = currentPoints - ((currentLevel - 1) * 100);
    return (pointsInCurrentLevel / 100) * 100;
  };

  // Track activity function
  const trackActivity = (activityType: string) => {
    if (!user) return;
    
    try {
      console.log(`Tracking activity: ${activityType} for user ${user.id}`);
      // For now, just log the activity - can be expanded later
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  return {
    userStats: userStats as UserStats | null,
    achievements,
    availableAchievements,
    isLoading: statsLoading || achievementsLoading,
    calculateLevel,
    getPointsForNextLevel,
    getLevelProgress,
    trackActivity,
  };
};


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

  // Get user achievements - simplified query to avoid relationship issues
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['user_achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        // First get user achievements
        const { data: userAchievements, error: userError } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id)
          .order('unlocked_at', { ascending: false });
        
        if (userError) {
          console.log('Error fetching user achievements:', userError);
          return [];
        }

        // Then get achievement definitions separately
        const { data: definitions, error: defError } = await supabase
          .from('achievement_definitions')
          .select('*');
        
        if (defError) {
          console.log('Error fetching achievement definitions:', defError);
          return [];
        }

        // Combine the data manually
        return (userAchievements || []).map(userAchievement => {
          const definition = definitions?.find(def => def.id === userAchievement.achievement_id);
          
          return {
            id: userAchievement.achievement_id,
            title: definition?.title || `Conquista ${userAchievement.achievement_id}`,
            description: definition?.description || 'Conquista desbloqueada!',
            icon: definition?.icon || '🏆',
            points: definition?.points || userAchievement.points_earned || 0,
            points_earned: userAchievement.points_earned || 0,
            unlocked_at: userAchievement.unlocked_at,
            category: definition?.category || 'general'
          };
        }) as Achievement[];
      } catch (error) {
        console.log('Error in achievements query:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  // Get achievement definitions (available achievements)
  const { data: availableAchievements = [] } = useQuery({
    queryKey: ['achievement_definitions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievement_definitions')
        .select('*')
        .eq('is_active', true);
      
      if (error) {
        console.log('Error fetching achievement definitions:', error);
        return [];
      }
      return data || [];
    },
  });

  // Correct level calculation - each level requires 100 points more than the previous
  const calculateLevel = (points: number) => {
    if (points <= 0) return 1;
    return Math.floor(Math.sqrt(points / 50)) + 1;
  };

  // Calculate points needed for next level
  const getPointsForNextLevel = (currentPoints: number) => {
    const currentLevel = calculateLevel(currentPoints);
    const pointsNeededForNextLevel = Math.pow(currentLevel, 2) * 50;
    return pointsNeededForNextLevel - currentPoints;
  };

  // Calculate progress to next level (0-100%)
  const getLevelProgress = (currentPoints: number) => {
    const currentLevel = calculateLevel(currentPoints);
    const pointsForCurrentLevel = Math.pow(currentLevel - 1, 2) * 50;
    const pointsForNextLevel = Math.pow(currentLevel, 2) * 50;
    const pointsInCurrentLevel = currentPoints - pointsForCurrentLevel;
    const pointsNeededForLevel = pointsForNextLevel - pointsForCurrentLevel;
    
    return Math.min((pointsInCurrentLevel / pointsNeededForLevel) * 100, 100);
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

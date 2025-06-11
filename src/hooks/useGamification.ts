
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useGamification = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Create initial user stats
        const { data: newStats, error: createError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            level: 1,
            total_points: 0,
            current_streak: 0,
            best_streak: 0,
            goals_completed: 0,
            achievements_unlocked: 0
          })
          .select()
          .single();

        if (createError) throw createError;
        return newStats;
      }
      
      return data;
    }
  });

  // Fetch user achievements
  const { data: userAchievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['userAchievements'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          *,
          achievement_definitions (
            title,
            description,
            icon,
            points,
            category
          )
        `)
        .eq('user_id', user.id)
        .order('unlocked_at', { ascending: false });

      if (error) throw error;
      
      return data.map(ua => ({
        id: ua.id,
        title: ua.achievement_definitions?.title || '',
        description: ua.achievement_definitions?.description || '',
        icon: ua.achievement_definitions?.icon || '🏆',
        points_earned: ua.achievement_definitions?.points || 0,
        unlocked_at: ua.unlocked_at,
        category: ua.achievement_definitions?.category || 'general'
      }));
    }
  });

  // Track activity mutation
  const trackActivityMutation = useMutation({
    mutationFn: async (activityType: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Call the track activity function
      const { data, error } = await supabase.rpc('track_user_activity', {
        p_user_id: user.id,
        p_activity_type: activityType
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      // Invalidate and refetch user stats and achievements
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
      queryClient.invalidateQueries({ queryKey: ['userAchievements'] });
      
      // Show toast for new achievements
      if (data && Array.isArray(data) && data.length > 0) {
        data.forEach((achievement: any) => {
          toast({
            title: '🎉 Nova Conquista!',
            description: `${achievement.title} - +${achievement.points} pontos`
          });
        });
      }
    }
  });

  const trackActivity = (activityType: string) => {
    trackActivityMutation.mutate(activityType);
  };

  return {
    userStats,
    userAchievements,
    trackActivity,
    isLoading: statsLoading || achievementsLoading,
    isTrackingActivity: trackActivityMutation.isPending
  };
};

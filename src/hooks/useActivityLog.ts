import { useQuery } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { ActivityLog } from '../types';
import { INITIAL_ACTIVITY_LOGS } from '../lib/mockData';

const ACTIVITY_STORAGE_KEY = 'vs_studio_activity_log';

function getStoredLogs(): ActivityLog[] {
  const stored = localStorage.getItem(ACTIVITY_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(ACTIVITY_STORAGE_KEY, JSON.stringify(INITIAL_ACTIVITY_LOGS));
  return INITIAL_ACTIVITY_LOGS;
}

export function useActivityLog(limit = 20) {
  return useQuery({
    queryKey: ['activity_log', limit],
    queryFn: async (): Promise<ActivityLog[]> => {
      if (!isSupabaseConfigured) {
        return getStoredLogs().slice(0, limit);
      }

      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching activity log from Supabase:', error);
        return getStoredLogs().slice(0, limit);
      }
      return data as ActivityLog[];
    },
  });
}

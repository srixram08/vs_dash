import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Task, TaskStatus, TaskPriority } from '../types';
import { INITIAL_TASKS } from '../lib/mockData';

const TASKS_STORAGE_KEY = 'vs_studio_tasks';

function getStoredTasks(): Task[] {
  const stored = localStorage.getItem(TASKS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(INITIAL_TASKS));
  return INITIAL_TASKS;
}

function setStoredTasks(data: Task[]) {
  localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(data));
}

export function useTasks(projectId?: string) {
  const queryClient = useQueryClient();
  const queryKey = projectId ? ['tasks', projectId] : ['tasks'];

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<Task[]> => {
      if (!isSupabaseConfigured) {
        const allTasks = getStoredTasks();
        if (projectId) {
          return allTasks.filter((t) => t.project_id === projectId);
        }
        return allTasks;
      }

      let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching tasks from Supabase:', error);
        return [];
      }
      return data as Task[];
    },
  });

  // Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        queryClient.invalidateQueries({ queryKey: ['tasks'] });
        queryClient.invalidateQueries({ queryKey: ['overview_metrics'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Update Status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: TaskStatus }) => {
      if (!isSupabaseConfigured) {
        const current = getStoredTasks();
        const updated = current.map((t) =>
          t.id === id ? { ...t, status, updated_at: new Date().toISOString() } : t
        );
        setStoredTasks(updated);
        return updated.find((t) => t.id === id);
      }

      const { data, error } = await supabase
        .from('tasks')
        .update({ status, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['overview_metrics'] });
    },
  });

  // Create Task
  const createTaskMutation = useMutation({
    mutationFn: async (newTask: Omit<Task, 'id' | 'created_at' | 'updated_at'>) => {
      if (!isSupabaseConfigured) {
        const current = getStoredTasks();
        const created: Task = {
          ...newTask,
          id: `t-${Date.now().toString(36)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setStoredTasks([created, ...current]);
        return created;
      }

      const { data, error } = await supabase.from('tasks').insert(newTask as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['overview_metrics'] });
    },
  });

  return {
    tasks,
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    createTask: createTaskMutation.mutateAsync,
  };
}

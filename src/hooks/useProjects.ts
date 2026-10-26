import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Project, ProjectStatus, ProjectWithRelations, Client, Payment } from '../types';
import { INITIAL_PROJECTS, INITIAL_CLIENTS, INITIAL_PAYMENTS } from '../lib/mockData';

const PROJECTS_STORAGE_KEY = 'vs_studio_projects';

function getStoredProjects(): Project[] {
  const stored = localStorage.getItem(PROJECTS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(INITIAL_PROJECTS));
  return INITIAL_PROJECTS;
}

function setStoredProjects(data: Project[]) {
  localStorage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(data));
}

export function useProjects() {
  const queryClient = useQueryClient();
  const queryKey = ['projects'];

  const {
    data: projects = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<ProjectWithRelations[]> => {
      if (!isSupabaseConfigured) {
        const rawProjects = getStoredProjects();
        const clients: Client[] = JSON.parse(
          localStorage.getItem('vs_studio_clients') || JSON.stringify(INITIAL_CLIENTS)
        );
        const payments: Payment[] = JSON.parse(
          localStorage.getItem('vs_studio_payments') || JSON.stringify(INITIAL_PAYMENTS)
        );

        return rawProjects.map((p) => {
          const client = clients.find((c) => c.id === p.client_id);
          const projectPayments = payments.filter((py) => py.project_id === p.id);
          const totalContract = projectPayments.reduce((acc, py) => acc + Number(py.amount), 0);
          const totalPaid = projectPayments
            .filter((py) => py.status === 'paid')
            .reduce((acc, py) => acc + Number(py.amount), 0);
          const outstanding = totalContract - totalPaid;

          return {
            ...p,
            client,
            payments: projectPayments,
            total_contract: totalContract,
            total_paid: totalPaid,
            outstanding_balance: Math.max(0, outstanding),
          };
        });
      }

      // Supabase fetch with joins
      const { data, error } = await supabase
        .from('projects')
        .select('*, client:clients(*), payments(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects from Supabase:', error);
        return [];
      }

      return (data || []).map((p: any) => {
        const payments = p.payments || [];
        const totalContract = payments.reduce((acc: number, py: any) => acc + Number(py.amount), 0);
        const totalPaid = payments
          .filter((py: any) => py.status === 'paid')
          .reduce((acc: number, py: any) => acc + Number(py.amount), 0);

        return {
          ...p,
          total_contract: totalContract,
          total_paid: totalPaid,
          outstanding_balance: Math.max(0, totalContract - totalPaid),
        };
      });
    },
  });

  // Realtime subscription for projects
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('public:projects')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'projects' },
        () => {
          queryClient.invalidateQueries({ queryKey });
          queryClient.invalidateQueries({ queryKey: ['overview_metrics'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Update Status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      if (!isSupabaseConfigured) {
        const current = getStoredProjects();
        const updated = current.map((p) =>
          p.id === id ? { ...p, status, updated_at: new Date().toISOString() } : p
        );
        setStoredProjects(updated);
        return updated.find((p) => p.id === id);
      }

      const { data, error } = await supabase
        .from('projects')
        .update({ status, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['overview_metrics'] });
    },
  });

  // Update Progress
  const updateProgressMutation = useMutation({
    mutationFn: async ({ id, progress }: { id: string; progress: number }) => {
      if (!isSupabaseConfigured) {
        const current = getStoredProjects();
        const updated = current.map((p) =>
          p.id === id
            ? { ...p, progress_percent: progress, updated_at: new Date().toISOString() }
            : p
        );
        setStoredProjects(updated);
        return updated.find((p) => p.id === id);
      }

      const { data, error } = await supabase
        .from('projects')
        .update({ progress_percent: progress, updated_at: new Date().toISOString() } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Create Project
  const createProjectMutation = useMutation({
    mutationFn: async (newProject: Omit<Project, 'id' | 'created_at' | 'updated_at'>) => {
      if (!isSupabaseConfigured) {
        const current = getStoredProjects();
        const created: Project = {
          ...newProject,
          id: `p-${Date.now().toString(36)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setStoredProjects([created, ...current]);
        return created;
      }

      const { data, error } = await supabase.from('projects').insert(newProject as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['overview_metrics'] });
    },
  });

  return {
    projects,
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    updateProgress: updateProgressMutation.mutateAsync,
    createProject: createProjectMutation.mutateAsync,
  };
}

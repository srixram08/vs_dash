import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Client, ClientWithRelations, ProjectWithRelations } from '../types';
import { INITIAL_CLIENTS } from '../lib/mockData';

const CLIENTS_STORAGE_KEY = 'vs_studio_clients';

function getStoredClients(): Client[] {
  const stored = localStorage.getItem(CLIENTS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(INITIAL_CLIENTS));
  return INITIAL_CLIENTS;
}

function setStoredClients(data: Client[]) {
  localStorage.setItem(CLIENTS_STORAGE_KEY, JSON.stringify(data));
}

export function useClients() {
  const queryClient = useQueryClient();
  const queryKey = ['clients'];

  const {
    data: clients = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<Client[]> => {
      if (!isSupabaseConfigured) {
        return getStoredClients();
      }

      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching clients:', error);
        return getStoredClients();
      }

      return data as Client[];
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (newClient: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => {
      if (!isSupabaseConfigured) {
        const clients = getStoredClients();
        const created: Client = {
          ...newClient,
          id: `c-${Date.now().toString(36)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setStoredClients([created, ...clients]);
        return created;
      }

      const { data, error } = await supabase.from('clients').insert(newClient as any).select().single();
      if (error) throw error;
      return data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    clients,
    isLoading,
    error,
    refetch,
    createClient: createClientMutation.mutateAsync,
  };
}

export function useClientDetail(clientId: string | undefined) {
  return useQuery({
    queryKey: ['client', clientId],
    enabled: Boolean(clientId),
    queryFn: async (): Promise<ClientWithRelations | null> => {
      if (!clientId) return null;

      if (!isSupabaseConfigured) {
        const clients = getStoredClients();
        const client = clients.find((c) => c.id === clientId);
        if (!client) return null;

        const projects = JSON.parse(
          localStorage.getItem('vs_studio_projects') || '[]'
        ) as ProjectWithRelations[];
        const clientProjects = projects.filter((p) => p.client_id === clientId);

        const proposals = JSON.parse(localStorage.getItem('vs_studio_proposals') || '[]');
        const payments = JSON.parse(localStorage.getItem('vs_studio_payments') || '[]');
        const inquiries = JSON.parse(localStorage.getItem('vs_studio_inquiries') || '[]');

        return {
          ...client,
          inquiries: inquiries.filter((i: { id: string }) => i.id === client.inquiry_id),
          projects: clientProjects,
          proposals: proposals.filter((p: { project_id: string }) =>
            clientProjects.some((cp) => cp.id === p.project_id)
          ),
          payments: payments.filter((py: { project_id: string }) =>
            clientProjects.some((cp) => cp.id === py.project_id)
          ),
        };
      }

      // Supabase fetch
      const { data: client, error } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single();

      if (error) throw error;

      const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('client_id', clientId);

      return {
        ...(client as Client),
        projects: (projects || []) as ProjectWithRelations[],
      } as ClientWithRelations;
    },
  });
}

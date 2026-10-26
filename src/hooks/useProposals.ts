import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Proposal, ProposalStatus } from '../types';
import { INITIAL_PROPOSALS } from '../lib/mockData';

const PROPOSALS_STORAGE_KEY = 'vs_studio_proposals';

function getStoredProposals(): Proposal[] {
  const stored = localStorage.getItem(PROPOSALS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(INITIAL_PROPOSALS));
  return INITIAL_PROPOSALS;
}

function setStoredProposals(data: Proposal[]) {
  localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(data));
}

export function useProposals() {
  const queryClient = useQueryClient();
  const queryKey = ['proposals'];

  const {
    data: proposals = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<Proposal[]> => {
      if (!isSupabaseConfigured) {
        return getStoredProposals();
      }

      const { data, error } = await supabase
        .from('proposals')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching proposals from Supabase:', error);
        return [];
      }
      return data as Proposal[];
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProposalStatus }) => {
      if (!isSupabaseConfigured) {
        const current = getStoredProposals();
        const updated = current.map((p) =>
          p.id === id ? { ...p, status, updated_at: new Date().toISOString() } : p
        );
        setStoredProposals(updated);
        return updated.find((p) => p.id === id);
      }

      const { data, error } = await supabase
        .from('proposals')
        .update({ status, updated_at: new Date().toISOString() } as any)
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

  const createProposalMutation = useMutation({
    mutationFn: async (newProposal: Omit<Proposal, 'id' | 'created_at' | 'updated_at'>) => {
      if (!isSupabaseConfigured) {
        const current = getStoredProposals();
        const created: Proposal = {
          ...newProposal,
          id: `pr-${Date.now().toString(36)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setStoredProposals([created, ...current]);
        return created;
      }

      const { data, error } = await supabase
        .from('proposals')
        .insert(newProposal as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  return {
    proposals,
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    createProposal: createProposalMutation.mutateAsync,
  };
}

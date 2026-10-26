import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Payment, PaymentStatus, PaymentType } from '../types';
import { INITIAL_PAYMENTS } from '../lib/mockData';

const PAYMENTS_STORAGE_KEY = 'vs_studio_payments';

function getStoredPayments(): Payment[] {
  const stored = localStorage.getItem(PAYMENTS_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(INITIAL_PAYMENTS));
  return INITIAL_PAYMENTS;
}

function setStoredPayments(data: Payment[]) {
  localStorage.setItem(PAYMENTS_STORAGE_KEY, JSON.stringify(data));
}

export function usePayments(projectId?: string) {
  const queryClient = useQueryClient();
  const queryKey = projectId ? ['payments', projectId] : ['payments'];

  const {
    data: payments = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<Payment[]> => {
      if (!isSupabaseConfigured) {
        const allPayments = getStoredPayments();
        if (projectId) {
          return allPayments.filter((p) => p.project_id === projectId);
        }
        return allPayments;
      }

      let query = supabase.from('payments').select('*').order('due_date', { ascending: true });
      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) {
        console.error('Error fetching payments from Supabase:', error);
        return [];
      }
      return data as Payment[];
    },
  });

  // Realtime subscription for payments
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('public:payments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => {
        queryClient.invalidateQueries({ queryKey: ['payments'] });
        queryClient.invalidateQueries({ queryKey: ['projects'] });
        queryClient.invalidateQueries({ queryKey: ['overview_metrics'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  // Record/Update Payment status
  const markPaymentPaidMutation = useMutation({
    mutationFn: async ({
      id,
      method,
      paidAt,
    }: {
      id: string;
      method: string;
      paidAt?: string;
    }) => {
      const now = paidAt || new Date().toISOString();

      if (!isSupabaseConfigured) {
        const current = getStoredPayments();
        const updated = current.map((p) =>
          p.id === id
            ? {
                ...p,
                status: 'paid' as PaymentStatus,
                method,
                paid_at: now,
                updated_at: now,
              }
            : p
        );
        setStoredPayments(updated);
        return updated.find((p) => p.id === id);
      }

      const { data, error } = await supabase
        .from('payments')
        .update({
          status: 'paid',
          method,
          paid_at: now,
          updated_at: now,
        } as any)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['overview_metrics'] });
    },
  });

  // Create Payment record
  const createPaymentMutation = useMutation({
    mutationFn: async (newPayment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) => {
      if (!isSupabaseConfigured) {
        const current = getStoredPayments();
        const created: Payment = {
          ...newPayment,
          id: `py-${Date.now().toString(36)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        setStoredPayments([created, ...current]);
        return created;
      }

      const { data, error } = await supabase.from('payments').insert(newPayment as any).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['overview_metrics'] });
    },
  });

  return {
    payments,
    isLoading,
    error,
    refetch,
    markPaid: markPaymentPaidMutation.mutateAsync,
    createPayment: createPaymentMutation.mutateAsync,
  };
}

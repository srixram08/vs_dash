import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { Inquiry, InquiryStatus, Client, Project } from '../types';
import { INITIAL_INQUIRIES } from '../lib/mockData';
import { useToast } from '../components/ui/Toast';

const INQUIRIES_STORAGE_KEY = 'vs_studio_inquiries';

function getStoredInquiries(): Inquiry[] {
  const stored = localStorage.getItem(INQUIRIES_STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // fallback
    }
  }
  localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(INITIAL_INQUIRIES));
  return INITIAL_INQUIRIES;
}

function setStoredInquiries(data: Inquiry[]) {
  localStorage.setItem(INQUIRIES_STORAGE_KEY, JSON.stringify(data));
}

export function useInquiries() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = ['inquiries'];

  const {
    data: inquiries = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async (): Promise<Inquiry[]> => {
      if (!isSupabaseConfigured) {
        return getStoredInquiries();
      }

      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching inquiries from Supabase:', error);
        return getStoredInquiries();
      }

      return data as Inquiry[];
    },
  });

  // Realtime subscription for inquiries
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const channel = supabase
      .channel('public:inquiries')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'inquiries' },
        (payload) => {
          const newInquiry = payload.new as Inquiry;
          toast({
            type: 'lead',
            title: `🚀 New Lead: ${newInquiry.name}`,
            description: `${newInquiry.company || 'Private Client'} &bull; Budget: ${newInquiry.budget_range}`,
            duration: 8000,
          });
          queryClient.invalidateQueries({ queryKey });
          queryClient.invalidateQueries({ queryKey: ['overview_metrics'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'inquiries' },
        () => {
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast]);

  // Update Status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: InquiryStatus }) => {
      if (!isSupabaseConfigured) {
        const current = getStoredInquiries();
        const updated = current.map((item) =>
          item.id === id ? { ...item, status, updated_at: new Date().toISOString() } : item
        );
        setStoredInquiries(updated);
        return updated.find((i) => i.id === id);
      }

      const { data, error } = await supabase
        .from('inquiries')
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

  // Update Notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes: string }) => {
      if (!isSupabaseConfigured) {
        const current = getStoredInquiries();
        const updated = current.map((item) =>
          item.id === id ? { ...item, notes, updated_at: new Date().toISOString() } : item
        );
        setStoredInquiries(updated);
        return updated.find((i) => i.id === id);
      }

      const { data, error } = await supabase
        .from('inquiries')
        .update({ notes, updated_at: new Date().toISOString() } as any)
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

  // Convert Inquiry to Client + Project
  const convertToProjectMutation = useMutation({
    mutationFn: async ({
      inquiry,
      projectTitle,
      startDate,
      dueDate,
      assignedTo,
    }: {
      inquiry: Inquiry;
      projectTitle: string;
      startDate: string;
      dueDate: string;
      assignedTo?: string;
    }) => {
      const clientId = `c-${Date.now().toString(36)}`;
      const projectId = `p-${Date.now().toString(36)}`;

      if (!isSupabaseConfigured) {
        // 1. Create client
        const storedClients = JSON.parse(
          localStorage.getItem('vs_studio_clients') || '[]'
        ) as Client[];
        const newClient: Client = {
          id: clientId,
          inquiry_id: inquiry.id,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          company: inquiry.company,
          notes: `Converted from inquiry: ${inquiry.requirements}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(
          'vs_studio_clients',
          JSON.stringify([newClient, ...storedClients])
        );

        // 2. Create project
        const storedProjects = JSON.parse(
          localStorage.getItem('vs_studio_projects') || '[]'
        ) as Project[];
        const newProject: Project = {
          id: projectId,
          client_id: newClient.id,
          title: projectTitle || `${inquiry.name} Project`,
          service_type: inquiry.service_type,
          status: 'planning',
          start_date: startDate || new Date().toISOString().split('T')[0],
          due_date: dueDate || null,
          assigned_to: assignedTo || null,
          progress_percent: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem(
          'vs_studio_projects',
          JSON.stringify([newProject, ...storedProjects])
        );

        // 3. Mark inquiry accepted
        const currentInquiries = getStoredInquiries();
        const updatedInquiries = currentInquiries.map((i) =>
          i.id === inquiry.id
            ? { ...i, status: 'accepted' as InquiryStatus, updated_at: new Date().toISOString() }
            : i
        );
        setStoredInquiries(updatedInquiries);

        // 4. Log activity
        const storedLogs = JSON.parse(
          localStorage.getItem('vs_studio_activity_log') || '[]'
        );
        storedLogs.unshift({
          id: `al-${Date.now()}`,
          entity_type: 'inquiry',
          entity_id: inquiry.id,
          action: `Converted inquiry from ${inquiry.name} to Client & Project "${newProject.title}"`,
          actor: 'Founder Admin',
          metadata: { clientId: newClient.id, projectId: newProject.id },
          created_at: new Date().toISOString(),
        });
        localStorage.setItem('vs_studio_activity_log', JSON.stringify(storedLogs));

        return { client: newClient, project: newProject };
      }

      // Supabase flow
      const { data: clientData, error: clientError } = await supabase
        .from('clients')
        .insert({
          inquiry_id: inquiry.id,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          company: inquiry.company,
          notes: `Converted from inquiry: ${inquiry.requirements}`,
        } as any)
        .select()
        .single();

      if (clientError) throw clientError;

      const client = clientData as Client;

      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert({
          client_id: client.id,
          title: projectTitle || `${inquiry.name} Project`,
          service_type: inquiry.service_type,
          status: 'planning',
          start_date: startDate || new Date().toISOString().split('T')[0],
          due_date: dueDate || null,
          assigned_to: assignedTo || null,
          progress_percent: 0,
        } as any)
        .select()
        .single();

      if (projectError) throw projectError;

      const project = projectData as Project;

      // Update inquiry status
      await supabase
        .from('inquiries')
        .update({ status: 'accepted' } as any)
        .eq('id', inquiry.id);

      // Log activity
      await supabase.from('activity_log').insert({
        entity_type: 'inquiry',
        entity_id: inquiry.id,
        action: `Converted inquiry to Client & Project "${project.title}"`,
        actor: 'Founder Admin',
        metadata: { clientId: client.id, projectId: project.id },
      } as any);

      return { client, project };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['activity_log'] });
      queryClient.invalidateQueries({ queryKey: ['overview_metrics'] });
    },
  });

  // Simulated submission for test inquiries
  const submitTestInquiry = async (testInquiry: Partial<Inquiry>) => {
    const fullInquiry: Inquiry = {
      id: `i-test-${Date.now().toString(36)}`,
      name: testInquiry.name || 'Test Client',
      email: testInquiry.email || 'client@example.com',
      phone: testInquiry.phone || '+1 555-0199',
      company: testInquiry.company || 'Acme Labs',
      service_type: testInquiry.service_type || 'website_design_dev',
      requirements:
        testInquiry.requirements ||
        'Testing real-time lead ingestion on VS Studio Admin dashboard.',
      budget_range: testInquiry.budget_range || '$8k - $12k',
      deadline: '2026-11-25',
      reference_links: 'https://example.com',
      file_urls: [],
      status: 'new',
      assigned_to: null,
      notes: 'Test lead submitted from client portal simulator.',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('inquiries').insert(fullInquiry as any);
      if (error) throw error;
    } else {
      const current = getStoredInquiries();
      setStoredInquiries([fullInquiry, ...current]);
      queryClient.invalidateQueries({ queryKey });
      toast({
        type: 'lead',
        title: `🚀 Live Test Lead Received: ${fullInquiry.name}`,
        description: `${fullInquiry.company} &bull; Budget: ${fullInquiry.budget_range}`,
      });
    }
  };

  return {
    inquiries,
    isLoading,
    error,
    refetch,
    updateStatus: updateStatusMutation.mutateAsync,
    updateNotes: updateNotesMutation.mutateAsync,
    convertToProject: convertToProjectMutation.mutateAsync,
    submitTestInquiry,
    isConverting: convertToProjectMutation.isPending,
  };
}

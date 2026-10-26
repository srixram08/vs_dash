export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ServiceType =
  | 'website_design_dev'
  | 'logo_branding'
  | 'ai_agents_automation';

export type InquiryStatus =
  | 'new'
  | 'reviewing'
  | 'proposal_sent'
  | 'accepted'
  | 'rejected';

export type ProjectStatus =
  | 'planning'
  | 'in_progress'
  | 'review'
  | 'completed'
  | 'on_hold';

export type TaskStatus = 'todo' | 'doing' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ProposalStatus = 'draft' | 'sent' | 'accepted' | 'rejected';
export type PaymentType = 'advance' | 'milestone' | 'final';
export type PaymentStatus = 'pending' | 'paid' | 'overdue';

export interface Database {
  public: {
    Tables: {
      admins: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      inquiries: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          service_type: string;
          requirements: string;
          budget_range: string;
          deadline: string | null;
          reference_links: string | null;
          file_urls: string[] | null;
          status: InquiryStatus;
          assigned_to: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          service_type: string;
          requirements: string;
          budget_range: string;
          deadline?: string | null;
          reference_links?: string | null;
          file_urls?: string[] | null;
          status?: InquiryStatus;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          service_type?: string;
          requirements?: string;
          budget_range?: string;
          deadline?: string | null;
          reference_links?: string | null;
          file_urls?: string[] | null;
          status?: InquiryStatus;
          assigned_to?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      clients: {
        Row: {
          id: string;
          inquiry_id: string | null;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          inquiry_id?: string | null;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          inquiry_id?: string | null;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          service_type: string;
          status: ProjectStatus;
          start_date: string | null;
          due_date: string | null;
          assigned_to: string | null;
          progress_percent: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          service_type: string;
          status?: ProjectStatus;
          start_date?: string | null;
          due_date?: string | null;
          assigned_to?: string | null;
          progress_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          title?: string;
          service_type?: string;
          status?: ProjectStatus;
          start_date?: string | null;
          due_date?: string | null;
          assigned_to?: string | null;
          progress_percent?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          description: string | null;
          assignee: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          due_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          description?: string | null;
          assignee?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          title?: string;
          description?: string | null;
          assignee?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          due_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      proposals: {
        Row: {
          id: string;
          inquiry_id: string | null;
          project_id: string | null;
          total_price: number;
          deliverables: Json;
          status: ProposalStatus;
          sent_at: string | null;
          valid_until: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          inquiry_id?: string | null;
          project_id?: string | null;
          total_price?: number;
          deliverables?: Json;
          status?: ProposalStatus;
          sent_at?: string | null;
          valid_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          inquiry_id?: string | null;
          project_id?: string | null;
          total_price?: number;
          deliverables?: Json;
          status?: ProposalStatus;
          sent_at?: string | null;
          valid_until?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      payments: {
        Row: {
          id: string;
          project_id: string;
          type: PaymentType;
          amount: number;
          status: PaymentStatus;
          due_date: string | null;
          paid_at: string | null;
          method: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          type: PaymentType;
          amount: number;
          status?: PaymentStatus;
          due_date?: string | null;
          paid_at?: string | null;
          method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          type?: PaymentType;
          amount?: number;
          status?: PaymentStatus;
          due_date?: string | null;
          paid_at?: string | null;
          method?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      activity_log: {
        Row: {
          id: string;
          entity_type: string;
          entity_id: string;
          action: string;
          actor: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          entity_type: string;
          entity_id: string;
          action: string;
          actor: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          entity_type?: string;
          entity_id?: string;
          action?: string;
          actor?: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

export type Admin = Tables<'admins'>;
export type Inquiry = Tables<'inquiries'>;
export type Client = Tables<'clients'>;
export type Project = Tables<'projects'>;
export type Task = Tables<'tasks'>;
export type Proposal = Tables<'proposals'>;
export type Payment = Tables<'payments'>;
export type ActivityLog = Tables<'activity_log'>;

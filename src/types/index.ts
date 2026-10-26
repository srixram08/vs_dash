import {
  Admin,
  Inquiry,
  Client,
  Project,
  Task,
  Proposal,
  Payment,
  ActivityLog,
  ServiceType,
  InquiryStatus,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  PaymentStatus,
} from './database.types';

export * from './database.types';

export interface DeliverableItem {
  id: string;
  title: string;
  description: string;
  price: number;
}

export interface ClientWithRelations extends Client {
  inquiries?: Inquiry[];
  projects?: ProjectWithRelations[];
  proposals?: Proposal[];
  payments?: Payment[];
}

export interface ProjectWithRelations extends Project {
  client?: Client;
  tasks?: Task[];
  payments?: Payment[];
  proposals?: Proposal[];
  assigned_admin?: Admin;
  total_contract?: number;
  total_paid?: number;
  outstanding_balance?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

export interface OverviewMetrics {
  newInquiriesCount: number;
  activeProjectsCount: number;
  tasksDueThisWeekCount: number;
  overdueItemsCount: number;
  totalOutstandingBalance: number;
  monthlyRevenue: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'project' | 'task' | 'payment';
  status: string;
  metadata?: Record<string, unknown>;
}

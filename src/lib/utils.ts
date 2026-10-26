import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { InquiryStatus, ProjectStatus, TaskPriority, TaskStatus, PaymentStatus } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return formatDate(dateString);
  } catch {
    return dateString;
  }
}

export function getDaysRemaining(dueDate: string | null | undefined): {
  days: number;
  isOverdue: boolean;
  isDueSoon: boolean;
  text: string;
} {
  if (!dueDate) {
    return { days: 0, isOverdue: false, isDueSoon: false, text: 'No deadline' };
  }
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);

  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      days: Math.abs(diffDays),
      isOverdue: true,
      isDueSoon: false,
      text: `${Math.abs(diffDays)}d overdue`,
    };
  }
  if (diffDays === 0) {
    return { days: 0, isOverdue: false, isDueSoon: true, text: 'Due today' };
  }
  if (diffDays <= 3) {
    return {
      days: diffDays,
      isOverdue: false,
      isDueSoon: true,
      text: `${diffDays}d left`,
    };
  }
  return {
    days: diffDays,
    isOverdue: false,
    isDueSoon: false,
    text: `${diffDays}d left`,
  };
}

export function getInquiryStatusBadge(status: InquiryStatus) {
  switch (status) {
    case 'new':
      return {
        label: 'New Lead',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium',
        dotClass: 'bg-emerald-500 animate-pulse',
      };
    case 'reviewing':
      return {
        label: 'Reviewing',
        className: 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
        dotClass: 'bg-amber-500',
      };
    case 'proposal_sent':
      return {
        label: 'Proposal Sent',
        className: 'bg-teal-50 text-teal-700 border-teal-300 font-medium',
        dotClass: 'bg-teal-500',
      };
    case 'accepted':
      return {
        label: 'Accepted',
        className: 'bg-green-100 text-green-800 border-green-300 font-medium',
        dotClass: 'bg-green-600',
      };
    case 'rejected':
      return {
        label: 'Rejected',
        className: 'bg-rose-50 text-rose-700 border-rose-300 font-medium',
        dotClass: 'bg-rose-500',
      };
    default:
      return {
        label: status,
        className: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
        dotClass: 'bg-slate-500',
      };
  }
}

export function getProjectStatusBadge(status: ProjectStatus) {
  switch (status) {
    case 'planning':
      return {
        label: 'Planning',
        className: 'bg-sky-50 text-sky-700 border-sky-300 font-medium',
      };
    case 'in_progress':
      return {
        label: 'In Progress',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium',
      };
    case 'review':
      return {
        label: 'Review',
        className: 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
      };
    case 'completed':
      return {
        label: 'Completed',
        className: 'bg-green-100 text-green-800 border-green-300 font-medium',
      };
    case 'on_hold':
      return {
        label: 'On Hold',
        className: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
      };
    default:
      return {
        label: status,
        className: 'bg-slate-100 text-slate-700 border-slate-300 font-medium',
      };
  }
}

export function getTaskPriorityBadge(priority: TaskPriority) {
  switch (priority) {
    case 'urgent':
      return {
        label: 'Urgent',
        className: 'bg-rose-50 text-rose-700 border-rose-300 font-medium',
      };
    case 'high':
      return {
        label: 'High',
        className: 'bg-orange-50 text-orange-700 border-orange-300 font-medium',
      };
    case 'medium':
      return {
        label: 'Medium',
        className: 'bg-emerald-50 text-emerald-700 border-emerald-300 font-medium',
      };
    case 'low':
      return {
        label: 'Low',
        className: 'bg-slate-100 text-slate-600 border-slate-300 font-medium',
      };
  }
}

export function getPaymentStatusBadge(status: PaymentStatus) {
  switch (status) {
    case 'paid':
      return {
        label: 'Paid',
        className: 'bg-emerald-50 text-emerald-800 border-emerald-300 font-medium',
      };
    case 'pending':
      return {
        label: 'Pending',
        className: 'bg-amber-50 text-amber-800 border-amber-300 font-medium',
      };
    case 'overdue':
      return {
        label: 'Overdue',
        className: 'bg-rose-50 text-rose-700 border-rose-300 font-medium animate-pulse',
      };
  }
}

export function formatServiceType(service: string | undefined): string {
  switch (service) {
    case 'website_design_dev':
      return 'Web Design & Dev';
    case 'logo_branding':
      return 'Logo & Branding';
    case 'ai_agents_automation':
      return 'AI & Automation';
    default:
      return service || 'General';
  }
}

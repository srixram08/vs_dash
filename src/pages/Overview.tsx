import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOverview } from '../hooks/useOverview';
import { useActivityLog } from '../hooks/useActivityLog';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { RupeeIcon } from '../components/ui/RupeeIcon';
import {
  formatCurrency,
  formatRelativeTime,
  formatDate,
} from '../lib/utils';
import {
  Inbox,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Activity,
  Calendar,
  ShieldCheck,
  Plus,
  ArrowUpRight,
  Clock,
  Layers,
} from 'lucide-react';

export const Overview: React.FC = () => {
  const { metrics, attentionNeeded, isLoading } = useOverview();
  const { data: activityLogs = [] } = useActivityLog(10);
  const { adminProfile } = useAuth();
  const navigate = useNavigate();

  const [attentionFilter, setAttentionFilter] = useState<'all' | 'payment' | 'inquiry' | 'task'>('all');

  const founderName = adminProfile?.name?.split(' ')[0] || 'Founder';

  const filteredAttention = useMemo(() => {
    if (attentionFilter === 'all') return attentionNeeded;
    return attentionNeeded.filter((item) => item.type === attentionFilter);
  }, [attentionNeeded, attentionFilter]);

  const todayDateString = useMemo(() => {
    return new Intl.DateTimeFormat('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(new Date());
  }, []);

  return (
    <div className="space-y-7 animate-fade-in font-sans">
      {/* Tran Mau Tri Tam Minimal Header & Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              VS Studio &bull; Live Engine
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {todayDateString}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {founderName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Here is your studio overview across Web Development, Brand Systems, and AI Automations.
          </p>
        </div>

        {/* Quick Action Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/inquiries')}
            className="rounded-full text-xs font-semibold px-4 py-2 hover:bg-slate-50 border-slate-200"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-slate-500" />
            Inquiries
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate('/proposals')}
            className="rounded-full text-xs font-semibold px-4 py-2 hover:bg-slate-50 border-slate-200"
          >
            <Plus className="w-3.5 h-3.5 mr-1 text-slate-500" />
            New Proposal
          </Button>
          <Button
            size="sm"
            variant="gradient"
            onClick={() => navigate('/payments')}
            className="rounded-full text-xs font-semibold px-4 py-2 shadow-xs"
          >
            <RupeeIcon className="w-3.5 h-3.5 mr-1" />
            Record Payment
          </Button>
        </div>
      </div>

      {/* 6 Bento Grid KPI Cards (Tran Mau Tri Tam Minimal Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* 1. Monthly Revenue */}
        <div
          onClick={() => navigate('/payments')}
          className="minimal-card-interactive p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Monthly Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RupeeIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {formatCurrency(metrics.monthlyRevenue)}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                +18.4%
              </span>
              <span className="text-[11px] text-slate-400">vs last mo</span>
            </div>
          </div>
        </div>

        {/* 2. Outstanding Balances */}
        <div
          onClick={() => navigate('/payments')}
          className="minimal-card-interactive p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Outstanding
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-amber-700 tracking-tight">
              {formatCurrency(metrics.totalOutstandingBalance)}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                Invoices due
              </span>
              <span className="text-[11px] text-slate-400">Pending release</span>
            </div>
          </div>
        </div>

        {/* 3. New Inquiries */}
        <div
          onClick={() => navigate('/inquiries')}
          className="minimal-card-interactive p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              New Inquiries
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {metrics.newInquiriesCount}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                Needs review
              </span>
              <span className="text-[11px] text-slate-400">Public form</span>
            </div>
          </div>
        </div>

        {/* 4. Active Projects */}
        <div
          onClick={() => navigate('/projects')}
          className="minimal-card-interactive p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Active Projects
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {metrics.activeProjectsCount}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                In progress
              </span>
              <span className="text-[11px] text-slate-400">On track</span>
            </div>
          </div>
        </div>

        {/* 5. Tasks This Week */}
        <div
          onClick={() => navigate('/tasks')}
          className="minimal-card-interactive p-5 flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Tasks This Week
            </span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {metrics.tasksDueThisWeekCount}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60">
                Milestones
              </span>
              <span className="text-[11px] text-slate-400">7d window</span>
            </div>
          </div>
        </div>

        {/* 6. Overdue Items */}
        <div
          onClick={() => navigate('/payments')}
          className={`minimal-card-interactive p-5 flex flex-col justify-between ${
            metrics.overdueItemsCount > 0 ? 'border-rose-300 bg-rose-50/20' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700">
              Action Needed
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
              {metrics.overdueItemsCount}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                {metrics.overdueItemsCount > 0 ? 'Immediate action' : 'All clear'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Split View: Attention Needed + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attention Needed Bento Card */}
        <div className="minimal-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Attention Needed</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                {attentionNeeded.length}
              </span>
            </div>

            {/* Segmented Filter Pills */}
            <div className="segmented-pill-container self-start sm:self-auto">
              {(['all', 'payment', 'inquiry', 'task'] as const).map((filterKey) => (
                <button
                  key={filterKey}
                  onClick={() => setAttentionFilter(filterKey)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all capitalize ${
                    attentionFilter === filterKey
                      ? 'bg-white text-slate-950 shadow-2xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {filterKey === 'all' ? 'All' : `${filterKey}s`}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredAttention.length === 0 ? (
              <div className="p-8 rounded-2xl bg-slate-50/70 border border-slate-100 text-center text-xs text-slate-500 space-y-2">
                <ShieldCheck className="w-8 h-8 mx-auto text-emerald-600" />
                <p className="font-bold text-slate-800">Everything is on track</p>
                <p className="text-[11px] text-slate-400">
                  No overdue payments, pending inquiries, or expired proposals in this category.
                </p>
              </div>
            ) : (
              filteredAttention.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.actionUrl)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    item.urgency === 'high'
                      ? 'bg-rose-50/40 border-rose-200/80 hover:border-rose-300 hover:bg-rose-50/70'
                      : 'bg-slate-50/60 border-slate-200/80 hover:border-emerald-300 hover:bg-white'
                  }`}
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.urgency === 'high' ? 'bg-rose-500' : 'bg-amber-500'
                        }`}
                      />
                      <h4
                        className={`text-xs font-bold truncate ${
                          item.urgency === 'high' ? 'text-rose-900' : 'text-slate-900'
                        }`}
                      >
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate pl-3.5">
                      {item.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-emerald-700 transition flex-shrink-0">
                    <span className="text-[11px] font-bold hidden sm:inline">Resolve</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Realtime Activity Feed Bento Card */}
        <div className="minimal-card p-6 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Studio Activity</h3>
            </div>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Audit Stream
            </span>
          </div>

          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">
                No recent activity logged.
              </p>
            ) : (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-100 hover:border-slate-200 transition-all flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-emerald-100/70 border border-emerald-200/80 flex items-center justify-center text-[11px] font-bold text-emerald-800 flex-shrink-0 mt-0.5">
                    {log.actor.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 leading-snug">
                      {log.action}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-medium">
                      <span className="text-slate-600">{log.actor}</span>
                      <span>&bull;</span>
                      <span>{formatRelativeTime(log.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

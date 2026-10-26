import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useOverview } from '../hooks/useOverview';
import { useActivityLog } from '../hooks/useActivityLog';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import {
  formatCurrency,
  formatRelativeTime,
  formatDateTime,
} from '../lib/utils';
import {
  Inbox,
  FolderKanban,
  CheckSquare,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Activity,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react';

export const Overview: React.FC = () => {
  const { metrics, attentionNeeded, isLoading } = useOverview();
  const { data: activityLogs = [] } = useActivityLog(10);
  const { adminProfile } = useAuth();
  const navigate = useNavigate();

  const founderName = adminProfile?.name?.split(' ')[0] || 'Founder';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-primary-500/20 bg-gradient-to-r from-[#101426] via-[#0d1629] to-[#091522] p-6 sm:p-8">
        <div className="absolute right-0 top-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-primary-600/30 to-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              VS Studio Operating Engine
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {founderName}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Here is your live studio status across Web Development, Brand Identity, and AI Workflow Automations.
          </p>
        </div>
      </div>

      {/* 6 Core KPIs Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* 1. New Inquiries */}
        <div
          onClick={() => navigate('/inquiries')}
          className="glass-card rounded-xl p-4 border border-slate-800 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">New Inquiries</span>
            <Inbox className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {metrics.newInquiriesCount}
          </div>
          <p className="text-[11px] text-cyan-400 font-medium mt-1">Pending review</p>
        </div>

        {/* 2. Active Projects */}
        <div
          onClick={() => navigate('/projects')}
          className="glass-card rounded-xl p-4 border border-slate-800 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Active Projects</span>
            <FolderKanban className="w-4 h-4 text-primary-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {metrics.activeProjectsCount}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">In progress / QA</p>
        </div>

        {/* 3. Tasks Due This Week */}
        <div
          onClick={() => navigate('/tasks')}
          className="glass-card rounded-xl p-4 border border-slate-800 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Tasks This Week</span>
            <CheckSquare className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-black text-white mt-2">
            {metrics.tasksDueThisWeekCount}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Upcoming milestones</p>
        </div>

        {/* 4. Overdue Items */}
        <div
          onClick={() => navigate('/payments')}
          className={`glass-card rounded-xl p-4 border cursor-pointer group ${
            metrics.overdueItemsCount > 0
              ? 'border-rose-500/40 bg-rose-950/10'
              : 'border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300">
              Overdue Items
            </span>
            <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:scale-110 transition-transform animate-pulse" />
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">
            {metrics.overdueItemsCount}
          </div>
          <p className="text-[11px] text-rose-300/80 font-medium mt-1">Action required</p>
        </div>

        {/* 5. Total Outstanding Balance */}
        <div
          onClick={() => navigate('/payments')}
          className="glass-card rounded-xl p-4 border border-slate-800 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Outstanding</span>
            <DollarSign className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-black text-amber-400 mt-2">
            {formatCurrency(metrics.totalOutstandingBalance)}
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-1">Unpaid balances</p>
        </div>

        {/* 6. Revenue This Month */}
        <div
          onClick={() => navigate('/payments')}
          className="glass-card rounded-xl p-4 border border-slate-800 cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Month Revenue</span>
            <TrendingUp className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-xl font-black text-emerald-400 mt-2">
            {formatCurrency(metrics.monthlyRevenue)}
          </div>
          <p className="text-[11px] text-emerald-400/80 font-medium mt-1">Collected this month</p>
        </div>
      </div>

      {/* Main Split View: Attention Needed + Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attention Needed Widget */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <h3 className="text-sm font-bold text-slate-100">Attention Needed</h3>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              {attentionNeeded.length} prioritized items
            </span>
          </div>

          <div className="space-y-2.5">
            {attentionNeeded.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-900/30 border border-slate-800 text-center text-xs text-slate-400">
                <ShieldCheck className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                <p className="font-semibold text-slate-200">Everything is on track!</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  No overdue payments, pending urgent leads, or expired proposals.
                </p>
              </div>
            ) : (
              attentionNeeded.map((item) => (
                <div
                  key={item.id}
                  onClick={() => navigate(item.actionUrl)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                    item.urgency === 'high'
                      ? 'bg-rose-950/15 border-rose-500/30 hover:border-rose-500/60'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <h4
                      className={`text-xs font-semibold ${
                        item.urgency === 'high' ? 'text-rose-200' : 'text-slate-200'
                      }`}
                    >
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-1 text-slate-400 group-hover:text-white transition">
                    <span className="text-[11px] font-medium hidden sm:inline">Resolve</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Realtime Activity Feed */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-slate-100">Recent Studio Activity</h3>
            </div>
            <span className="text-[11px] text-slate-400">Realtime audit trail</span>
          </div>

          <div className="space-y-3">
            {activityLogs.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-6 text-center">
                No recent activity logged.
              </p>
            ) : (
              activityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex items-start gap-3"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-200 leading-snug">{log.action}</p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span>By {log.actor}</span>
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

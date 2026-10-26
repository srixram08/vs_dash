import React, { useState, useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { usePayments } from '../hooks/usePayments';
import { CalendarEvent } from '../types';
import { formatDate, formatCurrency, getDaysRemaining } from '../lib/utils';
import {
  Calendar as CalendarIcon,
  FolderKanban,
  CheckSquare,
  CreditCard,
  AlertTriangle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CalendarPage: React.FC = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { payments } = usePayments();
  const [filterType, setFilterType] = useState<'all' | 'project' | 'task' | 'payment'>('all');
  const navigate = useNavigate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Combine deadlines into unified calendar events
  const allEvents: CalendarEvent[] = useMemo(() => {
    const list: CalendarEvent[] = [];

    // 1. Projects
    projects.forEach((p) => {
      if (p.due_date) {
        list.push({
          id: `proj-${p.id}`,
          title: `Project Due: ${p.title}`,
          date: p.due_date,
          type: 'project',
          status: p.status,
          metadata: { client: p.client?.name, progress: p.progress_percent },
        });
      }
    });

    // 2. Tasks
    tasks.forEach((t) => {
      if (t.due_date) {
        list.push({
          id: `task-${t.id}`,
          title: `Task: ${t.title}`,
          date: t.due_date,
          type: 'task',
          status: t.status,
          metadata: { priority: t.priority },
        });
      }
    });

    // 3. Payments
    payments.forEach((py) => {
      if (py.due_date && py.status !== 'paid') {
        const project = projects.find((p) => p.id === py.project_id);
        list.push({
          id: `pay-${py.id}`,
          title: `Payment Due: ${formatCurrency(py.amount)} (${py.type})`,
          date: py.due_date,
          type: 'payment',
          status: py.status,
          metadata: { project: project?.title, amount: py.amount },
        });
      }
    });

    // Sort chronologically
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [projects, tasks, payments]);

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return allEvents;
    return allEvents.filter((e) => e.type === filterType);
  }, [allEvents, filterType]);

  // Group events by time period
  const groupedEvents = useMemo(() => {
    const overdue: CalendarEvent[] = [];
    const thisWeek: CalendarEvent[] = [];
    const upcoming: CalendarEvent[] = [];

    const weekLater = new Date(today);
    weekLater.setDate(today.getDate() + 7);

    filteredEvents.forEach((ev) => {
      const d = new Date(ev.date);
      d.setHours(0, 0, 0, 0);

      if (d < today) {
        overdue.push(ev);
      } else if (d <= weekLater) {
        thisWeek.push(ev);
      } else {
        upcoming.push(ev);
      }
    });

    return { overdue, thisWeek, upcoming };
  }, [filteredEvents, today]);

  const renderEventCard = (event: CalendarEvent) => {
    const daysInfo = getDaysRemaining(event.date);

    const typeIcons = {
      project: <FolderKanban className="w-4 h-4 text-cyan-400" />,
      task: <CheckSquare className="w-4 h-4 text-primary-400" />,
      payment: <CreditCard className="w-4 h-4 text-emerald-400" />,
    };

    const typeNav = {
      project: '/projects',
      task: '/tasks',
      payment: '/payments',
    };

    return (
      <div
        key={event.id}
        onClick={() => navigate(typeNav[event.type])}
        className="glass-card rounded-xl p-4 border border-slate-800 flex items-center justify-between cursor-pointer group hover:border-slate-700"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0">
            {typeIcons[event.type]}
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-100 group-hover:text-cyan-400 transition">
              {event.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="capitalize">{event.type}</span>
              <span>&bull;</span>
              <span>{formatDate(event.date)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
              daysInfo.isOverdue
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : daysInfo.isDueSoon
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {daysInfo.text}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-white transition" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Master Deadlines & Schedule
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">
              {allEvents.length} Deadlines
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Unified timeline integrating project launches, task checkpoints, and milestone payouts
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {(['all', 'project', 'task', 'payment'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition ${
                filterType === t
                  ? 'bg-primary-600/30 text-cyan-300 border border-primary-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'all' ? 'All Deadlines' : `${t}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Grouped Timelines */}
      <div className="space-y-6">
        {/* Overdue Section */}
        {groupedEvents.overdue.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Overdue ({groupedEvents.overdue.length})
              </h3>
            </div>
            <div className="space-y-2.5">
              {groupedEvents.overdue.map(renderEventCard)}
            </div>
          </div>
        )}

        {/* Due This Week */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
              Due This Week ({groupedEvents.thisWeek.length})
            </h3>
          </div>
          <div className="space-y-2.5">
            {groupedEvents.thisWeek.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 rounded-xl bg-slate-900/30 border border-slate-800">
                No deadlines due in the next 7 days.
              </p>
            ) : (
              groupedEvents.thisWeek.map(renderEventCard)
            )}
          </div>
        </div>

        {/* Later / Upcoming */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Upcoming Deadlines ({groupedEvents.upcoming.length})
            </h3>
          </div>
          <div className="space-y-2.5">
            {groupedEvents.upcoming.length === 0 ? (
              <p className="text-xs text-slate-400 italic p-4 rounded-xl bg-slate-900/30 border border-slate-800">
                No future deadlines scheduled.
              </p>
            ) : (
              groupedEvents.upcoming.map(renderEventCard)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

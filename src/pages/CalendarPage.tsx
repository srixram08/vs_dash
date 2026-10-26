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
import { RupeeIcon } from '../components/ui/RupeeIcon';
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
          title: `Project Delivery: ${p.title}`,
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
          title: `Milestone: ${t.title}`,
          date: t.due_date,
          type: 'task',
          status: t.status,
          metadata: { priority: t.priority },
        });
      }
    });

    // 3. Payments (Amounts in INR)
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
      project: <FolderKanban className="w-4 h-4 text-emerald-600" />,
      task: <CheckSquare className="w-4 h-4 text-teal-600" />,
      payment: <RupeeIcon className="w-4 h-4 text-emerald-700" />,
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
        className="minimal-card rounded-2xl p-4 flex items-center justify-between cursor-pointer group hover:border-emerald-300 bg-white shadow-2xs font-sans transition-all"
      >
        <div className="flex items-center gap-3.5 min-w-0 pr-3">
          <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
            {typeIcons[event.type]}
          </div>
          <div className="min-w-0">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
              {event.title}
            </h4>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
              <span className="capitalize font-semibold text-slate-700">{event.type}</span>
              <span>&bull;</span>
              <span>{formatDate(event.date)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
              daysInfo.isOverdue
                ? 'bg-rose-50 text-rose-700 border border-rose-200/80'
                : daysInfo.isDueSoon
                ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {daysInfo.text}
          </span>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition" />
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Master Schedule
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {allEvents.length} Active Deadlines
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Master Deadlines & Schedule
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified timeline integrating project launches, task checkpoints, and milestone payouts
          </p>
        </div>

        {/* Segmented Filter Pills */}
        <div className="segmented-pill-container">
          {(['all', 'project', 'task', 'payment'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                filterType === t
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
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
              <AlertTriangle className="w-4 h-4 text-rose-600 animate-pulse" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-700">
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
            <Clock className="w-4 h-4 text-amber-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Due This Week ({groupedEvents.thisWeek.length})
            </h3>
          </div>
          <div className="space-y-2.5">
            {groupedEvents.thisWeek.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-6 rounded-2xl bg-white border border-slate-200 text-center">
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
            <CalendarIcon className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Upcoming Deadlines ({groupedEvents.upcoming.length})
            </h3>
          </div>
          <div className="space-y-2.5">
            {groupedEvents.upcoming.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-6 rounded-2xl bg-white border border-slate-200 text-center">
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

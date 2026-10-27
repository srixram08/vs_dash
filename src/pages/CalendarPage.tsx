import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { usePayments } from '../hooks/usePayments';
import { CalendarEvent } from '../types';
import { formatDate, formatCurrency, getDaysRemaining } from '../lib/utils';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  AlertTriangle,
  CheckSquare,
  FolderKanban,
  CreditCard,
  MessageSquare,
  Filter,
  X,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { RupeeIcon } from '../components/ui/RupeeIcon';
import { cn } from '../lib/utils';

interface ExtendedCalendarEvent extends Omit<CalendarEvent, 'type'> {
  type: 'project' | 'task' | 'payment' | 'meeting';
  time?: string;
  client?: string;
  priority?: string;
  amount?: number;
}

export const CalendarPage: React.FC = () => {
  const { projects } = useProjects();
  const { tasks } = useTasks();
  const { payments } = usePayments();
  const navigate = useNavigate();

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'agenda'>('month');
  const [filterType, setFilterType] = useState<'all' | 'project' | 'task' | 'payment' | 'meeting'>('all');

  // New Event Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventType, setNewEventType] = useState<'meeting' | 'project' | 'task' | 'payment'>('meeting');
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEventTime, setNewEventTime] = useState('11:00');
  const [newEventClient, setNewEventClient] = useState('NexusForge AI');

  // Local Custom Meetings & Events
  const [customEvents, setCustomEvents] = useState<ExtendedCalendarEvent[]>([
    {
      id: 'meet-1',
      title: 'Client Sprint Sync with Liam Chen',
      date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      type: 'project',
      status: 'scheduled',
      time: '14:30',
      client: 'NexusForge AI',
    },
    {
      id: 'meet-2',
      title: 'Brand Strategy Review — SolarCraft Studios',
      date: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      type: 'project',
      status: 'scheduled',
      time: '16:00',
      client: 'SolarCraft Studios',
    },
  ]);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Combine projects, tasks, payments, and custom meetings into unified events
  const allEvents: ExtendedCalendarEvent[] = useMemo(() => {
    const list: ExtendedCalendarEvent[] = [...customEvents];

    // 1. Projects Deadlines
    projects.forEach((p) => {
      if (p.due_date) {
        list.push({
          id: `proj-${p.id}`,
          title: `Project Delivery: ${p.title}`,
          date: p.due_date,
          type: 'project',
          status: p.status,
          client: p.client?.name || 'Client',
          time: '18:00',
          metadata: { client: p.client?.name, progress: p.progress_percent },
        });
      }
    });

    // 2. Tasks Due Dates
    tasks.forEach((t) => {
      if (t.due_date) {
        list.push({
          id: `task-${t.id}`,
          title: `Task Milestone: ${t.title}`,
          date: t.due_date,
          type: 'task',
          status: t.status,
          priority: t.priority,
          time: '12:00',
          metadata: { priority: t.priority },
        });
      }
    });

    // 3. Payments Due Dates
    payments.forEach((py) => {
      if (py.due_date && py.status !== 'paid') {
        const project = projects.find((p) => p.id === py.project_id);
        list.push({
          id: `pay-${py.id}`,
          title: `Payment Due: ${formatCurrency(py.amount)}`,
          date: py.due_date,
          type: 'payment',
          status: py.status,
          amount: py.amount,
          time: '15:00',
          metadata: { project: project?.title, amount: py.amount },
        });
      }
    });

    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [projects, tasks, payments, customEvents]);

  // Filter events based on selected filter
  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return allEvents;
    return allEvents.filter((e) => e.type === filterType);
  }, [allEvents, filterType]);

  // Days in month calculation
  const calendarDays = useMemo(() => {
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday
    // Adjust so week starts on Monday (0: Mon, 6: Sun)
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const days: {
      date: Date;
      isCurrentMonth: boolean;
      dateString: string;
      dayNumber: number;
    }[] = [];

    // Leading days from previous month
    for (let i = adjustedFirstDay - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateString: d.toISOString().split('T')[0],
        dayNumber: daysInPrevMonth - i,
      });
    }

    // Days of current month
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(currentYear, currentMonth, i);
      days.push({
        date: d,
        isCurrentMonth: true,
        dateString: d.toISOString().split('T')[0],
        dayNumber: i,
      });
    }

    // Trailing days to fill 35 or 42 grid cells
    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(currentYear, currentMonth + 1, i);
      days.push({
        date: d,
        isCurrentMonth: false,
        dateString: d.toISOString().split('T')[0],
        dayNumber: i,
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // Events map for quick date lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, ExtendedCalendarEvent[]>();
    filteredEvents.forEach((event) => {
      const currentList = map.get(event.date) || [];
      map.set(event.date, [...currentList, event]);
    });
    return map;
  }, [filteredEvents]);

  // Selected date events
  const selectedDateString = selectedDate.toISOString().split('T')[0];
  const selectedDateEvents = eventsByDate.get(selectedDateString) || [];

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentDate(now);
    setSelectedDate(now);
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const created: ExtendedCalendarEvent = {
      id: `custom-${Date.now()}`,
      title: newEventTitle,
      date: newEventDate,
      type: newEventType,
      status: 'scheduled',
      time: newEventTime,
      client: newEventClient,
    };

    setCustomEvents((prev) => [created, ...prev]);
    setAddModalOpen(false);
    setNewEventTitle('');
  };

  // Month name formatting
  const currentMonthName = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric',
  }).format(currentDate);

  const selectedDayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(selectedDate);

  const isToday = (d: Date) => {
    const now = new Date();
    return (
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  };

  const isSelected = (d: Date) => {
    return (
      d.getDate() === selectedDate.getDate() &&
      d.getMonth() === selectedDate.getMonth() &&
      d.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <div className="w-full bg-white font-sans text-slate-900 select-none pb-12">
      {/* ========================================================= */}
      {/* TOP HEADER: Month title, Controls, Filters                */}
      {/* ========================================================= */}
      <div className="px-8 sm:px-10 lg:px-12 pt-6 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              <span>{currentMonthName}</span>
              {isToday(currentDate) && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Current
                </span>
              )}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5 font-medium">
              Real-time studio operating schedule & deadlines
            </p>
          </div>

          {/* Month Stepper Buttons & Today Jump */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200/80 rounded-xl p-1 shadow-2xs">
            <button
              onClick={handlePrevMonth}
              title="Previous month"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleJumpToToday}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-white transition"
            >
              Today
            </button>
            <button
              onClick={handleNextMonth}
              title="Next month"
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right Controls: View Switcher, Filter, Add Event */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* View Mode Segmented Pill */}
          <div className="flex items-center bg-slate-100/80 rounded-xl p-1 border border-slate-200/60 text-xs font-medium">
            <button
              onClick={() => setViewMode('month')}
              className={cn(
                'px-3 py-1 rounded-lg transition-all',
                viewMode === 'month'
                  ? 'bg-white text-slate-950 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={cn(
                'px-3 py-1 rounded-lg transition-all',
                viewMode === 'week'
                  ? 'bg-white text-slate-950 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Week
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={cn(
                'px-3 py-1 rounded-lg transition-all',
                viewMode === 'agenda'
                  ? 'bg-white text-slate-950 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              )}
            >
              Agenda
            </button>
          </div>

          {/* Add Event Button */}
          <button
            onClick={() => {
              setNewEventDate(selectedDateString);
              setAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-all shadow-sm active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Schedule</span>
          </button>
        </div>
      </div>

      {/* Filter Category Tabs */}
      <div className="px-8 sm:px-10 lg:px-12 py-3 flex items-center gap-2 overflow-x-auto border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-400 mr-2 flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          Filter:
        </span>
        {(
          [
            { id: 'all', label: 'All Items' },
            { id: 'project', label: 'Project Milestones' },
            { id: 'task', label: 'Tasks Due' },
            { id: 'payment', label: 'Invoices & Payouts' },
            { id: 'meeting', label: 'Client Syncs' },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id as any)}
            className={cn(
              'px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap',
              filterType === tab.id
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* MAIN VIEW: Calendar Grid & Selected Day Drawer            */}
      {/* ========================================================= */}
      <div className="px-8 sm:px-10 lg:px-12 pt-6 grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Calendar Grid Area (Col 1 to 8) */}
        <div className="xl:col-span-8 space-y-4">
          {viewMode === 'month' && (
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs bg-white">
              {/* Day of Week Header Row */}
              <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/70 text-center py-2.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div className="text-slate-400">Sat</div>
                <div className="text-slate-400">Sun</div>
              </div>

              {/* Real Month Days Grid */}
              <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 bg-white">
                {calendarDays.map((dayItem, index) => {
                  const dayEvents = eventsByDate.get(dayItem.dateString) || [];
                  const todayMatch = isToday(dayItem.date);
                  const selectedMatch = isSelected(dayItem.date);

                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedDate(dayItem.date)}
                      className={cn(
                        'min-h-[105px] p-2 flex flex-col justify-between transition-colors cursor-pointer group relative',
                        dayItem.isCurrentMonth ? 'bg-white' : 'bg-slate-50/40 text-slate-400',
                        selectedMatch && 'bg-blue-50/30 ring-2 ring-blue-600 ring-inset',
                        !selectedMatch && 'hover:bg-slate-50/80'
                      )}
                    >
                      {/* Top Row: Date Number and Status */}
                      <div className="flex items-center justify-between">
                        <span
                          className={cn(
                            'text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center transition-all',
                            todayMatch && 'bg-blue-600 text-white font-bold shadow-2xs',
                            !todayMatch && dayItem.isCurrentMonth && 'text-slate-800',
                            !todayMatch && !dayItem.isCurrentMonth && 'text-slate-300'
                          )}
                        >
                          {dayItem.dayNumber}
                        </span>

                        {dayEvents.length > 0 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        )}
                      </div>

                      {/* Event Badges list */}
                      <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            title={`${ev.title} (${ev.time || ''})`}
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[10px] font-medium truncate flex items-center gap-1 transition-all',
                              ev.type === 'project' && 'bg-blue-50 text-blue-700 border border-blue-200/60',
                              ev.type === 'task' && 'bg-emerald-50 text-emerald-700 border border-emerald-200/60',
                              ev.type === 'payment' && 'bg-amber-50 text-amber-800 border border-amber-200/60',
                              ev.type === 'meeting' && 'bg-purple-50 text-purple-700 border border-purple-200/60'
                            )}
                          >
                            <span className="w-1 h-1 rounded-full bg-current flex-shrink-0" />
                            <span className="truncate">{ev.title.replace(/^[^:]+:\s*/, '')}</span>
                          </div>
                        ))}

                        {dayEvents.length > 2 && (
                          <div className="text-[9px] font-bold text-slate-400 pl-1">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'week' && (
            <div className="border border-slate-200/80 rounded-2xl overflow-hidden shadow-2xs bg-white">
              <div className="grid grid-cols-7 divide-x divide-slate-100 min-h-[460px]">
                {calendarDays.slice(0, 7).map((dayItem, idx) => {
                  const dayEvents = eventsByDate.get(dayItem.dateString) || [];
                  const todayMatch = isToday(dayItem.date);

                  return (
                    <div
                      key={idx}
                      onClick={() => setSelectedDate(dayItem.date)}
                      className={cn(
                        'p-3 flex flex-col cursor-pointer transition',
                        isSelected(dayItem.date) ? 'bg-blue-50/30 ring-2 ring-blue-600 ring-inset' : 'hover:bg-slate-50/70'
                      )}
                    >
                      <div className="text-center pb-3 border-b border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                        </p>
                        <p
                          className={cn(
                            'text-base font-bold mt-0.5 inline-block w-7 h-7 rounded-full leading-7',
                            todayMatch ? 'bg-blue-600 text-white' : 'text-slate-800'
                          )}
                        >
                          {dayItem.dayNumber}
                        </p>
                      </div>

                      <div className="mt-3 space-y-2 flex-1">
                        {dayEvents.map((ev) => (
                          <div
                            key={ev.id}
                            className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs space-y-1 hover:border-slate-300"
                          >
                            <span className="text-[10px] font-bold text-blue-600">{ev.time}</span>
                            <p className="font-semibold text-slate-900 line-clamp-2 leading-tight">
                              {ev.title}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === 'agenda' && (
            <div className="space-y-3">
              {filteredEvents.length === 0 ? (
                <div className="p-12 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
                  No upcoming deadlines found.
                </div>
              ) : (
                filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => {
                      if (ev.type === 'project') navigate('/projects');
                      if (ev.type === 'task') navigate('/tasks');
                      if (ev.type === 'payment') navigate('/payments');
                    }}
                    className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-slate-300 hover:shadow-xs flex items-center justify-between cursor-pointer transition"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 rounded-xl flex items-center justify-center font-bold',
                          ev.type === 'project' && 'bg-blue-50 text-blue-600',
                          ev.type === 'task' && 'bg-emerald-50 text-emerald-600',
                          ev.type === 'payment' && 'bg-amber-50 text-amber-600',
                          ev.type === 'meeting' && 'bg-purple-50 text-purple-600'
                        )}
                      >
                        {ev.type === 'payment' ? <RupeeIcon className="w-4 h-4" /> : <CalendarIcon className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-slate-900">{ev.title}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {formatDate(ev.date)} &bull; {ev.time || 'All day'} &bull; {ev.client || 'Internal'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Selected Date Timeline Drawer (Col 9 to 12) */}
        <div className="xl:col-span-4 space-y-5">
          <div className="border border-slate-200/80 rounded-2xl p-6 bg-white shadow-2xs space-y-5">
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Daily Briefing
                </p>
                <h3 className="text-base font-bold text-slate-900">{selectedDayFormatted}</h3>
              </div>
              <button
                onClick={() => {
                  setNewEventDate(selectedDateString);
                  setAddModalOpen(true);
                }}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700"
                title="Add event on this date"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Event list for selected date */}
            <div className="space-y-3">
              {selectedDateEvents.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-slate-50/70 rounded-xl space-y-2">
                  <CheckSquare className="w-7 h-7 mx-auto text-slate-300" />
                  <p className="text-xs font-semibold text-slate-700">No scheduled deadlines</p>
                  <p className="text-[11px] text-slate-400">
                    This day is currently open. Click &apos;+&apos; to schedule a milestone or sync.
                  </p>
                </div>
              ) : (
                selectedDateEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-slate-50 transition space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {ev.time || '10:00 AM'}
                      </span>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                        {ev.type}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{ev.title}</h4>

                    <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                      <span>{ev.client || 'VS Studio'}</span>
                      <button
                        onClick={() => {
                          if (ev.type === 'project') navigate('/projects');
                          if (ev.type === 'task') navigate('/tasks');
                          if (ev.type === 'payment') navigate('/payments');
                        }}
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Studio Deadlines Summary */}
          <div className="border border-slate-200/80 rounded-2xl p-5 bg-slate-50/50 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Monthly Checkpoints
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-white border border-slate-200/70">
                <span className="text-slate-400 text-[10px]">Active Deliveries</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{projects.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200/70">
                <span className="text-slate-400 text-[10px]">Open Tasks</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{tasks.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL: Schedule Event / Meeting                           */}
      {/* ========================================================= */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setAddModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 animate-fade-in space-y-5 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Schedule Studio Event</h3>
                  <p className="text-[11px] text-slate-400">Add to master operational calendar</p>
                </div>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEventSubmit} className="space-y-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Design Handoff with NexusForge"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 outline-none focus:border-blue-600 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs bg-white"
                  >
                    <option value="meeting">Client Sync / Meeting</option>
                    <option value="project">Project Milestone</option>
                    <option value="task">Task Deadline</option>
                    <option value="payment">Payment Due</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client / Stakeholder</label>
                  <input
                    type="text"
                    value={newEventClient}
                    onChange={(e) => setNewEventClient(e.target.value)}
                    placeholder="e.g. Liam Chen"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 shadow-sm"
                >
                  Confirm Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOverview } from '../hooks/useOverview';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { useAuth } from '../context/AuthContext';
import {
  SlidersHorizontal,
  Calendar as CalendarIcon,
  Filter,
  Check,
  CheckSquare,
  LayoutGrid,
  Wand2,
  Users,
  MessageSquare,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  X,
  Plus,
  User,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '../lib/utils';

export const Overview: React.FC = () => {
  const { metrics, isLoading } = useOverview();
  const { projects, createProject } = useProjects();
  const { tasks } = useTasks();
  const { adminProfile } = useAuth();
  const navigate = useNavigate();

  // Active state for chart day selection (defaults to Wednesday like the reference image)
  const [selectedDay, setSelectedDay] = useState<
    'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday'
  >('Wednesday');

  // Bottom left segmented tab switch: 'projects' | 'members'
  const [activeTab, setActiveTab] = useState<'projects' | 'members'>('projects');

  // Date range filter
  const [dateRange, setDateRange] = useState('This week');
  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);

  // Modals
  const [setupModalOpen, setSetupModalOpen] = useState(false);
  const [customizeModalOpen, setCustomizeModalOpen] = useState(false);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  // Quick project setup form state
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectClient, setNewProjectClient] = useState('');
  const [newProjectBudget, setNewProjectBudget] = useState('500000');
  const [newProjectService, setNewProjectService] = useState<'website_design_dev' | 'branding_design' | 'ai_agents_automation'>('website_design_dev');

  const handleCreateQuickProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectTitle.trim()) return;

    try {
      await createProject({
        title: newProjectTitle,
        client_id: 'c0000000-0000-0000-0000-000000000001',
        service_type: newProjectService,
        status: 'planning',
        progress_percent: 10,
        start_date: new Date().toISOString().split('T')[0],
        due_date: null,
        assigned_to: adminProfile?.id || null,
      });
      setSetupModalOpen(false);
      setNewProjectTitle('');
      navigate('/projects');
    } catch (err) {
      console.error(err);
    }
  };

  // Chart data matching reference visual
  const chartDays: {
    day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
    height: string;
    completed: number;
    pct: string;
  }[] = [
    { day: 'Monday', height: 'h-40', completed: 24, pct: '40.0%' },
    { day: 'Tuesday', height: 'h-24', completed: 18, pct: '30.5%' },
    { day: 'Wednesday', height: 'h-52', completed: 32, pct: '50.25%' },
    { day: 'Thursday', height: 'h-36', completed: 28, pct: '45.0%' },
    { day: 'Friday', height: 'h-20', completed: 14, pct: '22.8%' },
  ];

  const currentDayStats = chartDays.find((d) => d.day === selectedDay) || chartDays[2];

  // Dynamic metrics with graceful fallback
  const completedTasksCount = 60;
  const collaboratorsCount = 25;
  const upcomingCount = metrics.activeProjectsCount > 0 ? metrics.activeProjectsCount + 12 : 18;

  return (
    <div className="w-full bg-white font-sans text-slate-900 select-none pb-12">
      {/* Top Header Row (seamlessly merged with nav bar above) */}
      <div className="px-8 sm:px-10 lg:px-12 pt-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Overview</h1>
        </div>

        {/* Controls: VS AI, Customize, This week dropdown, Filter icon */}
        <div className="flex items-center gap-2.5">
          {/* VS AI Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-bot'))}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-amber-200/90 bg-amber-50/70 hover:bg-amber-100/90 text-amber-900 text-xs font-semibold transition shadow-2xs active:scale-95 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 transition-transform group-hover:rotate-12" />
            <span className="font-bold">VS AI</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          </button>

          {/* Customize Button */}
          <button
            onClick={() => setCustomizeModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-2xs active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-600" />
            <span>Customize</span>
          </button>

          {/* Date Picker Dropdown */}
          <div className="relative">
            <button
              onClick={() => setDateDropdownOpen(!dateDropdownOpen)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-2xs active:scale-95"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-slate-600" />
              <span>{dateRange}</span>
              <span className="text-[10px] text-slate-400">▼</span>
            </button>

            {dateDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setDateDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-xl border border-slate-200/80 p-1.5 z-40 animate-fade-in text-xs">
                  {['This week', 'Last week', 'This month', 'This quarter'].map((range) => (
                    <button
                      key={range}
                      onClick={() => {
                        setDateRange(range);
                        setDateDropdownOpen(false);
                      }}
                      className={cn(
                        'w-full text-left px-3 py-1.5 rounded-lg transition font-medium',
                        dateRange === range
                          ? 'bg-slate-100 text-slate-900 font-bold'
                          : 'text-slate-600 hover:bg-slate-50'
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Filter Icon Button */}
          <button
            onClick={() => setCustomizeModalOpen(true)}
            className="p-2 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-600 transition shadow-2xs active:scale-95"
            title="Filter view"
          >
            <Filter className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Grid: 2-Column Split Layout with Crisp Hairline Divider */}
      <div className="border-t border-slate-100 grid grid-cols-1 xl:grid-cols-12 min-h-[680px]">
        {/* ========================================================= */}
        {/* LEFT COLUMN: Metrics, Bar Chart, Projects                 */}
        {/* ========================================================= */}
        <div className="xl:col-span-7 p-8 sm:p-10 lg:p-12 space-y-9">
          {/* 1. Top 3 Metric Cards with Technical Corner Ticks (┌ ┐ └ ┘) */}
          <div className="relative border border-slate-200/80 rounded-none p-6 sm:p-7 bg-white">
            {/* 4 Corner Registration Marks */}
            <div className="corner-tick-tl" />
            <div className="corner-tick-tr" />
            <div className="corner-tick-bl" />
            <div className="corner-tick-br" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
              {/* Metric 1: Tasks completed */}
              <div className="space-y-1.5 sm:pr-4">
                <p className="text-xs font-medium text-slate-700">Tasks completed</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">
                    {completedTasksCount}
                  </span>
                  <span className="text-emerald-500 font-semibold text-xs flex items-center">
                    <span className="text-[11px] mr-0.5">↗</span> 15%
                  </span>
                </div>
                <p className="text-xs text-slate-400">52 in the last week</p>
              </div>

              {/* Metric 2: Collaborators */}
              <div className="space-y-1.5 pt-4 sm:pt-0 sm:px-6">
                <p className="text-xs font-medium text-slate-700">Collaborators</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">
                    {collaboratorsCount}
                  </span>
                  <span className="text-emerald-500 font-semibold text-xs flex items-center">
                    <span className="text-[11px] mr-0.5">↗</span> 2%
                  </span>
                </div>
                <p className="text-xs text-slate-400">24 in the last week</p>
              </div>

              {/* Metric 3: Upcoming */}
              <div className="space-y-1.5 pt-4 sm:pt-0 sm:pl-6">
                <p className="text-xs font-medium text-slate-700">Upcoming</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900 tracking-tight">
                    {upcomingCount}
                  </span>
                  <span className="text-emerald-500 font-semibold text-xs flex items-center">
                    <span className="text-[11px] mr-0.5">↗</span> 25%
                  </span>
                </div>
                <p className="text-xs text-slate-400">14 in the last week</p>
              </div>
            </div>
          </div>

          {/* 2. Interactive Weekly Pillar / Bar Chart */}
          <div className="relative pt-6 pb-2">
            {/* Chart Area with Pillars */}
            <div className="relative h-64 flex items-end justify-between px-2 sm:px-4">
              {chartDays.map((item) => {
                const isSelected = selectedDay === item.day;

                return (
                  <div
                    key={item.day}
                    onClick={() => setSelectedDay(item.day)}
                    className="relative flex flex-col items-center flex-1 max-w-[84px] group cursor-pointer"
                  >
                    {/* Floating Popover / Tooltip (visible above selected day) */}
                    {isSelected && (
                      <div className="absolute -top-16 z-20 animate-fade-in pointer-events-none flex flex-col items-center">
                        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.08),0_8px_10px_-6px_rgba(0,0,0,0.05)] p-2.5 px-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {currentDayStats.completed}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {currentDayStats.pct}
                            </span>
                            {/* 3 Overlapping mini user avatars */}
                            <div className="flex items-center -space-x-1 ml-1">
                              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 border border-white text-[8px] font-bold text-white flex items-center justify-center" title="VISHNU VARDHAN R G">
                                V
                              </div>
                              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 border border-white text-[8px] font-bold text-white flex items-center justify-center" title="SRIRAM S">
                                S
                              </div>
                              <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-emerald-400 to-teal-500 border border-white text-[8px] font-bold text-white flex items-center justify-center" title="Elena">
                                E
                              </div>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">Tasks completed</p>
                        </div>
                        {/* Connecting Indicator Tail */}
                        <div className="w-px h-3 bg-slate-300" />
                      </div>
                    )}

                    {/* Pillar Base Track */}
                    <div
                      className={cn(
                        'w-full rounded-2xl transition-all duration-300 flex items-end justify-center overflow-hidden',
                        item.height,
                        isSelected
                          ? 'bg-blue-100/70 ring-2 ring-blue-500/20'
                          : 'bg-[#d8e8f8]/80 group-hover:bg-[#cbe0f4]'
                      )}
                    >
                      {/* Inner Filled Block */}
                      {isSelected ? (
                        <div className="w-full h-28 bg-[#2563eb] rounded-2xl transition-all duration-300 shadow-sm" />
                      ) : (
                        <div className="w-full h-8 bg-transparent" />
                      )}
                    </div>

                    {/* Day label */}
                    <span
                      className={cn(
                        'text-xs mt-3 transition-colors',
                        isSelected ? 'font-bold text-slate-900' : 'text-slate-400 font-medium'
                      )}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Bottom Segmented Control & Project / Member List */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            {/* Segmented Switch: Projects | Members */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => setActiveTab('projects')}
                className={cn(
                  'text-xs transition-colors',
                  activeTab === 'projects'
                    ? 'font-bold text-slate-900'
                    : 'text-slate-400 hover:text-slate-700'
                )}
              >
                Projects
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={cn(
                  'text-xs transition-colors',
                  activeTab === 'members'
                    ? 'font-bold text-slate-900'
                    : 'text-slate-400 hover:text-slate-700'
                )}
              >
                Members
              </button>
            </div>

            {/* List Content */}
            {activeTab === 'projects' ? (
              <div className="space-y-2.5">
                {/* Project Row 1: Dopamine (matches reference) */}
                <div
                  onClick={() => navigate('/projects')}
                  className="bg-slate-100/70 hover:bg-slate-100 rounded-2xl p-3 px-4 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-[10px]">
                      ◐
                    </div>
                    <span className="text-xs font-semibold text-slate-800">Dopamine</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">365</span>
                    <span className="text-xs text-slate-400 font-medium">81.1%</span>
                  </div>
                </div>

                {/* Project Row 2: Citable (matches reference) */}
                <div
                  onClick={() => navigate('/projects')}
                  className="bg-slate-50/70 hover:bg-slate-100 rounded-2xl p-3 px-4 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-slate-200/80 flex items-center justify-center text-slate-700 text-[10px]">
                      ↗
                    </div>
                    <span className="text-xs font-semibold text-slate-800">Citable</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">25</span>
                    <span className="text-xs text-slate-400 font-medium">81.1%</span>
                  </div>
                </div>

                {/* Project Row 3: Active Studio Project from DB */}
                {projects.slice(0, 1).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate('/projects')}
                    className="bg-slate-50/70 hover:bg-slate-100 rounded-2xl p-3 px-4 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                        ★
                      </div>
                      <span className="text-xs font-semibold text-slate-800 truncate max-w-xs">
                        {p.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">
                        {p.progress_percent}%
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Active</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Founders & Collaborators List */}
                {[
                  { name: 'VISHNU VARDHAN R G', role: 'Founder & Principal', email: 'vishnu@vsstudio.com', tasks: 12 },
                  { name: 'SRIRAM S', role: 'Founder & Principal', email: 'sriram@vsstudio.com', tasks: 9 },
                  { name: 'Elena Rostova', role: 'Aurora Cloud Lead', email: 'elena@auroratech.io', tasks: 5 },
                ].map((member) => (
                  <div
                    key={member.email}
                    onClick={() => navigate('/clients')}
                    className="bg-slate-50/70 hover:bg-slate-100 rounded-2xl p-3 px-4 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{member.name}</p>
                        <p className="text-[10px] text-slate-400">{member.role}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900">{member.tasks}</span>
                      <span className="text-xs text-slate-400">tasks</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Centered "View all" Button */}
            <div className="flex justify-center pt-2">
              <button
                onClick={() => navigate(activeTab === 'projects' ? '/projects' : '/clients')}
                className="px-5 py-1.5 rounded-xl border border-slate-200/80 hover:border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium transition shadow-2xs active:scale-95"
              >
                View all
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN (approx 40% width): Start Project, Checklist, Meters */}
        {/* ========================================================= */}
        <div className="xl:col-span-5 p-8 sm:p-10 lg:p-12 border-t xl:border-t-0 xl:border-l border-slate-100 space-y-8 bg-white">
          {/* 1. "Start your next project" & 1-click setup Button */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Start your next project
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Getting started with projects and tasks
              </p>
            </div>

            {/* ✦ 1-click setup Button (matches reference) */}
            <button
              onClick={() => setSetupModalOpen(true)}
              className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-3.5 py-2 text-xs font-semibold flex items-center gap-1.5 shadow-sm active:scale-95 transition-all flex-shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-click setup</span>
            </button>
          </div>

          {/* 2. Setup / Action Checklist Card */}
          <div className="border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-2xs">
            {/* Row 1: Home views */}
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/50 transition">
              <div className="flex items-center gap-3.5">
                <LayoutGrid className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Home views</p>
                  <p className="text-[11px] text-slate-400">Your project overview</p>
                </div>
              </div>
              <button
                disabled
                className="px-3.5 py-1.5 rounded-lg text-slate-400 text-xs font-medium cursor-default"
              >
                Customized
              </button>
            </div>

            {/* Row 2: Tasks completed / Import (Highlighted in screenshot!) */}
            <div
              onClick={() => navigate('/tasks')}
              className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <CheckSquare className="w-4 h-4 text-slate-800" />
                <div>
                  <p className="text-xs font-bold text-slate-900">Tasks completed</p>
                  <p className="text-[11px] text-slate-400">Import existing tasks</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate('/tasks');
                }}
                className="bg-white border border-slate-200 group-hover:border-slate-300 shadow-2xs px-4 py-1.5 rounded-lg text-xs font-bold text-slate-900 hover:bg-slate-50 transition active:scale-95"
              >
                Import
              </button>
            </div>

            {/* Row 3: AI Assistant */}
            <div className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/50 transition">
              <div className="flex items-center gap-3.5">
                <Wand2 className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">AI Assistant</p>
                  <p className="text-[11px] text-slate-400">Get help with tasks</p>
                </div>
              </div>
              <button
                disabled
                className="px-3.5 py-1.5 rounded-lg text-slate-400 text-xs font-medium cursor-default"
              >
                Installed
              </button>
            </div>

            {/* Row 4: Invite members */}
            <div
              onClick={() => setInviteModalOpen(true)}
              className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <Users className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Invite members</p>
                  <p className="text-[11px] text-slate-400">Add teammates</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setInviteModalOpen(true);
                }}
                className="bg-white border border-slate-200 group-hover:border-slate-300 shadow-2xs px-4 py-1.5 rounded-lg text-xs font-bold text-slate-900 hover:bg-slate-50 transition active:scale-95"
              >
                Invite
              </button>
            </div>

            {/* Row 5: Schedule meeting */}
            <div
              onClick={() => setScheduleModalOpen(true)}
              className="p-3.5 px-4 flex items-center justify-between hover:bg-slate-50/70 transition cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Schedule meeting</p>
                  <p className="text-[11px] text-slate-400">Start planning now</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setScheduleModalOpen(true);
                }}
                className="bg-white border border-slate-200 group-hover:border-slate-300 shadow-2xs px-4 py-1.5 rounded-lg text-xs font-bold text-slate-900 hover:bg-slate-50 transition active:scale-95"
              >
                Schedule
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ========================================================= */}
      {/* Interactive Modal: 1-Click Setup */}
      {/* ========================================================= */}
      {setupModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setSetupModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 animate-fade-in space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">1-Click Project Setup</h3>
                  <p className="text-[11px] text-slate-400">Launch a new client workspace instantly</p>
                </div>
              </div>
              <button
                onClick={() => setSetupModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuickProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next-Gen AI Platform"
                  value={newProjectTitle}
                  onChange={(e) => setNewProjectTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none text-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Service Type</label>
                <select
                  value={newProjectService}
                  onChange={(e) => setNewProjectService(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-600 outline-none text-slate-900 text-xs bg-white"
                >
                  <option value="website_design_dev">Website Design & Development</option>
                  <option value="branding_design">Brand Identity & Design System</option>
                  <option value="ai_agents_automation">AI Agents & Workflow Automations</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Contract Budget (INR ₹)</label>
                <input
                  type="number"
                  required
                  value={newProjectBudget}
                  onChange={(e) => setNewProjectBudget(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/10 outline-none text-slate-900 text-xs"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSetupModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition shadow-sm"
                >
                  Launch Workspace
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Interactive Modal: Customize Widgets */}
      {/* ========================================================= */}
      {customizeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setCustomizeModalOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 animate-fade-in space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Customize Dashboard Views</h3>
              <button
                onClick={() => setCustomizeModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Enable or reorder widgets displayed on your primary studio overview canvas.
            </p>
            <div className="space-y-2">
              {[
                { title: 'Weekly Pillar Completion Chart', active: true },
                { title: 'Technical Corner KPI Metrics', active: true },
                { title: 'Interactive Setup Checklist', active: true },
                { title: 'Projects & AI Progress Meters', active: true },
              ].map((w, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                >
                  <span className="font-semibold text-slate-800">{w.title}</span>
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">
                    ✓
                  </span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setCustomizeModalOpen(false)}
              className="w-full mt-2 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Interactive Modal: Invite Members */}
      {/* ========================================================= */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setInviteModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 animate-fade-in space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Invite Team or Client</h3>
              <button
                onClick={() => setInviteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-500 leading-relaxed">
              Send an invitation link to invite collaborators or client reviewers into VS Studio.
            </p>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                placeholder="colleague@domain.com"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs"
              />
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setInviteModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setInviteModalOpen(false);
                  navigate('/clients');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
              >
                Send Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* Interactive Modal: Schedule Meeting */}
      {/* ========================================================= */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setScheduleModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 animate-fade-in space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Schedule Client Sync / Meeting</h3>
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-slate-500">
              Create a meeting milestone that appears directly in the studio Calendar.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Meeting Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Design System Review"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 outline-none text-xs bg-white"
                />
              </div>
            </div>
            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => setScheduleModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setScheduleModalOpen(false);
                  navigate('/calendar');
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800"
              >
                Open Calendar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

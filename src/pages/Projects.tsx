import React, { useState, useMemo } from 'react';
import { useProjects } from '../hooks/useProjects';
import { ProjectCard } from '../components/projects/ProjectCard';
import { CreateProjectModal } from '../components/projects/CreateProjectModal';
import { ProjectStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  formatDate,
  formatCurrency,
  formatServiceType,
  getDaysRemaining,
  getProjectStatusBadge,
} from '../lib/utils';
import {
  FolderKanban,
  LayoutGrid,
  List,
  Plus,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { RupeeIcon } from '../components/ui/RupeeIcon';

export const Projects: React.FC = () => {
  const { projects, isLoading, updateStatus, updateProgress, createProject } = useProjects();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const columns: { key: ProjectStatus; label: string; dotColor: string }[] = [
    { key: 'planning', label: 'Planning', dotColor: 'bg-sky-500' },
    { key: 'in_progress', label: 'In Progress', dotColor: 'bg-emerald-500' },
    { key: 'review', label: 'Review & QA', dotColor: 'bg-amber-500' },
    { key: 'completed', label: 'Completed', dotColor: 'bg-green-600' },
    { key: 'on_hold', label: 'On Hold', dotColor: 'bg-slate-400' },
  ];

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.client?.name && p.client.name.toLowerCase().includes(search.toLowerCase()));
      const matchesService = selectedService === 'all' || p.service_type === selectedService;
      return matchesSearch && matchesService;
    });
  }, [projects, search, selectedService]);

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Active Projects Hub
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {projects.length} Total Engagements
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Client Delivery Board
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Track client delivery, progress benchmarks, deadlines, and project cashflow
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Segmented View Mode Toggle */}
          <div className="segmented-pill-container">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'kanban'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                viewMode === 'list'
                  ? 'bg-white text-slate-950 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px]">List</span>
            </button>
          </div>

          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-full text-xs font-semibold px-4 py-2 shadow-xs"
          >
            New Project
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-full border border-slate-200 outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full sm:w-48 rounded-full bg-white border border-slate-200 px-3.5 py-2 text-xs text-slate-700 outline-none focus:border-emerald-500 shadow-2xs"
          >
            <option value="all">All Studio Services</option>
            <option value="website_design_dev">Web Design & Dev</option>
            <option value="logo_branding">Logo & Branding</option>
            <option value="ai_agents_automation">AI & Automations</option>
          </select>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === 'kanban' ? (
        /* Kanban Board */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start overflow-x-auto pb-4">
          {columns.map((col) => {
            const colProjects = filteredProjects.filter((p) => p.status === col.key);
            return (
              <div
                key={col.key}
                className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3.5 min-w-[240px] space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <h3 className="text-xs font-bold text-slate-800 tracking-tight">{col.label}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-slate-600 border border-slate-200 shadow-2xs">
                    {colProjects.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 min-h-[150px]">
                  {colProjects.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 text-xs italic">
                      No projects
                    </div>
                  ) : (
                    colProjects.map((p) => (
                      <ProjectCard
                        key={p.id}
                        project={p}
                        onStatusChange={(id, status) => updateStatus({ id, status })}
                        onProgressChange={(id, progress) => updateProgress({ id, progress })}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="minimal-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 font-bold">
                <tr>
                  <th className="py-3.5 px-5">Project Title & Client</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Progress</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-5 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((p) => {
                  const statusBadge = getProjectStatusBadge(p.status);
                  const daysInfo = getDaysRemaining(p.due_date);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{p.title}</div>
                        <div className="text-[11px] text-slate-500">{p.client?.name}</div>
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">
                        {formatServiceType(p.service_type)}
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-emerald-600 h-full rounded-full"
                              style={{ width: `${p.progress_percent}%` }}
                            />
                          </div>
                          <span className="font-bold text-slate-700">{p.progress_percent}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`font-semibold ${
                            daysInfo.isOverdue
                              ? 'text-rose-600'
                              : daysInfo.isDueSoon
                              ? 'text-amber-700'
                              : 'text-slate-600'
                          }`}
                        >
                          {daysInfo.text} ({formatDate(p.due_date)})
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right font-bold">
                        {p.outstanding_balance && p.outstanding_balance > 0 ? (
                          <span className="text-amber-700">
                            {formatCurrency(p.outstanding_balance)} left
                          </span>
                        ) : (
                          <span className="text-emerald-700 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Paid
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={async (params) => {
          await createProject(params);
        }}
      />
    </div>
  );
};

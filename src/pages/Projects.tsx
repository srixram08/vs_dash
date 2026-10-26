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
  Filter,
  AlertTriangle,
  Clock,
} from 'lucide-react';

export const Projects: React.FC = () => {
  const { projects, isLoading, updateStatus, updateProgress, createProject } = useProjects();
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [search, setSearch] = useState('');
  const [selectedService, setSelectedService] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const columns: { key: ProjectStatus; label: string; dotColor: string }[] = [
    { key: 'planning', label: 'Planning', dotColor: 'bg-blue-400' },
    { key: 'in_progress', label: 'In Progress', dotColor: 'bg-cyan-400' },
    { key: 'review', label: 'Review & QA', dotColor: 'bg-amber-400' },
    { key: 'completed', label: 'Completed', dotColor: 'bg-emerald-400' },
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
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Active Projects Hub
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">
              {projects.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Track client delivery, progress benchmarks, deadlines, and project cashflow
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'kanban'
                  ? 'bg-primary-600/30 text-cyan-400 border border-primary-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Kanban Board View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition ${
                viewMode === 'list'
                  ? 'bg-primary-600/30 text-cyan-400 border border-primary-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="gradient"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
          >
            New Project
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Input
            placeholder="Search projects or clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
        <div className="w-full sm:w-auto">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full sm:w-48 rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 outline-none focus:border-primary-500"
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
                className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-3 min-w-[240px] space-y-3"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                    <h3 className="text-xs font-bold text-slate-200">{col.label}</h3>
                  </div>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                    {colProjects.length}
                  </span>
                </div>

                {/* Cards Container */}
                <div className="space-y-3 min-h-[150px]">
                  {colProjects.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs italic">
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
        <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4 font-semibold">Project Title & Client</th>
                  <th className="py-3 px-4 font-semibold">Service</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Progress</th>
                  <th className="py-3 px-4 font-semibold">Deadline</th>
                  <th className="py-3 px-4 font-semibold text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredProjects.map((p) => {
                  const statusBadge = getProjectStatusBadge(p.status);
                  const daysInfo = getDaysRemaining(p.due_date);
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100">{p.title}</div>
                        <div className="text-[11px] text-slate-400">{p.client?.name}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {formatServiceType(p.service_type)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${statusBadge.className}`}
                        >
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-cyan-500 h-full rounded-full"
                              style={{ width: `${p.progress_percent}%` }}
                            />
                          </div>
                          <span className="font-medium text-slate-300">{p.progress_percent}%</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-medium ${
                            daysInfo.isOverdue
                              ? 'text-rose-400 font-bold'
                              : daysInfo.isDueSoon
                              ? 'text-amber-400 font-bold'
                              : 'text-slate-400'
                          }`}
                        >
                          {daysInfo.text} ({formatDate(p.due_date)})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold">
                        {p.outstanding_balance && p.outstanding_balance > 0 ? (
                          <span className="text-amber-400">
                            {formatCurrency(p.outstanding_balance)} left
                          </span>
                        ) : (
                          <span className="text-emerald-400">Paid</span>
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

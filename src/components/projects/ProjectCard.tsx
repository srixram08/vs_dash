import React from 'react';
import { ProjectWithRelations, ProjectStatus } from '../../types';
import {
  formatDate,
  formatCurrency,
  formatServiceType,
  getDaysRemaining,
  getProjectStatusBadge,
} from '../../lib/utils';
import { Calendar, Clock, DollarSign, CheckCircle2, AlertTriangle } from 'lucide-react';

interface ProjectCardProps {
  project: ProjectWithRelations;
  onStatusChange: (id: string, status: ProjectStatus) => void;
  onProgressChange: (id: string, progress: number) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onStatusChange,
  onProgressChange,
}) => {
  const daysInfo = getDaysRemaining(project.due_date);
  const statusBadge = getProjectStatusBadge(project.status);

  return (
    <div className="glass-card rounded-xl p-4 space-y-3 border border-slate-800/90 relative group">
      {/* Header: Title & Service Tag */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
            {formatServiceType(project.service_type)}
          </span>
          {/* Status Quick Changer */}
          <select
            value={project.status}
            onChange={(e) => onStatusChange(project.id, e.target.value as ProjectStatus)}
            className="bg-slate-900 border border-slate-700/80 text-[10px] font-semibold rounded px-1.5 py-0.5 text-slate-300 outline-none focus:border-primary-500 cursor-pointer"
          >
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </select>
        </div>

        <h3 className="text-xs font-semibold text-slate-100 mt-1 line-clamp-2 leading-snug">
          {project.title}
        </h3>
        <p className="text-[11px] text-slate-400 mt-0.5 truncate">
          Client: {project.client?.name || 'Assigned Client'}
        </p>
      </div>

      {/* Progress Bar & Quick Slider */}
      <div className="space-y-1">
        <div className="flex justify-between text-[11px]">
          <span className="text-slate-400">Progress</span>
          <span className="font-semibold text-slate-200">{project.progress_percent}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              project.progress_percent === 100
                ? 'bg-emerald-400'
                : 'bg-gradient-to-r from-primary-500 to-cyan-400'
            }`}
            style={{ width: `${project.progress_percent}%` }}
          />
        </div>
      </div>

      {/* Financials & Deadline Footer */}
      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
        {/* Deadline Indicator with Color Flag */}
        <div
          className={`flex items-center gap-1 font-medium ${
            daysInfo.isOverdue
              ? 'text-rose-400 font-bold'
              : daysInfo.isDueSoon
              ? 'text-amber-400 font-bold'
              : 'text-slate-400'
          }`}
        >
          {daysInfo.isOverdue ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 flex-shrink-0 animate-pulse" />
          ) : (
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span>{daysInfo.text}</span>
        </div>

        {/* Outstanding Balance */}
        <div className="font-semibold text-slate-300">
          {project.outstanding_balance && project.outstanding_balance > 0 ? (
            <span className="text-amber-400" title="Outstanding balance">
              {formatCurrency(project.outstanding_balance)} left
            </span>
          ) : (
            <span className="text-emerald-400">Paid in full</span>
          )}
        </div>
      </div>
    </div>
  );
};

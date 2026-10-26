import React from 'react';
import { ProjectWithRelations, ProjectStatus } from '../../types';
import {
  formatDate,
  formatCurrency,
  formatServiceType,
  getDaysRemaining,
  getProjectStatusBadge,
} from '../../lib/utils';
import { Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RupeeIcon } from '../ui/RupeeIcon';

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
    <div className="minimal-card rounded-2xl p-4 sm:p-5 space-y-3.5 relative group bg-white shadow-2xs font-sans">
      {/* Header: Service Tag & Status Selector */}
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/60 uppercase tracking-wider">
          {formatServiceType(project.service_type)}
        </span>

        {/* Status Selector Pill */}
        <select
          value={project.status}
          onChange={(e) => onStatusChange(project.id, e.target.value as ProjectStatus)}
          className="bg-slate-50 border border-slate-200/80 text-[10px] font-semibold rounded-full px-2.5 py-1 text-slate-700 outline-none focus:border-emerald-500 cursor-pointer shadow-2xs transition-colors"
        >
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="review">Review</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
        </select>
      </div>

      {/* Project Title & Client */}
      <div>
        <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
          {project.title}
        </h3>
        <p className="text-[11px] text-slate-500 mt-1 truncate">
          Client: <span className="font-medium text-slate-700">{project.client?.name || 'Assigned Client'}</span>
        </p>
      </div>

      {/* Progress Bar & Slider */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[11px]">
          <span className="text-slate-400 font-medium">Completion</span>
          <span className="font-bold text-slate-800">{project.progress_percent}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              project.progress_percent === 100
                ? 'bg-emerald-600'
                : 'bg-gradient-to-r from-emerald-500 to-green-500'
            }`}
            style={{ width: `${project.progress_percent}%` }}
          />
        </div>
      </div>

      {/* Financials & Deadline Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
        {/* Deadline Indicator with Color Flag */}
        <div
          className={`flex items-center gap-1 font-semibold ${
            daysInfo.isOverdue
              ? 'text-rose-600'
              : daysInfo.isDueSoon
              ? 'text-amber-700'
              : 'text-slate-500'
          }`}
        >
          {daysInfo.isOverdue ? (
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0 animate-pulse" />
          ) : (
            <Calendar className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
          )}
          <span>{daysInfo.text}</span>
        </div>

        {/* Outstanding Balance in INR (₹) */}
        <div className="font-bold">
          {project.outstanding_balance && project.outstanding_balance > 0 ? (
            <span className="text-amber-700 font-bold" title="Outstanding balance">
              {formatCurrency(project.outstanding_balance)} left
            </span>
          ) : (
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Paid
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

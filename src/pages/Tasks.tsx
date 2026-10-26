import React, { useState, useMemo } from 'react';
import { useTasks } from '../hooks/useTasks';
import { useProjects } from '../hooks/useProjects';
import { Task, TaskStatus, TaskPriority } from '../types';
import { CreateTaskModal } from '../components/tasks/CreateTaskModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  formatDate,
  getDaysRemaining,
  getTaskPriorityBadge,
} from '../lib/utils';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  User,
} from 'lucide-react';

export const Tasks: React.FC = () => {
  const { tasks, isLoading, updateStatus, createTask } = useTasks();
  const { projects } = useProjects();
  const [search, setSearch] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const statuses: { key: TaskStatus; label: string; dot: string }[] = [
    { key: 'todo', label: 'To Do', dot: 'bg-slate-400' },
    { key: 'doing', label: 'In Progress', dot: 'bg-cyan-400' },
    { key: 'done', label: 'Completed', dot: 'bg-emerald-400' },
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

      const matchesAssignee =
        selectedAssignee === 'all' || t.assignee === selectedAssignee;

      const matchesPriority =
        selectedPriority === 'all' || t.priority === selectedPriority;

      return matchesSearch && matchesAssignee && matchesPriority;
    });
  }, [tasks, search, selectedAssignee, selectedPriority]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Founder Task Board
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">
              {tasks.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Global action items and checklist across all active studio deliverables
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Add Task
        </Button>
      </div>

      {/* Filter and Assignee Selector */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full max-w-md">
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedAssignee}
            onChange={(e) => setSelectedAssignee(e.target.value)}
            className="w-full sm:w-48 rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 outline-none focus:border-primary-500"
          >
            <option value="all">All Assignees</option>
            <option value="a0000000-0000-0000-0000-000000000001">Sanjay (Dev & AI)</option>
            <option value="a0000000-0000-0000-0000-000000000002">Sriram (Design)</option>
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full sm:w-36 rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 outline-none focus:border-primary-500"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Task Kanban Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
        {statuses.map((st) => {
          const colTasks = filteredTasks.filter((t) => t.status === st.key);
          return (
            <div
              key={st.key}
              className="rounded-xl border border-slate-800/80 bg-slate-900/40 p-4 space-y-3"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${st.dot}`} />
                  <h3 className="text-xs font-bold text-slate-200">{st.label}</h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-2.5 min-h-[200px]">
                {colTasks.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs italic">
                    No tasks in {st.label.toLowerCase()}
                  </div>
                ) : (
                  colTasks.map((t) => {
                    const project = projects.find((p) => p.id === t.project_id);
                    const priorityBadge = getTaskPriorityBadge(t.priority);
                    const daysInfo = getDaysRemaining(t.due_date);

                    return (
                      <div
                        key={t.id}
                        className="glass-card rounded-xl p-3.5 space-y-2.5 border border-slate-800/80"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${priorityBadge.className}`}
                          >
                            {priorityBadge.label}
                          </span>

                          {/* Quick status transition dropdown */}
                          <select
                            value={t.status}
                            onChange={(e) =>
                              updateStatus({ id: t.id, status: e.target.value as TaskStatus })
                            }
                            className="bg-slate-900 border border-slate-700/80 text-[10px] font-semibold rounded px-1.5 py-0.5 text-slate-300 outline-none focus:border-primary-500"
                          >
                            <option value="todo">To Do</option>
                            <option value="doing">Doing</option>
                            <option value="done">Done</option>
                          </select>
                        </div>

                        <div>
                          <h4
                            className={`text-xs font-medium text-slate-100 ${
                              t.status === 'done' ? 'line-through text-slate-400' : ''
                            }`}
                          >
                            {t.title}
                          </h4>
                          {t.description && (
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                              {t.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                          <span className="truncate text-[10px] text-cyan-400/90 font-medium">
                            {project?.title || 'Project'}
                          </span>
                          {t.due_date && (
                            <span
                              className={`text-[10px] font-semibold ${
                                daysInfo.isOverdue && t.status !== 'done'
                                  ? 'text-rose-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {daysInfo.text}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <CreateTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={async (params) => {
          await createTask(params);
        }}
      />
    </div>
  );
};

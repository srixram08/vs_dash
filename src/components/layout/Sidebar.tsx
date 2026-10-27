import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Calendar,
  Lightbulb,
  Link2,
  Plus,
  Users,
  FileText,
  CreditCard,
  LogOut,
  X,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';
import { VSLogo } from '../ui/VSLogo';

interface SidebarProps {
  onMobileClose?: () => void;
  newInquiriesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ onMobileClose, newInquiriesCount = 0 }) => {
  const { adminProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);

  const navItems = [
    { name: 'Overview', to: '/', icon: LayoutDashboard },
    { name: 'Projects', to: '/projects', icon: FolderKanban },
    { name: 'Tasks', to: '/tasks', icon: CheckSquare },
    { name: 'Calendar', to: '/calendar', icon: Calendar },
    {
      name: 'Inquiries',
      to: '/inquiries',
      icon: Lightbulb,
      badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
    },
    { name: 'Payments', to: '/payments', icon: Link2 },
  ];

  return (
    <>
      {/* Desktop Slim Icon Rail */}
      <aside className="w-[68px] flex-shrink-0 flex flex-col justify-between items-center py-5 h-screen border-r border-slate-200/60 bg-white select-none z-30">
        {/* Top: Official VS Studio Brand Mark */}
        <div className="flex flex-col items-center">
          <NavLink
            to="/"
            title="VS Studio Dashboard"
            className="group relative flex items-center justify-center"
          >
            <div className="w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-900 cursor-pointer transition-all duration-200 group-hover:scale-105 active:scale-95 flex items-center justify-center shadow-xs">
              <VSLogo className="w-5 h-5 text-white" size={22} color="#ffffff" />
            </div>
          </NavLink>
        </div>

        {/* Center: Slim Nav Icons */}
        <nav className="flex flex-col items-center gap-6 my-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                title={item.name}
                className={({ isActive }) =>
                  cn(
                    'relative group p-2.5 rounded-xl transition-all duration-150 flex items-center justify-center',
                    isActive
                      ? 'text-slate-950 bg-slate-100/90'
                      : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={cn(
                        'w-5 h-5 stroke-[1.75] transition-colors',
                        isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-slate-700'
                      )}
                    />

                    {/* Notification dot */}
                    {item.badge !== undefined && (
                      <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                    )}

                    {/* Tooltip on hover */}
                    <span className="absolute left-14 px-2.5 py-1 rounded-md text-xs font-semibold text-white bg-slate-900 shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom: Plus Quick Action Button */}
        <div className="relative flex flex-col items-center">
          <button
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            title="Quick actions"
            className="w-10 h-10 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-2xs group active:scale-95"
          >
            <Plus className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90 text-slate-700" />
          </button>

          {/* Quick Create Dropup Menu */}
          {quickCreateOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setQuickCreateOpen(false)}
              />
              <div className="absolute left-14 bottom-0 z-50 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 text-xs divide-y divide-slate-100 animate-fade-in">
                <div className="p-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Quick Actions
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setQuickCreateOpen(false);
                      navigate('/projects');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                  >
                    <FolderKanban className="w-4 h-4 text-blue-600" />
                    <span>New Project</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickCreateOpen(false);
                      navigate('/tasks');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                  >
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>Add Task</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickCreateOpen(false);
                      navigate('/inquiries');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500" />
                    <span>Log New Lead</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuickCreateOpen(false);
                      navigate('/payments');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium flex items-center gap-2"
                  >
                    <Link2 className="w-4 h-4 text-purple-600" />
                    <span>Record Payment</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Drawer (When on mobile screen) */}
      {onMobileClose && (
        <div className="lg:hidden w-64 bg-white h-full flex flex-col justify-between p-5 border-r border-slate-200">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center shadow-xs">
                  <VSLogo className="w-5 h-5 text-white" size={20} color="#ffffff" />
                </div>
                <span className="font-bold text-slate-900 text-sm">VS Studio</span>
              </div>
              <button
                onClick={onMobileClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="mt-5 space-y-1">
              {[
                { name: 'Overview', to: '/', icon: LayoutDashboard },
                { name: 'Projects', to: '/projects', icon: FolderKanban },
                { name: 'Tasks', to: '/tasks', icon: CheckSquare },
                { name: 'Calendar', to: '/calendar', icon: Calendar },
                { name: 'Inquiries', to: '/inquiries', icon: Lightbulb },
                { name: 'Clients', to: '/clients', icon: Users },
                { name: 'Proposals', to: '/proposals', icon: FileText },
                { name: 'Payments', to: '/payments', icon: CreditCard },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    onClick={onMobileClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition',
                        isActive
                          ? 'bg-slate-900 text-white'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      )
                    }
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs">
              <p className="font-bold text-slate-900">{adminProfile?.name || 'Founder'}</p>
              <p className="text-[11px] text-slate-400">{adminProfile?.email}</p>
            </div>
            <button
              onClick={() => signOut()}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

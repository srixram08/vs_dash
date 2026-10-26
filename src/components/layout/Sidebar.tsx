import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  CreditCard,
  Calendar,
  LogOut,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface SidebarProps {
  onMobileClose?: () => void;
  newInquiriesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ onMobileClose, newInquiriesCount = 0 }) => {
  const { adminProfile, signOut, isDemoMode } = useAuth();

  const navItems = [
    { name: 'Overview', to: '/', icon: LayoutDashboard },
    {
      name: 'Inquiries',
      to: '/inquiries',
      icon: Inbox,
      badge: newInquiriesCount > 0 ? newInquiriesCount : undefined,
    },
    { name: 'Clients', to: '/clients', icon: Users },
    { name: 'Projects', to: '/projects', icon: FolderKanban },
    { name: 'Tasks', to: '/tasks', icon: CheckSquare },
    { name: 'Proposals', to: '/proposals', icon: FileText },
    { name: 'Payments', to: '/payments', icon: CreditCard },
    { name: 'Calendar', to: '/calendar', icon: Calendar },
  ];

  return (
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen border-r border-slate-200 bg-white select-none font-sans">
      {/* Studio Header */}
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-500 flex items-center justify-center shadow-md">
            <span className="font-extrabold text-white text-base tracking-tighter">VS</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm tracking-tight text-slate-900">VS Studio</h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-normal">Founders Portal</p>
          </div>
        </div>
      </div>

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-emerald-50/80 border border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-800">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
          <span>Demo mode active. Live data syncs when Supabase is linked.</span>
        </div>
      )}

      {/* Nav Menu */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Main Workspace
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onMobileClose}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'group flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all',
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-emerald-600' : 'text-slate-400 group-hover:text-slate-600'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-600 text-white">
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Founder Profile & Logout */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-xs font-bold text-emerald-800">
              {adminProfile?.name ? adminProfile.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="text-xs font-bold text-slate-800 truncate">
                  {adminProfile?.name || 'Founder'}
                </p>
                <ShieldCheck className="w-3 h-3 text-emerald-600 flex-shrink-0" />
              </div>
              <p className="text-[10px] text-slate-500 truncate">
                {adminProfile?.email || 'founder@vsstudio.com'}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

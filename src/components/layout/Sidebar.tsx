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
    <aside className="w-64 flex-shrink-0 flex flex-col h-screen border-r border-slate-800/80 bg-[#0c1220]/95 backdrop-blur-md select-none">
      {/* Studio Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-cyan-400 flex items-center justify-center shadow-glow-sm">
            <span className="font-extrabold text-white text-base tracking-tighter">VS</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-bold text-sm tracking-tight text-white">VS Studio</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary-500/20 text-primary-300 border border-primary-500/30">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-normal">Founders Operating System</p>
          </div>
        </div>
      </div>

      {/* Demo Mode Notice */}
      {isDemoMode && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-2 text-[11px] text-amber-300">
          <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-amber-400" />
          <span>Demo mode active. Live data enabled when Supabase connected.</span>
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
                    ? 'bg-gradient-to-r from-primary-600/20 to-cyan-500/10 text-white border border-primary-500/30 shadow-sm'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 transition-colors',
                        isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-cyan-500 text-slate-950 animate-pulse">
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
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/60">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-primary-600/30 border border-primary-500/40 flex items-center justify-center text-xs font-bold text-primary-300">
              {adminProfile?.name ? adminProfile.name.charAt(0).toUpperCase() : 'F'}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {adminProfile?.name || 'Founder'}
                </p>
                <ShieldCheck className="w-3 h-3 text-cyan-400 flex-shrink-0" />
              </div>
              <p className="text-[10px] text-slate-400 truncate">
                {adminProfile?.email || 'founder@vsstudio.com'}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Sign out"
            className="p-1.5 rounded-md text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

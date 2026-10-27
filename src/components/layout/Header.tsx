import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  CheckCircle2,
  FolderKanban,
  Users,
  Inbox,
  LogOut,
  X,
  Plus,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useInquiries } from '../../hooks/useInquiries';
import { useProjects } from '../../hooks/useProjects';
import { useTasks } from '../../hooks/useTasks';
import { cn } from '../../lib/utils';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { adminProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const { inquiries } = useInquiries();
  const { projects } = useProjects();
  const { tasks } = useTasks();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Shortcut ⌘K / Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setNotificationsOpen(false);
        setUserMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const topTabs = [
    { name: 'Overview', to: '/' },
    { name: 'Projects', to: '/projects' },
    { name: 'Tasks', to: '/tasks' },
    { name: 'Activities', to: '/inquiries' },
    { name: 'Members', to: '/clients' },
    { name: 'Storage', to: '/proposals' },
    { name: 'Payments', to: '/payments' },
  ];

  // Filter items in quick search
  const filteredProjects = projects.filter((p) =>
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredInquiries = inquiries.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.service_type.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const pendingInquiries = inquiries.filter((i) => i.status === 'new');

  return (
    <>
      <header className="h-14 border-b border-slate-100 bg-white/95 backdrop-blur-md px-8 sm:px-10 lg:px-12 flex items-center justify-between sticky top-0 z-20 font-sans select-none">
        {/* Left: Mobile hamburger & Horizontal Nav Tabs */}
        <div className="flex items-center gap-6">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Desktop Top Tabs (matches reference screenshot) */}
          <nav className="hidden lg:flex items-center gap-8">
            {topTabs.map((tab) => {
              const isActive =
                tab.to === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(tab.to);

              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={cn(
                    'relative py-4 text-[13px] font-medium transition-colors',
                    isActive
                      ? 'text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-700'
                  )}
                >
                  {tab.name}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-slate-950 rounded-full" />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Right side controls: Search bar, Import button, Bell, User Profile */}
        <div className="flex items-center gap-3">
          {/* "Search or ask AI..." input pill */}
          <div
            onClick={() => setSearchOpen(true)}
            className="relative hidden sm:flex items-center cursor-pointer group"
          >
            <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-slate-300 transition-all text-xs text-slate-400 w-52 md:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
              <span className="truncate">Search or ask AI...</span>
              <kbd className="ml-auto px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 shadow-2xs">
                ⌘ K
              </kbd>
            </div>
          </div>

          {/* VS AI Quick Trigger */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-ai-bot'))}
            title="Open VS AI"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-200/80 bg-amber-50/80 hover:bg-amber-100 text-amber-900 text-xs font-semibold transition-all shadow-2xs active:scale-95 group"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 transition-transform group-hover:rotate-12" />
            <span className="hidden md:inline font-bold">VS AI</span>
          </button>

          {/* "Import" Button (matches reference screenshot) */}
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold transition-all shadow-2xs active:scale-95"
          >
            Import
          </button>

          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 transition"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600" />
              {pendingInquiries.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setNotificationsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-3 z-40 animate-fade-in divide-y divide-slate-100 text-xs">
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-bold text-slate-900 text-sm">Notifications</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
                      {pendingInquiries.length} New
                    </span>
                  </div>
                  <div className="py-2 space-y-2 max-h-72 overflow-y-auto">
                    {pendingInquiries.length === 0 ? (
                      <p className="text-slate-400 text-center py-4 text-xs">
                        No new unread inquiries.
                      </p>
                    ) : (
                      pendingInquiries.map((inq) => (
                        <div
                          key={inq.id}
                          onClick={() => {
                            setNotificationsOpen(false);
                            navigate('/inquiries');
                          }}
                          className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 cursor-pointer transition border border-slate-100"
                        >
                          <p className="font-bold text-slate-800">{inq.name}</p>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {inq.requirements}
                          </p>
                          <span className="inline-block mt-1 text-[10px] font-semibold text-blue-600">
                            {inq.budget_range} &bull; {inq.service_type}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Profile Avatar with Online Status */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 p-0.5 rounded-full hover:ring-2 hover:ring-slate-200 transition"
            >
              <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-amber-200 via-rose-300 to-indigo-400 border border-slate-200 shadow-2xs flex items-center justify-center font-bold text-xs text-slate-800">
                {adminProfile?.name?.charAt(0).toUpperCase() || 'S'}
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              </div>
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 p-2 z-40 animate-fade-in text-xs divide-y divide-slate-100">
                  <div className="p-2">
                    <p className="font-bold text-slate-900">{adminProfile?.name || 'Founder'}</p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {adminProfile?.email || 'founder@vsstudio.com'}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Founder Admin
                    </span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/inquiries');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      Inquiries Inbox
                    </button>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate('/projects');
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      Project Portfolio
                    </button>
                  </div>
                  <div className="pt-1">
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold flex items-center justify-between"
                    >
                      <span>Sign out</span>
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ⌘K Command Palette Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setSearchOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100 z-10 animate-fade-in">
            {/* Search Input */}
            <div className="p-4 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects, tasks, inquiries, or ask AI..."
                className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none font-medium"
              />
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Results List */}
            <div className="p-3 max-h-96 overflow-y-auto space-y-3 text-xs">
              {/* Ask VS AI Banner */}
              <div
                onClick={() => {
                  const q = searchQuery.trim();
                  setSearchOpen(false);
                  setSearchQuery('');
                  window.dispatchEvent(
                    new CustomEvent('open-ai-bot', {
                      detail: { query: q || 'Give me a studio executive briefing' },
                    })
                  );
                }}
                className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 border border-amber-300/60 hover:border-amber-400 cursor-pointer flex items-center justify-between transition group shadow-2xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-950 text-amber-300 flex items-center justify-center shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                      <span>Ask VS AI:</span>
                      <span className="text-amber-800 font-semibold italic truncate max-w-xs">
                        &ldquo;{searchQuery.trim() || 'Studio Executive Briefing'}&rdquo;
                      </span>
                    </p>
                    <p className="text-[10px] text-slate-500">
                      Live real-time intelligence on projects, cash flow, and tasks
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition" />
              </div>

              {searchQuery.trim() === '' ? (
                <div className="space-y-2">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
                    Quick Navigation
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Overview', to: '/', icon: FolderKanban },
                      { name: 'Projects', to: '/projects', icon: FolderKanban },
                      { name: 'Tasks', to: '/tasks', icon: CheckCircle2 },
                      { name: 'Inquiries', to: '/inquiries', icon: Inbox },
                      { name: 'Clients', to: '/clients', icon: Users },
                      { name: 'Calendar', to: '/calendar', icon: Sparkles },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.to}
                          onClick={() => {
                            setSearchOpen(false);
                            navigate(item.to);
                          }}
                          className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 cursor-pointer font-medium text-slate-700 transition"
                        >
                          <Icon className="w-4 h-4 text-slate-500" />
                          <span>{item.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  {filteredProjects.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                        Projects ({filteredProjects.length})
                      </p>
                      {filteredProjects.map((p) => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSearchOpen(false);
                            navigate('/projects');
                          }}
                          className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-slate-800"
                        >
                          <span className="font-semibold">{p.title}</span>
                          <span className="text-[11px] text-slate-400 capitalize">{p.status}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredInquiries.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                        Inquiries ({filteredInquiries.length})
                      </p>
                      {filteredInquiries.map((inq) => (
                        <div
                          key={inq.id}
                          onClick={() => {
                            setSearchOpen(false);
                            navigate('/inquiries');
                          }}
                          className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-slate-800"
                        >
                          <span className="font-semibold">{inq.name} ({inq.company || 'Direct'})</span>
                          <span className="text-[11px] text-emerald-600 font-bold">{inq.budget_range}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredTasks.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                        Tasks ({filteredTasks.length})
                      </p>
                      {filteredTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => {
                            setSearchOpen(false);
                            navigate('/tasks');
                          }}
                          className="p-2 rounded-lg hover:bg-slate-50 cursor-pointer flex items-center justify-between text-slate-800"
                        >
                          <span>{t.title}</span>
                          <span className="text-[11px] text-slate-400">{t.due_date || 'No due date'}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {filteredProjects.length === 0 &&
                    filteredInquiries.length === 0 &&
                    filteredTasks.length === 0 && (
                      <div className="py-8 text-center text-slate-400">
                        No matches found for &ldquo;{searchQuery}&rdquo;.
                      </div>
                    )}
                </>
              )}
            </div>

            <div className="p-3 bg-slate-50/70 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Press <kbd className="px-1 py-0.5 bg-white border rounded">ESC</kbd> to exit</span>
              <span>VS Studio Intelligent Search</span>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div
            className="fixed inset-0"
            onClick={() => setImportModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 z-10 animate-fade-in space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Import Workspace Data</h3>
              <button
                onClick={() => setImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Import existing projects, tasks, or client inquiries from CSV, Notion, Linear, or JSON format.
            </p>
            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  navigate('/tasks');
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left flex items-center justify-between text-xs font-semibold text-slate-800 transition"
              >
                <span>Import Tasks (.csv / .json)</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  navigate('/clients');
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left flex items-center justify-between text-xs font-semibold text-slate-800 transition"
              >
                <span>Import Clients & Contacts</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
              <button
                onClick={() => {
                  setImportModalOpen(false);
                  navigate('/projects');
                }}
                className="w-full p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-left flex items-center justify-between text-xs font-semibold text-slate-800 transition"
              >
                <span>Import Projects from Linear / Jira</span>
                <ArrowRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

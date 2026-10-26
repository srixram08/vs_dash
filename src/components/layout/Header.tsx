import React, { useState } from 'react';
import { Menu, Search, Zap, Bell, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';
import { RupeeIcon } from '../ui/RupeeIcon';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, title }) => {
  const { isDemoMode } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <header className="h-16 border-b border-slate-200/80 bg-white/95 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20 font-sans">
      <div className="flex items-center gap-4 flex-1">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {title && (
          <h2 className="text-base font-bold text-slate-900 tracking-tight hidden sm:block">
            {title}
          </h2>
        )}

        {/* Minimal Search Pill Input */}
        <div className="relative max-w-sm w-full hidden md:block">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Quick search (Press ⌘K)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-12 py-2 rounded-full border border-slate-200/80 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-2xs"
            />
            <kbd className="absolute right-3 px-1.5 py-0.5 rounded text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 shadow-2xs">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Prominent Indian Rupee (INR) Badge */}
        <div
          title="All financials rendered in Indian Rupees (INR) with en-IN formatting"
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs shadow-2xs"
        >
          <RupeeIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-bold text-[11px] tracking-wide">INR (₹)</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse hidden sm:inline-block" />
        </div>

        {/* Realtime Supabase Status Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
            }`}
          />
          <span className="text-slate-600 text-[11px] font-medium">
            {isSupabaseConfigured
              ? 'Realtime Sync Active'
              : isDemoMode
              ? 'Demo Mock Data'
              : 'Supabase Unlinked'}
          </span>
        </div>

        {/* Studio Services Badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80 text-xs text-slate-700">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          <span className="font-semibold text-[11px]">Web &bull; Brand &bull; AI</span>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { Menu, Zap, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../lib/supabase';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, title }) => {
  const { isDemoMode } = useAuth();

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#0c1220]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h2 className="text-base font-semibold text-slate-100">{title}</h2>}
      </div>

      <div className="flex items-center gap-3">
        {/* Realtime Supabase Status indicator */}
        <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              isSupabaseConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
            }`}
          />
          <span className="text-slate-400 text-[11px]">
            {isSupabaseConfigured
              ? 'Realtime Sync Active'
              : isDemoMode
              ? 'Demo Mock Data'
              : 'Supabase Unlinked'}
          </span>
        </div>

        {/* Studio Services Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-primary-950/40 to-cyan-950/40 border border-primary-500/20 text-xs text-primary-200">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span className="font-medium text-[11px]">Web &bull; Brand &bull; AI Agents</span>
        </div>
      </div>
    </header>
  );
};

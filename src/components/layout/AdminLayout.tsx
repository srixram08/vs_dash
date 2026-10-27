import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AIAssistantBot } from '../ai/AIAssistantBot';
import { useInquiries } from '../../hooks/useInquiries';

export const AdminLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { inquiries } = useInquiries();

  const newInquiriesCount = inquiries?.filter((inq) => inq.status === 'new').length || 0;

  return (
    <div className="flex h-screen bg-white text-slate-900 overflow-hidden font-sans">
      {/* Desktop Slim Left Rail */}
      <div className="hidden lg:block flex-shrink-0">
        <Sidebar newInquiriesCount={newInquiriesCount} />
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10">
            <Sidebar
              onMobileClose={() => setMobileMenuOpen(false)}
              newInquiriesCount={newInquiriesCount}
            />
          </div>
        </div>
      )}

      {/* Main Dashboard Canvas Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-white relative">
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>

        {/* Global AI Copilot Bot */}
        <AIAssistantBot />
      </div>
    </div>
  );
};

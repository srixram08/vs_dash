import React, { useState, useMemo } from 'react';
import { useInquiries } from '../hooks/useInquiries';
import { Inquiry, ServiceType, InquiryStatus } from '../types';
import {
  formatDate,
  formatRelativeTime,
  formatServiceType,
  getInquiryStatusBadge,
} from '../lib/utils';
import { InquiryDetailDrawer } from '../components/inquiries/InquiryDetailDrawer';
import { ConvertToProjectModal } from '../components/inquiries/ConvertToProjectModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Search, Plus, Filter, Sparkles, ChevronRight, Inbox, FileText } from 'lucide-react';
import { RupeeIcon } from '../components/ui/RupeeIcon';

export const Inquiries: React.FC = () => {
  const { inquiries, isLoading, updateStatus, updateNotes, submitTestInquiry, convertToProject } =
    useInquiries();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [inquiryToConvert, setInquiryToConvert] = useState<Inquiry | null>(null);

  // Status Counts
  const counts = useMemo(() => {
    return {
      all: inquiries.length,
      new: inquiries.filter((i) => i.status === 'new').length,
      reviewing: inquiries.filter((i) => i.status === 'reviewing').length,
      proposal_sent: inquiries.filter((i) => i.status === 'proposal_sent').length,
      accepted: inquiries.filter((i) => i.status === 'accepted').length,
      rejected: inquiries.filter((i) => i.status === 'rejected').length,
    };
  }, [inquiries]);

  // Filtered List
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesStatus = selectedStatus === 'all' || inq.status === selectedStatus;
      const matchesService = selectedService === 'all' || inq.service_type === selectedService;
      const matchesSearch =
        inq.name.toLowerCase().includes(search.toLowerCase()) ||
        inq.email.toLowerCase().includes(search.toLowerCase()) ||
        (inq.company && inq.company.toLowerCase().includes(search.toLowerCase())) ||
        inq.requirements.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesService && matchesSearch;
    });
  }, [inquiries, selectedStatus, selectedService, search]);

  const handleRowClick = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setIsDrawerOpen(true);
  };

  const handleOpenConvert = (inq: Inquiry) => {
    setInquiryToConvert(inq);
    setIsConvertModalOpen(true);
  };

  const handleSimulatePublicLead = async () => {
    const testSamples = [
      {
        name: 'Zephyr AI Labs',
        company: 'Zephyr Corp',
        email: 'founder@zephyrlabs.io',
        service_type: 'ai_agents_automation' as ServiceType,
        budget_range: '₹10,00,000 - ₹18,00,000',
        requirements:
          'Building autonomous customer research agents that query web data and synthesize market briefs in Markdown.',
      },
      {
        name: 'Aetheria Studio',
        company: 'Aetheria Luxury',
        email: 'creative@aetheria.design',
        service_type: 'logo_branding' as ServiceType,
        budget_range: '₹4,50,000 - ₹8,00,000',
        requirements:
          'Luxury fragrance brand visual identity, embossed packaging tokens, and responsive brand portal.',
      },
      {
        name: 'HyperScale Systems',
        company: 'HyperScale Inc',
        email: 'cto@hyperscale.dev',
        service_type: 'website_design_dev' as ServiceType,
        budget_range: '₹12,00,000 - ₹22,00,000',
        requirements:
          'Developer-centric landing page, interactive terminal demo, dynamic benchmark charts, and Next.js static generation.',
      },
    ];

    const randomLead = testSamples[Math.floor(Math.random() * testSamples.length)];
    await submitTestInquiry({
      ...randomLead,
      phone: '+91 98765 43210',
      deadline: new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
      reference_links: 'https://linear.app, https://resend.com',
      file_urls: ['inquiries/spec-brief.pdf'],
      notes: 'Simulated public website submission via live form.',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header & Simulation Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Realtime Inflow
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {inquiries.length} total submissions
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Inquiries Feed
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Incoming client submissions from your public website form
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-emerald-600" />}
            onClick={handleSimulatePublicLead}
            className="rounded-full text-xs font-semibold px-4 py-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-800"
          >
            Simulate Public Site Lead
          </Button>
        </div>
      </div>

      {/* Segmented Filter Pills (Tran Mau Tri Tam Style) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="segmented-pill-container overflow-x-auto max-w-full">
          {[
            { key: 'all', label: 'All Inquiries', count: counts.all },
            { key: 'new', label: 'New', count: counts.new },
            { key: 'reviewing', label: 'Reviewing', count: counts.reviewing },
            { key: 'proposal_sent', label: 'Proposal Sent', count: counts.proposal_sent },
            { key: 'accepted', label: 'Accepted', count: counts.accepted },
            { key: 'rejected', label: 'Rejected', count: counts.rejected },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedStatus(tab.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                selectedStatus === tab.key
                  ? 'bg-white text-slate-950 font-bold shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  selectedStatus === tab.key
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-200/80 text-slate-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Service Type Filter & Search Bar */}
        <div className="flex items-center gap-2 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter leads..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-3 py-1.5 rounded-full border border-slate-200 outline-none focus:border-emerald-500 shadow-2xs"
            />
          </div>

          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="rounded-full bg-white border border-slate-200 px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-emerald-500 shadow-2xs"
          >
            <option value="all">All Services</option>
            <option value="website_design_dev">Web Design & Dev</option>
            <option value="logo_branding">Logo & Branding</option>
            <option value="ai_agents_automation">AI Automations</option>
          </select>
        </div>
      </div>

      {/* Minimalist Inquiries Table */}
      <div className="minimal-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 font-bold">
              <tr>
                <th className="py-3.5 px-5">Client & Company</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Budget Range</th>
                <th className="py-3.5 px-4">Target Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Received</th>
                <th className="py-3.5 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading inquiries...
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-500">
                    <Inbox className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No inquiries match your filters</p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Try resetting your search query or simulate a test lead above.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((inq) => {
                  const statusBadge = getInquiryStatusBadge(inq.status);
                  return (
                    <tr
                      key={inq.id}
                      onClick={() => handleRowClick(inq)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                          {inq.name}
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{inq.company || inq.email}</span>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-medium text-slate-700">
                        {formatServiceType(inq.service_type)}
                      </td>

                      <td className="py-4 px-4 font-bold text-emerald-800 tracking-tight">
                        {inq.budget_range}
                      </td>

                      <td className="py-4 px-4 text-slate-600">
                        {formatDate(inq.deadline)}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border ${statusBadge.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
                          {statusBadge.label}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-500 text-[11px]">
                        {formatRelativeTime(inq.created_at)}
                      </td>

                      <td className="py-4 px-5 text-right">
                        <div className="inline-flex items-center gap-1 text-slate-400 group-hover:text-emerald-700 font-semibold transition-colors">
                          <span className="text-[11px] hidden sm:inline">Details</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <InquiryDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        inquiry={selectedInquiry}
        onStatusChange={async (newStatus) => {
          if (selectedInquiry) {
            await updateStatus({ id: selectedInquiry.id, status: newStatus });
            setSelectedInquiry({ ...selectedInquiry, status: newStatus });
          }
        }}
        onNotesChange={async (newNotes) => {
          if (selectedInquiry) {
            await updateNotes({ id: selectedInquiry.id, notes: newNotes });
            setSelectedInquiry({ ...selectedInquiry, notes: newNotes });
          }
        }}
        onOpenConvertModal={(inq) => handleOpenConvert(inq)}
      />

      {/* Convert to Client + Project Modal */}
      <ConvertToProjectModal
        isOpen={isConvertModalOpen}
        onClose={() => setIsConvertModalOpen(false)}
        inquiry={inquiryToConvert}
        onConvert={async (params) => {
          await convertToProject(params);
        }}
      />
    </div>
  );
};

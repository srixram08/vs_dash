import React, { useState, useMemo } from 'react';
import { useInquiries } from '../hooks/useInquiries';
import { Inquiry, InquiryStatus } from '../types';
import { InquiryDetailDrawer } from '../components/inquiries/InquiryDetailDrawer';
import { ConvertToProjectModal } from '../components/inquiries/ConvertToProjectModal';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import {
  getInquiryStatusBadge,
  formatDate,
  formatRelativeTime,
  formatServiceType,
} from '../lib/utils';
import {
  Search,
  Filter,
  Inbox,
  Sparkles,
  ExternalLink,
  ChevronRight,
  Send,
  PlusCircle,
} from 'lucide-react';

export const Inquiries: React.FC = () => {
  const {
    inquiries,
    isLoading,
    updateStatus,
    updateNotes,
    convertToProject,
    submitTestInquiry,
  } = useInquiries();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [inquiryToConvert, setInquiryToConvert] = useState<Inquiry | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);

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

  // Filtered inquiries
  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      const matchesSearch =
        inq.name.toLowerCase().includes(search.toLowerCase()) ||
        (inq.company && inq.company.toLowerCase().includes(search.toLowerCase())) ||
        inq.email.toLowerCase().includes(search.toLowerCase()) ||
        inq.requirements.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        selectedStatus === 'all' || inq.status === selectedStatus;

      const matchesService =
        selectedService === 'all' || inq.service_type === selectedService;

      return matchesSearch && matchesStatus && matchesService;
    });
  }, [inquiries, search, selectedStatus, selectedService]);

  const handleRowClick = (inquiry: Inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDrawerOpen(true);
  };

  const handleOpenConvert = (inquiry: Inquiry) => {
    setInquiryToConvert(inquiry);
    setIsConvertModalOpen(true);
  };

  const handleSimulatePublicLead = () => {
    const testSamples = [
      {
        name: 'Zephyr AI Labs',
        company: 'Zephyr Corp',
        email: 'founder@zephyrlabs.io',
        service_type: 'ai_agents_automation',
        budget_range: '$12k - $18k',
        requirements:
          'Building autonomous customer research agents that query web data and synthesize market briefs in Markdown.',
      },
      {
        name: 'Aetheria Studio',
        company: 'Aetheria Luxury',
        email: 'creative@aetheria.design',
        service_type: 'logo_branding',
        budget_range: '$6k - $10k',
        requirements:
          'Luxury fragrance brand visual identity, embossed packaging tokens, and responsive brand portal.',
      },
      {
        name: 'HyperScale Systems',
        company: 'HyperScale Inc',
        email: 'cto@hyperscale.dev',
        service_type: 'website_design_dev',
        budget_range: '$15k - $25k',
        requirements:
          'Developer-centric landing page, interactive terminal demo, dynamic benchmark charts, and Next.js static generation.',
      },
    ];

    const randomLead = testSamples[Math.floor(Math.random() * testSamples.length)];
    submitTestInquiry(randomLead);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Simulation Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Inquiries Feed
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Live Realtime
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Incoming client submissions from your public website form
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={handleSimulatePublicLead}
            className="text-xs border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-950/20"
          >
            Simulate Public Site Lead
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { key: 'all', label: 'All Inquiries', count: counts.all },
          { key: 'new', label: 'New Leads', count: counts.new },
          { key: 'reviewing', label: 'Reviewing', count: counts.reviewing },
          { key: 'proposal_sent', label: 'Proposal Sent', count: counts.proposal_sent },
          { key: 'accepted', label: 'Accepted', count: counts.accepted },
          { key: 'rejected', label: 'Rejected', count: counts.rejected },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedStatus(tab.key)}
            className={`px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedStatus === tab.key
                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                selectedStatus === tab.key
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Search and Secondary Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Input
            placeholder="Search inquiries by client name, email, company, requirements..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="w-full sm:w-auto">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full sm:w-48 rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 outline-none focus:border-primary-500"
          >
            <option value="all">All Studio Services</option>
            <option value="website_design_dev">Web Design & Dev</option>
            <option value="logo_branding">Logo & Branding</option>
            <option value="ai_agents_automation">AI & Automations</option>
          </select>
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Client & Company</th>
                <th className="py-3 px-4 font-semibold">Service</th>
                <th className="py-3 px-4 font-semibold">Budget Range</th>
                <th className="py-3 px-4 font-semibold">Deadline</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Received</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading inquiries...
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-medium text-slate-300">No inquiries match your filters</p>
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
                      className="hover:bg-slate-800/50 transition cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100 group-hover:text-cyan-400 transition">
                          {inq.name}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{inq.company || inq.email}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-300">
                        {formatServiceType(inq.service_type)}
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-emerald-400">
                        {inq.budget_range}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400">
                        {formatDate(inq.deadline)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${statusBadge.className}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotClass}`} />
                          {statusBadge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {formatRelativeTime(inq.created_at)}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1 text-slate-400 group-hover:text-white">
                          <span className="text-[11px] font-medium hidden sm:inline">Details</span>
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

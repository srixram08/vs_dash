import React, { useState, useMemo } from 'react';
import { useProposals } from '../hooks/useProposals';
import { useProjects } from '../hooks/useProjects';
import { Proposal, ProposalStatus, DeliverableItem } from '../types';
import { CreateProposalModal } from '../components/proposals/CreateProposalModal';
import { Button } from '../components/ui/Button';
import { RupeeIcon } from '../components/ui/RupeeIcon';
import { formatDate, formatCurrency } from '../lib/utils';
import { FileText, Plus, CheckCircle2, Clock, Send, Eye, TrendingUp } from 'lucide-react';

export const Proposals: React.FC = () => {
  const { proposals, isLoading, updateStatus, createProposal } = useProposals();
  const { projects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalProposalsValue = useMemo(() => {
    return proposals.reduce((acc, p) => acc + (Number(p.total_price) || 0), 0);
  }, [proposals]);

  const acceptedCount = useMemo(() => {
    return proposals.filter((p) => p.status === 'accepted').length;
  }, [proposals]);

  const sentCount = useMemo(() => {
    return proposals.filter((p) => p.status === 'sent').length;
  }, [proposals]);

  const winRate = proposals.length > 0 ? Math.round((acceptedCount / proposals.length) * 100) : 0;

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200/80';
      case 'sent':
        return 'bg-blue-50 text-blue-800 border-blue-200/80';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'draft':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <RupeeIcon className="w-3.5 h-3.5 text-emerald-600" />
              INR Pipeline & Quotes
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {proposals.length} Total Pitches
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Proposals & Deliverables
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scope breakdown, deliverables pricing, validities, and client quote signoffs
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
          className="rounded-full text-xs font-semibold px-4 py-2 shadow-xs"
        >
          New Proposal
        </Button>
      </div>

      {/* Summary KPI Cards (Tran Mau Tri Tam Minimal Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Pipeline Value */}
        <div className="minimal-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Total Pipeline Value
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <RupeeIcon className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalProposalsValue)}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                Active pipeline
              </span>
              <span className="text-[11px] text-slate-400">All submitted quotes</span>
            </div>
          </div>
        </div>

        {/* Win Rate */}
        <div className="minimal-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Proposal Win Rate
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {winRate}%
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60">
                {acceptedCount} accepted
              </span>
              <span className="text-[11px] text-slate-400">Conversion efficiency</span>
            </div>
          </div>
        </div>

        {/* Pending Client Decision */}
        <div className="minimal-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Under Review
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
              {sentCount} Active
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                Sent to clients
              </span>
              <span className="text-[11px] text-slate-400">Awaiting signoff</span>
            </div>
          </div>
        </div>
      </div>

      {/* Proposals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {isLoading ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs">
            Loading proposals...
          </div>
        ) : proposals.length === 0 ? (
          <div className="col-span-2 text-center py-12 text-slate-400 text-xs italic">
            No proposals drafted yet. Click "New Proposal" above to create one.
          </div>
        ) : (
          proposals.map((pr) => {
            const project = projects.find((p) => p.id === pr.project_id);
            const deliverables = (
              Array.isArray(pr.deliverables) ? pr.deliverables : []
            ) as unknown as DeliverableItem[];

            return (
              <div
                key={pr.id}
                className="minimal-card rounded-2xl p-6 space-y-4 hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      {project?.title || 'Standalone Pitch Proposal'}
                    </span>
                    <div className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                      {formatCurrency(pr.total_price)}
                    </div>
                  </div>

                  {/* Status Dropdown Pill */}
                  <select
                    value={pr.status}
                    onChange={(e) =>
                      updateStatus({ id: pr.id, status: e.target.value as ProposalStatus })
                    }
                    className={`text-[11px] font-bold rounded-full px-3 py-1 outline-none border cursor-pointer ${getStatusBadge(
                      pr.status
                    )} bg-white shadow-2xs transition-colors`}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Deliverables Scope List */}
                <div className="space-y-2 pt-3 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Included Scope ({deliverables.length} Deliverable Line Items)
                  </span>
                  <div className="space-y-1.5">
                    {deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-2 px-3.5 rounded-xl bg-slate-50/70 border border-slate-100 text-slate-800"
                      >
                        <span className="truncate pr-2 font-medium">{item.title}</span>
                        <span className="text-emerald-800 font-bold flex-shrink-0">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dates & Validity Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                  <span>Sent: {formatDate(pr.sent_at)}</span>
                  <span className="font-semibold text-slate-700">
                    Valid until: {formatDate(pr.valid_until)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Proposal Modal */}
      <CreateProposalModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={async (params) => {
          await createProposal(params as any);
        }}
      />
    </div>
  );
};

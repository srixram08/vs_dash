import React, { useState } from 'react';
import { useProposals } from '../hooks/useProposals';
import { useProjects } from '../hooks/useProjects';
import { Proposal, ProposalStatus, DeliverableItem } from '../types';
import { CreateProposalModal } from '../components/proposals/CreateProposalModal';
import { Button } from '../components/ui/Button';
import { formatDate, formatCurrency } from '../lib/utils';
import { FileText, Plus, CheckCircle, Clock, Send, Eye } from 'lucide-react';

export const Proposals: React.FC = () => {
  const { proposals, isLoading, updateStatus, createProposal } = useProposals();
  const { projects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);

  const totalProposalsValue = proposals.reduce(
    (acc, p) => acc + (Number(p.total_price) || 0),
    0
  );

  const getStatusBadge = (status: ProposalStatus) => {
    switch (status) {
      case 'accepted':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'sent':
        return 'bg-violet-500/15 text-violet-400 border-violet-500/30';
      case 'rejected':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'draft':
      default:
        return 'bg-slate-500/15 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Proposals & Quotes
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">
              {proposals.length} Total
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Total active proposal pipeline:{' '}
            <span className="font-semibold text-emerald-400">
              {formatCurrency(totalProposalsValue)}
            </span>
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          New Proposal
        </Button>
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
                className="glass-card rounded-2xl p-5 border border-slate-800/80 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        {project?.title || 'Standalone Pitch'}
                      </span>
                    </div>
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 mt-1">
                      {formatCurrency(pr.total_price)}
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <select
                    value={pr.status}
                    onChange={(e) =>
                      updateStatus({ id: pr.id, status: e.target.value as ProposalStatus })
                    }
                    className={`text-[11px] font-semibold rounded-lg px-2.5 py-1 outline-none border cursor-pointer ${getStatusBadge(
                      pr.status
                    )} bg-slate-900`}
                  >
                    <option value="draft">Draft</option>
                    <option value="sent">Sent</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Deliverables Mini List */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800/60">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Included Scope ({deliverables.length} Deliverables)
                  </span>
                  <div className="space-y-1">
                    {deliverables.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-900/40 text-slate-300"
                      >
                        <span className="truncate pr-2 font-medium">{item.title}</span>
                        <span className="text-emerald-400 font-semibold flex-shrink-0">
                          {formatCurrency(item.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dates & Validity Footer */}
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Sent: {formatDate(pr.sent_at)}</span>
                  <span className="font-medium text-slate-300">
                    Valid until: {formatDate(pr.valid_until)}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

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

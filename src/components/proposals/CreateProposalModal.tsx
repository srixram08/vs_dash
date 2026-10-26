import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useProjects } from '../../hooks/useProjects';
import { useInquiries } from '../../hooks/useInquiries';
import { DeliverableItem } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { Plus, Trash2, DollarSign, Calculator } from 'lucide-react';

interface CreateProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (params: {
    inquiry_id?: string | null;
    project_id?: string | null;
    total_price: number;
    deliverables: DeliverableItem[];
    status: 'draft' | 'sent';
    valid_until: string;
    sent_at?: string | null;
  }) => Promise<unknown>;
}

export const CreateProposalModal: React.FC<CreateProposalModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const { projects } = useProjects();
  const { inquiries } = useInquiries();

  const [projectId, setProjectId] = useState<string>('');
  const [inquiryId, setInquiryId] = useState<string>('');
  const [validUntil, setValidUntil] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  });
  const [status, setStatus] = useState<'draft' | 'sent'>('sent');

  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([
    {
      id: '1',
      title: 'Phase 1: Architecture & Brand Design Sprint',
      description: 'Discovery, UX wireframing, moodboards, and vector assets',
      price: 3500,
    },
    {
      id: '2',
      title: 'Phase 2: Production Development & Testing',
      description: 'Frontend implementation, API integrations, and QA testing',
      price: 5000,
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-calculated total
  const totalPrice = deliverables.reduce((acc, item) => acc + (Number(item.price) || 0), 0);

  const handleAddDeliverable = () => {
    setDeliverables((prev) => [
      ...prev,
      {
        id: Math.random().toString(36).substring(2, 9),
        title: '',
        description: '',
        price: 1500,
      },
    ]);
  };

  const handleRemoveDeliverable = (id: string) => {
    if (deliverables.length === 1) return;
    setDeliverables((prev) => prev.filter((d) => d.id !== id));
  };

  const handleUpdateDeliverable = (id: string, field: keyof DeliverableItem, value: any) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, [field]: value } : d))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onCreate({
        project_id: projectId || null,
        inquiry_id: inquiryId || null,
        total_price: totalPrice,
        deliverables,
        status,
        valid_until: validUntil,
        sent_at: status === 'sent' ? new Date().toISOString() : null,
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Commercial Proposal"
      description="Build modular line-item deliverables with dynamic totals for client sign-off."
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs font-sans">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Link to Project (Optional)</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 shadow-sm"
            >
              <option value="">No Project Linked</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Link to Inquiry (Optional)</label>
            <select
              value={inquiryId}
              onChange={(e) => setInquiryId(e.target.value)}
              className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 shadow-sm"
            >
              <option value="">No Inquiry Linked</option>
              {inquiries.map((inq) => (
                <option key={inq.id} value={inq.id}>
                  {inq.name} ({inq.company || inq.service_type})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Deliverables Line Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Line-Item Deliverables & Pricing
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              leftIcon={<Plus className="w-3.5 h-3.5 text-emerald-600" />}
              onClick={handleAddDeliverable}
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-3">
            {deliverables.map((item, index) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 relative group"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[10px] font-bold text-slate-400">#{index + 1}</span>
                  <input
                    type="text"
                    placeholder="Deliverable Title (e.g. AI Workflow Integration)"
                    value={item.title}
                    onChange={(e) => handleUpdateDeliverable(item.id, 'title', e.target.value)}
                    className="flex-1 rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs text-slate-900 outline-none focus:border-emerald-500 shadow-sm"
                    required
                  />
                  <div className="flex items-center gap-1 w-36">
                    <span className="text-slate-500 font-bold">₹</span>
                    <input
                      type="number"
                      placeholder="Price in INR"
                      value={item.price}
                      onChange={(e) =>
                        handleUpdateDeliverable(item.id, 'price', Number(e.target.value))
                      }
                      className="w-full rounded-lg bg-white border border-slate-300 px-2 py-1.5 text-xs text-emerald-700 font-bold outline-none focus:border-emerald-500 shadow-sm"
                      required
                    />
                  </div>
                  {deliverables.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveDeliverable(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <textarea
                  rows={2}
                  placeholder="Scope description, key milestones, and specifications..."
                  value={item.description}
                  onChange={(e) => handleUpdateDeliverable(item.id, 'description', e.target.value)}
                  className="w-full rounded-lg bg-white border border-slate-300 p-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-emerald-500 shadow-sm"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Total Price Bar */}
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-emerald-700" />
            <div>
              <p className="text-xs font-bold text-emerald-950">Total Contract Value</p>
              <p className="text-[11px] text-emerald-700">Sum of all deliverable line items</p>
            </div>
          </div>
          <span className="text-xl font-extrabold text-emerald-800">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Valid Until"
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'sent')}
              className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 shadow-sm"
            >
              <option value="sent">Mark as Sent to Client</option>
              <option value="draft">Save as Internal Draft</option>
            </select>
          </div>
        </div>

        <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" size="sm" isLoading={isSubmitting}>
            Generate Proposal ({formatCurrency(totalPrice)})
          </Button>
        </div>
      </form>
    </Modal>
  );
};

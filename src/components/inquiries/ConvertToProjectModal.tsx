import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Inquiry } from '../../types';
import { formatServiceType } from '../../lib/utils';
import { Sparkles, ArrowRight, UserCheck } from 'lucide-react';

interface ConvertToProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  inquiry: Inquiry | null;
  onConvert: (params: {
    inquiry: Inquiry;
    projectTitle: string;
    startDate: string;
    dueDate: string;
    assignedTo?: string;
  }) => Promise<unknown>;
}

export const ConvertToProjectModal: React.FC<ConvertToProjectModalProps> = ({
  isOpen,
  onClose,
  inquiry,
  onConvert,
}) => {
  const [projectTitle, setProjectTitle] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('a0000000-0000-0000-0000-000000000001');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (inquiry) {
      setProjectTitle(`${inquiry.company || inquiry.name} — ${formatServiceType(inquiry.service_type)}`);
      setDueDate(inquiry.deadline || '');
    }
  }, [inquiry]);

  if (!inquiry) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onConvert({
        inquiry,
        projectTitle,
        startDate,
        dueDate,
        assignedTo,
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
      title="Convert Inquiry to Client + Project"
      description="This will automatically create a new client record, launch the project in Planning status, and log the action in your audit trail."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        {/* Source Inquiry Summary */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Client:</span>
            <span className="font-bold text-slate-800">{inquiry.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Company:</span>
            <span className="text-slate-800 font-medium">{inquiry.company || '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Budget Range:</span>
            <span className="font-bold text-emerald-700">{inquiry.budget_range}</span>
          </div>
        </div>

        <Input
          label="Project Title"
          value={projectTitle}
          onChange={(e) => setProjectTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="Due Date / Launch"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Assign Lead Founder</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full rounded-lg bg-white border border-slate-300 px-3 py-2 text-xs text-slate-800 outline-none focus:border-emerald-500 shadow-sm"
          >
            <option value="a0000000-0000-0000-0000-000000000001">Sanjay (Dev & AI Lead)</option>
            <option value="a0000000-0000-0000-0000-000000000002">Sriram (Brand & Design Lead)</option>
          </select>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            size="sm"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Confirm & Launch Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

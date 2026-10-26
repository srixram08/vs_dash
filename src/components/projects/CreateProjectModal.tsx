import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useClients } from '../../hooks/useClients';
import { ServiceType } from '../../types';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (params: {
    client_id: string;
    title: string;
    service_type: string;
    start_date: string;
    due_date: string;
    assigned_to: string;
    progress_percent: number;
    status: 'planning';
  }) => Promise<unknown>;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const { clients } = useClients();
  const [clientId, setClientId] = useState('');
  const [title, setTitle] = useState('');
  const [serviceType, setServiceType] = useState<ServiceType>('website_design_dev');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [assignedTo, setAssignedTo] = useState('a0000000-0000-0000-0000-000000000001');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (clients.length > 0 && !clientId) {
      setClientId(clients[0].id);
    }
  }, [clients, clientId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      alert('Please select or create a client first.');
      return;
    }
    setIsSubmitting(true);
    try {
      await onCreate({
        client_id: clientId,
        title,
        service_type: serviceType,
        start_date: startDate,
        due_date: dueDate,
        assigned_to: assignedTo,
        progress_percent: 0,
        status: 'planning',
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
      title="Create New Studio Project"
      description="Launch a new project track for Web, Brand, or AI Agent automation."
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Select Client</label>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-100 outline-none focus:border-primary-500"
            required
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} {c.company ? `(${c.company})` : ''}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Project Title"
          placeholder="e.g. Acme AI Agent Suite & Portal"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Service Offering</label>
          <select
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value as ServiceType)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-100 outline-none focus:border-primary-500"
          >
            <option value="website_design_dev">Website Design & Development</option>
            <option value="logo_branding">Logo & Brand Identity</option>
            <option value="ai_agents_automation">AI Agents & Workflow Automation</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="Target Launch / Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Assign Founder</label>
          <select
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-100 outline-none focus:border-primary-500"
          >
            <option value="a0000000-0000-0000-0000-000000000001">Sanjay (Dev & AI Lead)</option>
            <option value="a0000000-0000-0000-0000-000000000002">Sriram (Brand & Design Lead)</option>
          </select>
        </div>

        <div className="pt-3 flex justify-end gap-2 border-t border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" size="sm" isLoading={isSubmitting}>
            Launch Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};

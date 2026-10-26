import React, { useState, useMemo } from 'react';
import { usePayments } from '../hooks/usePayments';
import { useProjects } from '../hooks/useProjects';
import { Payment, PaymentStatus } from '../types';
import { RecordPaymentModal } from '../components/payments/RecordPaymentModal';
import { Button } from '../components/ui/Button';
import {
  formatDate,
  formatCurrency,
  getPaymentStatusBadge,
  getDaysRemaining,
} from '../lib/utils';
import {
  CreditCard,
  Plus,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export const Payments: React.FC = () => {
  const { payments, isLoading, markPaid, createPayment } = usePayments();
  const { projects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Financial Computations
  const totalPaid = useMemo(() => {
    return payments
      .filter((p) => p.status === 'paid')
      .reduce((acc, p) => acc + Number(p.amount), 0);
  }, [payments]);

  const totalPending = useMemo(() => {
    return payments
      .filter((p) => p.status === 'pending')
      .reduce((acc, p) => acc + Number(p.amount), 0);
  }, [payments]);

  const totalOverdue = useMemo(() => {
    return payments
      .filter((p) => {
        if (p.status === 'paid' || !p.due_date) return false;
        return p.status === 'overdue' || new Date(p.due_date) < today;
      })
      .reduce((acc, p) => acc + Number(p.amount), 0);
  }, [payments, today]);

  const filteredPayments = useMemo(() => {
    if (selectedStatus === 'all') return payments;
    return payments.filter((p) => p.status === selectedStatus);
  }, [payments, selectedStatus]);

  const handleQuickMarkPaid = async (paymentId: string) => {
    const method = prompt('Enter payment method received (e.g. Bank Wire, Stripe):', 'Bank Wire');
    if (method) {
      await markPaid({ id: paymentId, method });
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Studio Financials & Payments
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">
              {payments.length} Records
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cash flow tracking, advance milestones, overdue alert detection, and client balances
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          Record Payment
        </Button>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Total Revenue Settled
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 mt-2">
            {formatCurrency(totalPaid)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Cash in bank received</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-slate-800/80">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Invoices
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-400 mt-2">
            {formatCurrency(totalPending)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Scheduled for delivery milestones</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-rose-500/30 bg-rose-950/10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider">
              Overdue Collections
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 mt-2">
            {formatCurrency(totalOverdue)}
          </div>
          <p className="text-[11px] text-rose-300/80 mt-1">Requires founder followup</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-1">
        {['all', 'pending', 'paid', 'overdue'].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedStatus(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition ${
              selectedStatus === tab
                ? 'bg-primary-600/30 text-cyan-300 border border-primary-500/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Project & Stage</th>
                <th className="py-3 px-4 font-semibold">Amount</th>
                <th className="py-3 px-4 font-semibold">Due Date</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Paid Details</th>
                <th className="py-3 px-4 font-semibold text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 italic">
                    No payment records match this filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((py) => {
                  const project = projects.find((p) => p.id === py.project_id);
                  const isOverdue =
                    py.status !== 'paid' &&
                    (py.status === 'overdue' || (py.due_date && new Date(py.due_date) < today));
                  const badge = getPaymentStatusBadge(isOverdue ? 'overdue' : py.status);
                  const daysInfo = getDaysRemaining(py.due_date);

                  return (
                    <tr
                      key={py.id}
                      className={`hover:bg-slate-800/50 transition ${
                        isOverdue ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-100">{project?.title || 'Project'}</div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {py.type} Payment
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-sm text-slate-100">
                        {formatCurrency(py.amount)}
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`font-medium ${
                            isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'
                          }`}
                        >
                          {formatDate(py.due_date)} {isOverdue && `(${daysInfo.text})`}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-md border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {py.paid_at ? (
                          <span>
                            Paid {formatDate(py.paid_at)} via{' '}
                            <strong className="text-slate-200">{py.method || 'Transfer'}</strong>
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Unsettled</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {py.status !== 'paid' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/30"
                            onClick={() => handleQuickMarkPaid(py.id)}
                          >
                            Mark Paid
                          </Button>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-400 flex items-center justify-end gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <RecordPaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={async (params) => {
          await createPayment(params as any);
        }}
      />
    </div>
  );
};

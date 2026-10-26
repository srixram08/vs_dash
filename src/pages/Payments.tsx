import React, { useState, useMemo } from 'react';
import { usePayments } from '../hooks/usePayments';
import { useProjects } from '../hooks/useProjects';
import { Payment, PaymentStatus } from '../types';
import { RecordPaymentModal } from '../components/payments/RecordPaymentModal';
import { Button } from '../components/ui/Button';
import { RupeeIcon } from '../components/ui/RupeeIcon';
import {
  formatDate,
  formatCurrency,
  getPaymentStatusBadge,
  getDaysRemaining,
} from '../lib/utils';
import {
  CreditCard,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';

export const Payments: React.FC = () => {
  const { payments, isLoading, markPaid, createPayment } = usePayments();
  const { projects } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Financial Computations in INR
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
    const method = prompt('Enter payment method received (e.g. Bank Wire, UPI / Net Banking, Stripe):', 'UPI / Net Banking');
    if (method) {
      await markPaid({ id: paymentId, method });
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
              INR Financials & Invoices
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {payments.length} Recorded Ledgers
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Studio Financials & Payments
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Cash flow tracking, advance milestones, overdue alert detection, and client balances
          </p>
        </div>

        <Button
          variant="gradient"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
          className="rounded-full text-xs font-semibold px-4 py-2 shadow-xs"
        >
          Record Payment
        </Button>
      </div>

      {/* KPI Financial Overview Cards (Tran Mau Tri Tam Minimal Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Settled */}
        <div className="minimal-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Settled Revenue
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {formatCurrency(totalPaid)}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                Collected
              </span>
              <span className="text-[11px] text-slate-400">Cash in bank</span>
            </div>
          </div>
        </div>

        {/* Pending Invoices */}
        <div className="minimal-card p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Pending Invoices
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-amber-700 tracking-tight">
              {formatCurrency(totalPending)}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                Scheduled
              </span>
              <span className="text-[11px] text-slate-400">Milestone releases</span>
            </div>
          </div>
        </div>

        {/* Overdue Collections */}
        <div className="minimal-card p-5 space-y-3 border-rose-200/80 bg-rose-50/20">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">
              Overdue Collections
            </span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center animate-pulse">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
              {formatCurrency(totalOverdue)}
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                Action required
              </span>
              <span className="text-[11px] text-rose-600 font-medium">Followup needed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Filter Pills */}
      <div className="flex items-center justify-between">
        <div className="segmented-pill-container">
          {['all', 'pending', 'paid', 'overdue'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStatus(tab)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                selectedStatus === tab
                  ? 'bg-white text-slate-950 shadow-2xs font-bold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab === 'all' ? 'All Invoices' : tab}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-medium hidden sm:inline">
          Showing {filteredPayments.length} of {payments.length} records
        </span>
      </div>

      {/* Minimalist Payments Table */}
      <div className="minimal-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 font-bold">
              <tr>
                <th className="py-3.5 px-5">Project & Stage</th>
                <th className="py-3.5 px-4">Amount (₹ INR)</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Settlement Details</th>
                <th className="py-3.5 px-5 text-right">Quick Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading payments...
                  </td>
                </tr>
              ) : filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 italic">
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
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isOverdue ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      <td className="py-4 px-5">
                        <div className="font-bold text-slate-900">{project?.title || 'Project'}</div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                          {py.type} Milestone
                        </span>
                      </td>

                      <td className="py-4 px-4 font-black text-sm text-slate-900 tracking-tight">
                        {formatCurrency(py.amount)}
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`font-semibold ${
                            isOverdue ? 'text-rose-600' : 'text-slate-700'
                          }`}
                        >
                          {formatDate(py.due_date)} {isOverdue && `(${daysInfo.text})`}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 text-[11px] font-semibold rounded-full border ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-slate-600 text-[11px]">
                        {py.paid_at ? (
                          <span>
                            Settled on {formatDate(py.paid_at)} via{' '}
                            <strong className="text-slate-800 font-semibold">{py.method || 'Transfer'}</strong>
                          </span>
                        ) : (
                          <span className="italic text-slate-400">Unsettled</span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-right">
                        {py.status !== 'paid' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-xs rounded-full px-3 py-1 border-emerald-300 text-emerald-800 hover:bg-emerald-50"
                            onClick={() => handleQuickMarkPaid(py.id)}
                          >
                            Mark Paid
                          </Button>
                        ) : (
                          <span className="text-[11px] font-bold text-emerald-700 flex items-center justify-end gap-1">
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

import React from 'react';
import { Drawer } from '../ui/Drawer';
import { Badge } from '../ui/Badge';
import { ClientWithRelations, ProjectWithRelations } from '../../types';
import {
  formatDate,
  formatCurrency,
  formatServiceType,
  getProjectStatusBadge,
  getPaymentStatusBadge,
} from '../../lib/utils';
import {
  Building,
  Mail,
  Phone,
  FolderKanban,
  FileText,
  CreditCard,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface ClientDetailDrawerProps {
  client: ClientWithRelations | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ClientDetailDrawer: React.FC<ClientDetailDrawerProps> = ({
  client,
  isOpen,
  onClose,
}) => {
  if (!client) return null;

  const projects = client.projects || [];
  const proposals = client.proposals || [];
  const payments = client.payments || [];

  const totalContract = payments.reduce((acc, p) => acc + Number(p.amount), 0);
  const totalPaid = payments
    .filter((p) => p.status === 'paid')
    .reduce((acc, p) => acc + Number(p.amount), 0);
  const totalOutstanding = totalContract - totalPaid;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={client.name}
      description={client.company || 'Private Client'}
      width="2xl"
    >
      <div className="space-y-6 text-sm">
        {/* Contact Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-4 h-4 text-primary-400 flex-shrink-0" />
            <a href={`mailto:${client.email}`} className="text-xs hover:underline truncate">
              {client.email}
            </a>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
            <span className="text-xs">{client.phone || 'No phone'}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Building className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span className="text-xs truncate">{client.company || '—'}</span>
          </div>
        </div>

        {/* Financial KPI Summary for Client */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Contracted</p>
            <p className="text-base font-bold text-slate-100 mt-1">
              {formatCurrency(totalContract)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">Total Paid</p>
            <p className="text-base font-bold text-emerald-400 mt-1">
              {formatCurrency(totalPaid)}
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800">
            <p className="text-[10px] uppercase font-bold text-slate-400">Outstanding</p>
            <p className="text-base font-bold text-amber-400 mt-1">
              {formatCurrency(totalOutstanding)}
            </p>
          </div>
        </div>

        {/* Projects Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FolderKanban className="w-4 h-4 text-cyan-400" />
            Projects ({projects.length})
          </h3>

          {projects.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-3 rounded-lg bg-slate-900/30 border border-slate-800">
              No active or past projects for this client.
            </p>
          ) : (
            <div className="space-y-2">
              {projects.map((proj) => {
                const statusBadge = getProjectStatusBadge(proj.status);
                return (
                  <div
                    key={proj.id}
                    className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-semibold text-slate-100">{proj.title}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatServiceType(proj.service_type)} &bull; Due {formatDate(proj.due_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-20 bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                        <div
                          className="bg-cyan-500 h-full rounded-full"
                          style={{ width: `${proj.progress_percent}%` }}
                        />
                      </div>
                      <span
                        className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${statusBadge.className}`}
                      >
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Proposals Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <FileText className="w-4 h-4 text-violet-400" />
            Proposals ({proposals.length})
          </h3>
          {proposals.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-3 rounded-lg bg-slate-900/30 border border-slate-800">
              No proposals generated yet.
            </p>
          ) : (
            <div className="space-y-2">
              {proposals.map((pr) => (
                <div
                  key={pr.id}
                  className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-200">
                      {formatCurrency(pr.total_price)}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Sent {formatDate(pr.sent_at)} &bull; Valid until {formatDate(pr.valid_until)}
                    </p>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {pr.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payments Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            Payment History & Invoices ({payments.length})
          </h3>
          {payments.length === 0 ? (
            <p className="text-xs text-slate-400 italic p-3 rounded-lg bg-slate-900/30 border border-slate-800">
              No payments logged for this client yet.
            </p>
          ) : (
            <div className="space-y-2">
              {payments.map((py) => {
                const payBadge = getPaymentStatusBadge(py.status);
                return (
                  <div
                    key={py.id}
                    className="p-3 rounded-xl bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-slate-200">
                        {formatCurrency(py.amount)}{' '}
                        <span className="font-normal text-slate-400 capitalize">({py.type})</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Due {formatDate(py.due_date)}{' '}
                        {py.paid_at && `&bull; Paid on ${formatDate(py.paid_at)} via ${py.method || 'Transfer'}`}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 text-[10px] font-semibold rounded-md border ${payBadge.className}`}
                    >
                      {payBadge.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
};

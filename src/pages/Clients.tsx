import React, { useState, useMemo } from 'react';
import { useClients } from '../hooks/useClients';
import { Client, ClientWithRelations } from '../types';
import { ClientDetailDrawer } from '../components/clients/ClientDetailDrawer';
import { formatDate } from '../lib/utils';
import { Search, Users, ChevronRight } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { usePayments } from '../hooks/usePayments';
import { useProposals } from '../hooks/useProposals';

export const Clients: React.FC = () => {
  const { clients, isLoading } = useClients();
  const { projects } = useProjects();
  const { payments } = usePayments();
  const { proposals } = useProposals();

  const [search, setSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<ClientWithRelations | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const clientsWithData: ClientWithRelations[] = useMemo(() => {
    return clients.map((c) => {
      const clientProjects = projects.filter((p) => p.client_id === c.id);
      const clientPayments = payments.filter((py) =>
        clientProjects.some((p) => p.id === py.project_id)
      );
      const clientProposals = proposals.filter((pr) =>
        clientProjects.some((p) => p.id === pr.project_id)
      );

      return {
        ...c,
        projects: clientProjects,
        payments: clientPayments,
        proposals: clientProposals,
      };
    });
  }, [clients, projects, payments, proposals]);

  const filteredClients = useMemo(() => {
    return clientsWithData.filter((c) => {
      return (
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.company && c.company.toLowerCase().includes(search.toLowerCase())) ||
        c.email.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [clientsWithData, search]);

  const handleRowClick = (client: ClientWithRelations) => {
    setSelectedClient(client);
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              CRM Directory
            </span>
            <span className="text-xs text-slate-400 font-normal">
              {clients.length} Active Accounts
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
            Client Directory
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Unified 360&deg; client management: projects, proposals, invoices, and communication
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search clients, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white text-xs text-slate-800 placeholder-slate-400 pl-9 pr-4 py-2 rounded-full border border-slate-200 outline-none focus:border-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      {/* Clients Minimal Table */}
      <div className="minimal-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 font-bold">
              <tr>
                <th className="py-3.5 px-5">Client Name</th>
                <th className="py-3.5 px-4">Company</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4 text-center">Active Projects</th>
                <th className="py-3.5 px-4">Client Since</th>
                <th className="py-3.5 px-5 text-right">360&deg; Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading clients...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-700">No clients found</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => handleRowClick(client)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {client.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{client.email}</div>
                    </td>

                    <td className="py-4 px-4 font-semibold text-slate-700">
                      {client.company || '—'}
                    </td>

                    <td className="py-4 px-4 text-slate-600">
                      {client.phone || 'No phone'}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200/80 font-bold text-[11px] text-emerald-800">
                        {client.projects?.length || 0}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-500 text-[11px]">
                      {formatDate(client.created_at)}
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="inline-flex items-center gap-1 text-slate-400 group-hover:text-emerald-700 font-semibold transition-colors">
                        <span className="text-[11px] hidden sm:inline">Overview</span>
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 360 Degree Client Drawer */}
      <ClientDetailDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        client={selectedClient}
      />
    </div>
  );
};

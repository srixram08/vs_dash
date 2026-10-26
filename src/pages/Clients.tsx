import React, { useState, useMemo } from 'react';
import { useClients } from '../hooks/useClients';
import { Client, ClientWithRelations } from '../types';
import { ClientDetailDrawer } from '../components/clients/ClientDetailDrawer';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { formatDate } from '../lib/utils';
import { Search, Users, Building, Mail, Phone, ExternalLink, ChevronRight } from 'lucide-react';
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
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          Client Directory
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-300">
            {clients.length} Clients
          </span>
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Unified 360&deg; client management: projects, proposals, invoices, and communication
        </p>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <Input
          placeholder="Search by client name, company, or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </div>

      {/* Clients Grid / Table */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Client Name</th>
                <th className="py-3 px-4 font-semibold">Company</th>
                <th className="py-3 px-4 font-semibold">Contact</th>
                <th className="py-3 px-4 font-semibold text-center">Projects</th>
                <th className="py-3 px-4 font-semibold">Client Since</th>
                <th className="py-3 px-4 font-semibold text-right">360&deg; View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    Loading clients...
                  </td>
                </tr>
              ) : filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400">
                    <Users className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="font-medium text-slate-300">No clients found</p>
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr
                    key={client.id}
                    onClick={() => handleRowClick(client)}
                    className="hover:bg-slate-800/50 transition cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-100 group-hover:text-cyan-400 transition">
                        {client.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{client.email}</div>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-300">
                      {client.company || '—'}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400">
                      {client.phone || 'No phone'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 font-semibold text-[11px] text-cyan-300">
                        {client.projects?.length || 0}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {formatDate(client.created_at)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 text-slate-400 group-hover:text-white">
                        <span className="text-[11px] font-medium hidden sm:inline">Overview</span>
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

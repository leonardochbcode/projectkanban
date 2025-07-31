'use client';
import { PlusCircle, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/hooks/use-store';
import { useState, useEffect, useMemo } from 'react';
import type { Lead } from '@/lib/types';
import { AppLayout } from '@/components/layout/app-layout';
import { ManageLeadDialog } from '@/components/leads/manage-lead-dialog';
import { LeadCard } from '@/components/leads/lead-card';
import { LeadsTable } from '@/components/leads/leads-table';

const statuses: Lead['status'][] = ['Novo', 'Em Contato', 'Proposta Enviada', 'Convertido', 'Perdido'];

function LeadsPageContent() {
  const { leads, clients } = useStore();
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [isManageLeadDialogOpen, setIsManageLeadDialogOpen] = useState(false);

  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('leadsViewMode');
      return (savedMode as 'kanban' | 'list') || 'kanban';
    }
    return 'kanban';
  });
  
  useEffect(() => {
     if (typeof window !== 'undefined') {
      localStorage.setItem('leadsViewMode', viewMode);
    }
  }, [viewMode]);
  
  const filteredLeads = useMemo(() => {
    let filtered = leads;
    if (nameFilter) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    if (clientFilter !== 'all') {
      filtered = filtered.filter(p => p.clientId === clientFilter);
    }
    return filtered;
  }, [leads, nameFilter, statusFilter, clientFilter]);

  const summaryData = useMemo(() => {
    const openLeads = leads.filter(l => l.status !== 'Convertido' && l.status !== 'Perdido');
    const totalOpenValue = openLeads.reduce((sum, l) => sum + l.value, 0);
    const convertedCount = leads.filter(l => l.status === 'Convertido').length;
    const conversionRate = leads.length > 0 ? (convertedCount / leads.length) * 100 : 0;
    
    return {
        openLeadsCount: openLeads.length,
        totalOpenValue,
        conversionRate,
    }
  }, [leads]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);


  const handleAdd = () => {
    setEditingLead(undefined);
    setIsManageLeadDialogOpen(true);
  };
  
  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsManageLeadDialogOpen(true);
  }

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingLead(undefined);
    }
    setIsManageLeadDialogOpen(open);
  }
  
  const KanbanView = () => (
    <div className="flex-1 overflow-x-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 min-w-max">
            {statuses.map((status) => (
                <div key={status} className="bg-muted/50 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4 font-headline">{status}</h2>
                <div className="space-y-4">
                    {filteredLeads
                    .filter((lead) => lead.status === status)
                    .map((lead) => (
                        <LeadCard key={lead.id} lead={lead} onEdit={handleEdit}/>
                    ))}
                </div>
                </div>
            ))}
        </div>
    </div>
  )

  return (
    <div className="flex flex-col h-full">
        <div className="p-4 sm:p-8 pb-4 pt-6 border-b space-y-4">
            <div className="flex items-center justify-between space-y-2">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Funil de Propostas</h1>
                 <div className="flex items-center space-x-2">
                    <ManageLeadDialog
                            lead={editingLead}
                            open={isManageLeadDialogOpen}
                            onOpenChange={handleDialogClose}
                        >
                            <Button onClick={handleAdd} size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Proposta
                            </Button>
                    </ManageLeadDialog>
                </div>
            </div>
             <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Propostas em Aberto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryData.openLeadsCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor em Aberto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(summaryData.totalOpenValue)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryData.conversionRate.toFixed(1)}%</div>
                    </CardContent>
                </Card>
            </div>

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Input 
                        placeholder="Filtrar por nome..."
                        value={nameFilter}
                        onChange={(e) => setNameFilter(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Status</SelectItem>
                            {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={clientFilter} onValueChange={setClientFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Cliente" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os Clientes</SelectItem>
                            {clients.map(client => (
                                <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant={viewMode === 'kanban' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('kanban')}>
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
                        <List className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
      
        {viewMode === 'kanban' ? <KanbanView /> : <LeadsTable leads={filteredLeads} onEdit={handleEdit} />}
       
    </div>
  );
}

export default function LeadsPage() {
    return (
        <AppLayout>
            <LeadsPageContent />
        </AppLayout>
    )
}

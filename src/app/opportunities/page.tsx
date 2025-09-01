'use client';
import { PlusCircle, LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useStore } from '@/hooks/use-store';
import { useState, useEffect, useMemo } from 'react';
import type { Opportunity } from '@/lib/types';
import { AppLayout } from '@/components/layout/app-layout';
import { ManageOpportunityDialog } from '@/components/opportunities/manage-opportunity-dialog';
import { OpportunityCard } from '@/components/opportunities/opportunity-card';
import { OpportunitiesTable } from '@/components/opportunities/opportunities-table';
import { OpportunityDetailsSheet } from '@/components/opportunities/opportunity-details-sheet';

const statuses: Opportunity['status'][] = ['A Analisar', 'Contato Realizado', 'Proposta Enviada', 'Ganha', 'Perdida'];

function OpportunitiesPageContent() {
  const { opportunities, clients, currentUser, getRole } = useStore();
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>(undefined);
  const [isManageOpportunityDialogOpen, setIsManageOpportunityDialogOpen] = useState(false);
  
  const [viewingOpportunity, setViewingOpportunity] = useState<Opportunity | undefined>(undefined);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);

  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>(() => {
    if (typeof window !== 'undefined') {
      const savedMode = localStorage.getItem('opportunitiesViewMode');
      return (savedMode as 'kanban' | 'list') || 'kanban';
    }
    return 'kanban';
  });

  const userRole = currentUser ? getRole(currentUser.roleId) : null;
  const canViewValues = userRole?.permissions.includes('view_opportunity_values') ?? false;
  
  useEffect(() => {
     if (typeof window !== 'undefined') {
      localStorage.setItem('opportunitiesViewMode', viewMode);
    }
  }, [viewMode]);
  
  const filteredOpportunities = useMemo(() => {
    let filtered = opportunities;
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
  }, [opportunities, nameFilter, statusFilter, clientFilter]);

  const summaryData = useMemo(() => {
    const openOpportunities = opportunities.filter(l => l.status !== 'Ganha' && l.status !== 'Perdida');
    const totalOpenValue = openOpportunities.reduce((sum, l) => sum + l.value, 0);
    const convertedCount = opportunities.filter(l => l.status === 'Ganha').length;
    const conversionRate = opportunities.length > 0 ? (convertedCount / opportunities.length) * 100 : 0;
    
    return {
        openOpportunitiesCount: openOpportunities.length,
        totalOpenValue,
        conversionRate,
    }
  }, [opportunities]);

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  const handleAdd = () => {
    setEditingOpportunity(undefined);
    setIsManageOpportunityDialogOpen(true);
  };
  
  const handleEdit = (opportunity: Opportunity) => {
    setIsDetailsSheetOpen(false);
    setViewingOpportunity(undefined);
    setEditingOpportunity(opportunity);
    setIsManageOpportunityDialogOpen(true);
  }

  const handleViewDetails = (opportunity: Opportunity) => {
    setViewingOpportunity(opportunity);
    setIsDetailsSheetOpen(true);
  }

  const handleManageDialogClose = (open: boolean) => {
    if (!open) {
      setEditingOpportunity(undefined);
    }
    setIsManageOpportunityDialogOpen(open);
  }
  
  const KanbanView = () => (
    <div className="flex-1 overflow-x-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 min-w-max">
            {statuses.map((status) => (
                <div key={status} className="bg-muted/50 rounded-lg p-4">
                <h2 className="text-lg font-semibold mb-4 font-headline">{status}</h2>
                <div className="space-y-4">
                    {filteredOpportunities
                    .filter((opportunity) => opportunity.status === status)
                    .map((opportunity) => (
                        <OpportunityCard key={opportunity.id} opportunity={opportunity} onEdit={handleEdit}/>
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
                <h1 className="text-3xl font-bold tracking-tight font-headline">Funil de Oportunidades</h1>
                 <div className="flex items-center space-x-2">
                    <ManageOpportunityDialog
                            opportunity={editingOpportunity}
                            open={isManageOpportunityDialogOpen}
                            onOpenChange={handleManageDialogClose}
                        >
                            <Button onClick={handleAdd} size="sm">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Adicionar Oportunidade
                            </Button>
                    </ManageOpportunityDialog>
                </div>
            </div>
             <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Oportunidades em Aberto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{summaryData.openOpportunitiesCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Valor em Aberto</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {canViewValues ? (
                            <div className="text-2xl font-bold">{formatCurrency(summaryData.totalOpenValue)}</div>
                        ) : (
                            <div className="text-2xl font-bold">-</div>
                        )}
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
      
        {viewMode === 'kanban' ? <KanbanView /> : <OpportunitiesTable opportunities={filteredOpportunities} onEdit={handleEdit} onViewDetails={handleViewDetails} />}
       
        {viewingOpportunity && (
            <OpportunityDetailsSheet
                opportunity={viewingOpportunity}
                onEdit={handleEdit}
                open={isDetailsSheetOpen}
                onOpenChange={setIsDetailsSheetOpen}
            />
        )}
    </div>
  );
}

export default function OpportunitiesPage() {
    return (
        <AppLayout>
            <OpportunitiesPageContent />
        </AppLayout>
    )
}

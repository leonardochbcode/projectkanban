
'use client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useStore } from '@/hooks/use-store';
import { useState } from 'react';
import type { Lead } from '@/lib/types';
import { AppLayout } from '@/components/layout/app-layout';
import { ManageLeadDialog } from '@/components/leads/manage-lead-dialog';
import { LeadCard } from '@/components/leads/lead-card';

const statuses: Lead['status'][] = ['Novo', 'Em Contato', 'Proposta Enviada', 'Convertido', 'Perdido'];

function LeadsPageContent() {
  const { leads } = useStore();
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAdd = () => {
    setEditingLead(undefined);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingLead(undefined);
    }
    setIsDialogOpen(open);
  }

  return (
    <div className="flex flex-col h-full">
        <div className="flex items-center justify-between space-y-2 p-4 sm:p-8 pb-4 pt-6 border-b">
            <h1 className="text-3xl font-bold tracking-tight font-headline">Funil de Vendas</h1>
            <div className="flex items-center space-x-2">
            <ManageLeadDialog
                lead={editingLead}
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
            >
                <Button onClick={handleAdd}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Lead
                </Button>
            </ManageLeadDialog>
            </div>
        </div>
      
        <div className="flex-1 overflow-x-auto p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 min-w-max">
                {statuses.map((status) => (
                    <div key={status} className="bg-muted/50 rounded-lg p-4">
                    <h2 className="text-lg font-semibold mb-4 font-headline">{status}</h2>
                    <div className="space-y-4">
                        {leads
                        .filter((lead) => lead.status === status)
                        .map((lead) => (
                            <LeadCard key={lead.id} lead={lead} />
                        ))}
                    </div>
                    </div>
                ))}
            </div>
        </div>
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

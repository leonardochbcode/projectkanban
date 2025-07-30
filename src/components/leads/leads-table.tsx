'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MoreVertical, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useState } from 'react';
import { LeadDetailsSheet } from './lead-details-sheet';

interface LeadsTableProps {
  leads: Lead[];
  onEdit: (lead: Lead) => void;
}

export function LeadsTable({ leads, onEdit }: LeadsTableProps) {
  const [selectedLead, setSelectedLead] = useState<Lead | undefined>(undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const handleViewDetails = (lead: Lead) => {
    setSelectedLead(lead);
    setIsSheetOpen(true);
  };
  
  const handleEdit = (lead: Lead) => {
    setIsSheetOpen(false);
    onEdit(lead);
  };

  const statusColors: { [key: string]: string } = {
    'Novo': 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
    'Em Contato': 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
    'Proposta Enviada': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
    'Convertido': 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
    'Perdido': 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Lista de Leads</CardTitle>
          <CardDescription>Uma visão geral de todos os seus leads em prospecção.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id} className="cursor-pointer" onClick={() => handleViewDetails(lead)}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.company || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(statusColors[lead.status])}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatCurrency(lead.value)}</TableCell>
                  <TableCell>{new Date(lead.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleEdit(lead)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedLead && (
        <LeadDetailsSheet 
            lead={selectedLead} 
            onEdit={handleEdit} 
            open={isSheetOpen} 
            onOpenChange={setIsSheetOpen} 
        />
      )}
    </div>
  );
}

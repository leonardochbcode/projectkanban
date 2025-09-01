'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Opportunity } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MoreVertical, Edit } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useStore } from '@/hooks/use-store';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
  onEdit: (opportunity: Opportunity) => void;
  onViewDetails: (opportunity: Opportunity) => void;
}

export function OpportunitiesTable({ opportunities, onEdit, onViewDetails }: OpportunitiesTableProps) {
  const { getParticipant, currentUser, getRole } = useStore();
  const userRole = currentUser ? getRole(currentUser.roleId) : null;
  const canViewValues = userRole?.permissions.includes('view_opportunity_values') ?? false;
  
  const statusColors: { [key: string]: string } = {
    'A Analisar': 'bg-blue-500/20 text-blue-700',
    'Contato Realizado': 'bg-yellow-500/20 text-yellow-700',
    'Proposta Enviada': 'bg-purple-500/20 text-purple-700',
    'Ganha': 'bg-green-500/20 text-green-700',
    'Perdida': 'bg-red-500/20 text-red-700',
  };

  const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

  return (
    <div className="p-4 sm:p-6">
      <Card>
        <CardHeader>
          <CardTitle>Lista de Oportunidades</CardTitle>
          <CardDescription>Uma visão geral de todas as suas oportunidades em prospecção.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Status</TableHead>
                {canViewValues && <TableHead>Valor</TableHead>}
                <TableHead>Criado por</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => {
                const owner = getParticipant(opportunity.ownerId);
                return (
                    <TableRow key={opportunity.id} className="cursor-pointer" onClick={() => onViewDetails(opportunity)}>
                    <TableCell className="font-medium">{opportunity.name}</TableCell>
                    <TableCell>{opportunity.company || 'N/A'}</TableCell>
                    <TableCell>
                        <Badge variant="outline" className={cn(statusColors[opportunity.status])}>
                        {opportunity.status}
                        </Badge>
                    </TableCell>
                    {canViewValues && <TableCell>{formatCurrency(opportunity.value)}</TableCell>}
                    <TableCell>
                      {owner ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                              <AvatarImage src={owner.avatar} />
                              <AvatarFallback>{owner.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-xs">{owner.name.split(' ')[0]}</span>
                        </div>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell>{new Date(opportunity.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => onEdit(opportunity)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TableCell>
                    </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

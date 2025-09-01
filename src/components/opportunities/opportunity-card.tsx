'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Opportunity } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Building, Calendar, DollarSign, User } from 'lucide-react';
import { OpportunityDetailsSheet } from './opportunity-details-sheet';
import { useStore } from '@/hooks/use-store';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onEdit: (opportunity: Opportunity) => void;
}

export function OpportunityCard({ opportunity, onEdit }: OpportunityCardProps) {
  const { getParticipant, currentUser, getRole } = useStore();
  const owner = getParticipant(opportunity.ownerId);

  const userRole = currentUser ? getRole(currentUser.roleId) : null;
  const canViewValues = userRole?.permissions.includes('view_opportunity_values') ?? false;

  const statusColors: { [key: string]: string } = {
    'A Analisar': 'bg-blue-500/20 text-blue-700',
    'Contato Realizado': 'bg-yellow-500/20 text-yellow-700',
    'Proposta Enviada': 'bg-purple-500/20 text-purple-700',
    'Ganha': 'bg-green-500/20 text-green-700',
    'Perdida': 'bg-red-500/20 text-red-700',
  };

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(opportunity.value);

  return (
    <OpportunityDetailsSheet opportunity={opportunity} onEdit={onEdit}>
        <Card className="hover:bg-card/90 cursor-pointer transition-colors">
            <CardHeader className="p-4 pb-2">
                 <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base leading-snug">{opportunity.name}</CardTitle>
                    <Badge variant="outline" className={cn('text-xs', statusColors[opportunity.status])}>
                        {opportunity.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 text-sm text-muted-foreground space-y-2">
               {opportunity.company && (
                 <div className="flex items-center gap-2">
                    <Building className="h-3.5 w-3.5" />
                    <span>{opportunity.company}</span>
                 </div>
               )}
                {canViewValues && (
                    <div className="flex items-center gap-2 font-semibold">
                        <DollarSign className="h-3.5 w-3.5" />
                        <span>{formattedValue}</span>
                    </div>
                )}
                 <div className="flex items-center gap-2 pt-1">
                    <User className="h-3.5 w-3.5" />
                    <span>Criado por: {owner?.name || 'Desconhecido'}</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Criado em: {new Date(opportunity.createdAt).toLocaleDateString()}</span>
                 </div>
            </CardContent>
        </Card>
    </OpportunityDetailsSheet>
  );
}

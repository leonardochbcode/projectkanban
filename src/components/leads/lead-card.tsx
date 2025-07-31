'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Building, Calendar, DollarSign } from 'lucide-react';
import { LeadDetailsSheet } from './lead-details-sheet';

interface LeadCardProps {
  lead: Lead;
  onEdit: (lead: Lead) => void;
}

export function LeadCard({ lead, onEdit }: LeadCardProps) {
  
  const statusColors: { [key: string]: string } = {
    'Novo': 'bg-blue-500/20 text-blue-700',
    'Em Contato': 'bg-yellow-500/20 text-yellow-700',
    'Proposta Enviada': 'bg-purple-500/20 text-purple-700',
    'Convertido': 'bg-green-500/20 text-green-700',
    'Perdido': 'bg-red-500/20 text-red-700',
  };

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(lead.value);

  return (
    <LeadDetailsSheet lead={lead} onEdit={onEdit}>
        <Card className="hover:bg-card/90 cursor-pointer transition-colors">
            <CardHeader className="p-4 pb-2">
                 <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-base leading-snug">{lead.name}</CardTitle>
                    <Badge variant="outline" className={cn('text-xs', statusColors[lead.status])}>
                        {lead.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2 text-sm text-muted-foreground space-y-2">
               {lead.company && (
                 <div className="flex items-center gap-2">
                    <Building className="h-3.5 w-3.5" />
                    <span>{lead.company}</span>
                 </div>
               )}
                <div className="flex items-center gap-2 font-semibold">
                    <DollarSign className="h-3.5 w-3.5" />
                    <span>{formattedValue}</span>
                </div>
                 <div className="flex items-center gap-2 pt-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Criado em: {new Date(lead.createdAt).toLocaleDateString()}</span>
                 </div>
            </CardContent>
        </Card>
    </LeadDetailsSheet>
  );
}

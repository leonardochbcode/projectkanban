'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Lead } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Building, Calendar, DollarSign } from 'lucide-react';
import { LeadDetailsSheet } from './lead-details-sheet';

interface LeadCardProps {
  lead: Lead;
}

export function LeadCard({ lead }: LeadCardProps) {
  
  const statusColors: { [key: string]: string } = {
    'Novo': 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
    'Em Contato': 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
    'Proposta Enviada': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
    'Convertido': 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
    'Perdido': 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  };

  const formattedValue = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(lead.value);

  return (
    <LeadDetailsSheet lead={lead}>
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

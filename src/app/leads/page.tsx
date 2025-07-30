
'use client';
import { PlusCircle, MoreVertical, Edit, Trash2, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStore } from '@/hooks/use-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import type { Lead } from '@/lib/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/app-layout';
import { ManageLeadDialog } from '@/components/leads/manage-lead-dialog';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

function LeadsPageContent() {
  const { leads, deleteLead, addClient, addProject, updateLead } = useStore();
  const router = useRouter();
  const { toast } = useToast();
  const [editingLead, setEditingLead] = useState<Lead | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleEdit = (lead: Lead) => {
    setEditingLead(lead);
    setIsDialogOpen(true);
  };

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

  const handleConvert = (lead: Lead) => {
    const today = new Date();
    const endDate = new Date();
    endDate.setDate(today.getDate() + 30); // Set end date to 30 days from now

    // 1. Create a new client from the lead
    const newClient = addClient({
      name: lead.name,
      email: lead.email,
      company: lead.company,
      phone: lead.phone,
    });

    // 2. Create a new project linked to the new client
    const newProject = addProject({
      name: `Projeto - ${lead.name}`,
      description: lead.description,
      clientId: newClient.id,
      startDate: format(today, 'yyyy-MM-dd'),
      endDate: format(endDate, 'yyyy-MM-dd'),
      status: 'Planejamento',
    });

    // 3. Update the lead's status to 'Converted'
    updateLead({ ...lead, status: 'Convertido' });

    toast({
      title: 'Lead Convertido!',
      description: `O projeto "${newProject.name}" foi criado com sucesso.`,
    });

    // 4. Redirect to the new project page
    router.push(`/projects/${newProject.id}`);
  };

  const statusColors: { [key: string]: string } = {
    'Novo': 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
    'Em Contato': 'bg-cyan-500/20 text-cyan-700 dark:text-cyan-400 border-cyan-500/30',
    'Proposta Enviada': 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
    'Convertido': 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
    'Perdido': 'bg-red-500/20 text-red-700 dark:text-red-400 border-red-500/30',
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Leads</h1>
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
      <Card>
        <CardHeader>
          <CardTitle>Funil de Vendas</CardTitle>
          <CardDescription>Uma visão geral de todos os seus leads.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium">{lead.name}</TableCell>
                  <TableCell>{lead.company || 'N/A'}</TableCell>
                  <TableCell>{lead.email}</TableCell>
                  <TableCell>{lead.phone || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(statusColors[lead.status])}>
                      {lead.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onSelect={() => handleConvert(lead)} disabled={lead.status === 'Convertido'}>
                            <Rocket className="mr-2 h-4 w-4" />
                            Converter em Projeto
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialogTrigger asChild>
                            <DropdownMenuItem className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Excluir
                            </DropdownMenuItem>
                          </AlertDialogTrigger>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o lead.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteLead(lead.id)}>
                            Continuar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
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

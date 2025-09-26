'use client';
import { PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '@/hooks/use-store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMemo, useState } from 'react';
import type { Client } from '@/lib/types';
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
import { ManageClientDialog } from '@/components/clients/manage-client-dialog';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/layout/app-layout';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 7;

function ClientsPageContent() {
  const { clients, deleteClient } = useStore();
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ name: '', company: '', suportewebCode: '' });
  const [currentPage, setCurrentPage] = useState(1);

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingClient(undefined);
    setIsDialogOpen(true);
  };
  
  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingClient(undefined);
    }
    setIsDialogOpen(open);
  }

  const filteredClients = useMemo(() => {
    const filtered = clients.filter(client => {
      const { name, company, suportewebCode } = filters;
      return (
        client.name.toLowerCase().includes(name.toLowerCase()) &&
        (client.company || '').toLowerCase().includes(company.toLowerCase()) &&
        (client.suportewebCode || '').toLowerCase().includes(suportewebCode.toLowerCase())
      );
    });
    setCurrentPage(1);
    return filtered;
  }, [clients, filters]);

  const totalPages = Math.ceil(filteredClients.length / ITEMS_PER_PAGE);
  const paginatedClients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredClients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredClients, currentPage]);

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Clientes</h1>
        <div className="flex items-center space-x-2">
          <ManageClientDialog
            client={editingClient}
            open={isDialogOpen}
            onOpenChange={handleDialogClose}
          >
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Cliente
            </Button>
          </ManageClientDialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
          <CardDescription>Uma visão geral de todos os seus clientes.</CardDescription>
          <div className="flex items-center gap-4 pt-4">
            <Input
              placeholder="Filtrar por nome..."
              value={filters.name}
              onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Filtrar por empresa..."
              value={filters.company}
              onChange={e => setFilters(prev => ({ ...prev, company: e.target.value }))}
            />
            <Input
              placeholder="Filtrar por Cód. Suporte..."
              value={filters.suportewebCode}
              onChange={e => setFilters(prev => ({ ...prev, suportewebCode: e.target.value }))}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Cód. Suporte</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={client.avatar} alt={client.name} />
                        <AvatarFallback>{client.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{client.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{client.company || 'N/A'}</TableCell>
                  <TableCell>{client.cnpj || 'N/A'}</TableCell>
                  <TableCell>
                    {client.suportewebCode ? (
                        <Badge variant="outline">{client.suportewebCode}</Badge>
                    ) : (
                        'N/A'
                    )}
                  </TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone || 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <AlertDialog>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onSelect={() => handleEdit(client)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
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
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteClient(client.id)}>
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
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default function ClientsPage() {
    return (
        <AppLayout>
            <ClientsPageContent />
        </AppLayout>
    )
}

'use client';
import { PlusCircle, MoreVertical, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '@/hooks/use-store';
import { Badge } from '@/components/ui/badge';
import { ManageParticipantDialog } from '@/components/team/manage-participant-dialog';
import { ManageRoles } from '@/components/team/manage-roles';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMemo, useState } from 'react';
import type { Participant } from '@/lib/types';
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
import { AppLayout } from '@/components/layout/app-layout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 7;

function TeamPageContent() {
  const { participants, roles, getRole, deleteParticipant, currentUser } = useStore();
  const [editingParticipant, setEditingParticipant] = useState<Participant | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ name: '', role: '', type: 'all' });
  const [currentPage, setCurrentPage] = useState(1);

  const handleEdit = (participant: Participant) => {
    setEditingParticipant(participant);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingParticipant(undefined);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingParticipant(undefined);
    }
    setIsDialogOpen(open);
  }

  const filteredParticipants = useMemo(() => {
    const filtered = participants.filter(participant => {
      const { name, role: roleFilter, type } = filters;
      const role = getRole(participant.roleId);
      return (
        participant.name.toLowerCase().includes(name.toLowerCase()) &&
        (role?.name || '').toLowerCase().includes(roleFilter.toLowerCase()) &&
        (type === 'all' || (participant.userType || '').toLowerCase() === type.toLowerCase())
      );
    });
    setCurrentPage(1);
    return filtered;
  }, [participants, filters, getRole]);

  const totalPages = Math.ceil(filteredParticipants.length / ITEMS_PER_PAGE);
  const paginatedParticipants = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredParticipants.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredParticipants, currentPage]);

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Membros da Equipe</h1>
        <div className="flex items-center space-x-2">
          <ManageParticipantDialog
            participant={editingParticipant}
            open={isDialogOpen}
            onOpenChange={handleDialogClose}
          >
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Membro
            </Button>
          </ManageParticipantDialog>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Participantes</CardTitle>
              <CardDescription>Uma lista de todos os membros da equipe envolvidos nos projetos.</CardDescription>
              <div className="flex items-center gap-4 pt-4">
                <Input
                  placeholder="Filtrar por nome..."
                  value={filters.name}
                  onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Filtrar por função..."
                  value={filters.role}
                  onChange={e => setFilters(prev => ({ ...prev, role: e.target.value }))}
                />
                <Select onValueChange={value => setFilters(prev => ({ ...prev, type: value }))} value={filters.type || 'all'}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Tipos</SelectItem>
                    <SelectItem value="Colaborador">Colaborador</SelectItem>
                    <SelectItem value="Convidado">Convidado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className='text-xs'>
                  {paginatedParticipants.map((participant) => {
                    const role = getRole(participant.roleId);
                    const isCurrentUser = participant.id === currentUser?.id;
                    return (
                      <TableRow key={participant.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={participant.avatar} alt={participant.name} />
                              <AvatarFallback>{participant.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{participant.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {role ? (
                            <Badge variant="secondary">{role.name}</Badge>
                          ) : (
                            <span className="text-muted-foreground">Sem função</span>
                          )}
                        </TableCell>
                        <TableCell>{participant.email}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => handleEdit(participant)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    disabled={isCurrentUser}
                                  >
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
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o participante.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => deleteParticipant(participant.id)}>
                                  Continuar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
        <div className="md:col-span-1">
          <ManageRoles />
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  return (
    <AppLayout>
      <TeamPageContent />
    </AppLayout>
  )
}

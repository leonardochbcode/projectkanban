'use client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/hooks/use-store';
import { useState, useMemo } from 'react';
import type { Project } from '@/lib/types';
import { ManageProjectDialog } from '@/components/projects/manage-project-dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectsTable } from '@/components/projects/projects-table';
import { AppLayout } from '@/components/layout/app-layout';

import { Pagination } from '@/components/ui/pagination';

const ITEMS_PER_PAGE = 7;

function ProjectsPageContent() {
  const { projects, clients, workspaces } = useStore();
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [workspaceFilter, setWorkspaceFilter] = useState('all');
  const [workbookFilter, setWorkbookFilter] = useState('all');

  const filteredProjects = useMemo(() => {
    let filtered = projects;
    if (nameFilter) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(p => p.status === statusFilter);
    }
    if (clientFilter !== 'all') {
      filtered = filtered.filter(p => p.clientId === clientFilter);
    }
    if (workspaceFilter !== 'all') {
      filtered = filtered.filter(p => p.workspaceId === workspaceFilter);
    }
    // if (workbookFilter === 'in_workbook') {
    //   filtered = filtered.filter(p => p.workbookIds && p.workbookIds.length > 0);
    // }
    // if (workbookFilter === 'not_in_workbook') {
    //   filtered = filtered.filter(p => !p.workbookIds || p.workbookIds.length === 0);
    // }
    setCurrentPage(1);
    return filtered;
  }, [projects, nameFilter, statusFilter, clientFilter, workspaceFilter, workbookFilter]);

  const totalPages = Math.ceil(filteredProjects.length / ITEMS_PER_PAGE);
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredProjects.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredProjects, currentPage]);

  const handleAdd = () => {
    setEditingProject(undefined);
    setIsDialogOpen(true);
  }

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingProject(undefined);
    }
    setIsDialogOpen(open);
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2 mb-4">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Todos os Projetos</h1>
        <div className="flex items-center space-x-2">
          <ManageProjectDialog project={editingProject} open={isDialogOpen} onOpenChange={handleDialogClose}>
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Projeto
            </Button>
          </ManageProjectDialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Projetos</CardTitle>
          <CardDescription>Uma visão geral de todos os projetos em todos os espaços de trabalho.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Filtrar por nome..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="max-w-sm"
            />
            <Select value={workspaceFilter} onValueChange={setWorkspaceFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Espaço" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Espaços</SelectItem>
                {workspaces.map(ws => (
                  <SelectItem key={ws.id} value={ws.id}>{ws.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="Planejamento">Planejamento</SelectItem>
                <SelectItem value="Em Andamento">Em Andamento</SelectItem>
                <SelectItem value="Pausado">Pausado</SelectItem>
                <SelectItem value="Concluído">Concluído</SelectItem>
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
            <Select value={workbookFilter} onValueChange={setWorkbookFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Pasta de Trabalho" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="in_workbook">Em workbook</SelectItem>
                <SelectItem value="not_in_workbook">Fora de workbook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ProjectsTable projects={paginatedProjects} onEdit={handleEdit} />
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function ProjectsPage() {
  return (
    <AppLayout>
      <ProjectsPageContent />
    </AppLayout>
  )
}

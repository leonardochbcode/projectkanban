'use client';
import { PlusCircle, MoreVertical, Edit, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';
import { AddProjectDialog } from '@/components/dashboard/add-project-dialog';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState } from 'react';
import type { Project } from '@/lib/types';
import { ManageProjectDialog } from '@/components/projects/manage-project-dialog';

function ProjectsPageContent() {
  const { projects, currentUser, getRole, duplicateProject } = useStore();
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const userRole = currentUser ? getRole(currentUser.roleId) : null;
  const canViewAllProjects = userRole?.permissions.includes('manage_projects') ?? false;

  const visibleProjects = canViewAllProjects
    ? projects
    : projects.filter(p => p.participantIds.includes(currentUser?.id ?? ''));

  const statusColors: { [key: string]: string } = {
    'Em Andamento': 'bg-blue-500/20 text-blue-700',
    Planejamento: 'bg-yellow-500/20 text-yellow-700',
    Concluído: 'bg-green-500/20 text-green-700',
    Pausado: 'bg-gray-500/20 text-gray-700',
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };
  
  const handleDuplicate = (project: Project) => {
    const newProject = duplicateProject(project);
    // Open the dialog to edit the newly created duplicate
    handleEdit(newProject);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingProject(undefined);
    }
    setIsDialogOpen(open);
  };

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Projetos</h1>
        <div className="flex items-center space-x-2">
          <AddProjectDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Projeto
            </Button>
          </AddProjectDialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Projetos</CardTitle>
          <CardDescription>Uma visão geral de todos os seus projetos.</CardDescription>
        </CardHeader>
        <CardContent>
          <ManageProjectDialog project={editingProject} open={isDialogOpen} onOpenChange={handleDialogClose}>
            {/* O diálogo é acionado programaticamente, então não precisa de um gatilho visível aqui */}
          </ManageProjectDialog>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead>Data de Término</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visibleProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link href={`/projects/${project.id}`} className="hover:underline">
                      {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(statusColors[project.status])}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => handleEdit(project)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDuplicate(project)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicar
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
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <AppLayout>
      <ProjectsPageContent />
    </AppLayout>
  );
}

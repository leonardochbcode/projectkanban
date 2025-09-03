
'use client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/hooks/use-store';
import { AppLayout } from '@/components/layout/app-layout';
import { useState, useMemo } from 'react';
import type { Project } from '@/lib/types';
import { ManageProjectDialog } from '@/components/projects/manage-project-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ManageTemplates } from '@/components/projects/manage-templates';
import { notFound, useParams } from 'next/navigation';
import { ProjectsTable } from '@/components/projects/projects-table';

function ProjectsListTab({ workspaceId }: { workspaceId: string}) {
  const { getWorkspaceProjects, clients } = useStore();
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [nameFilter, setNameFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');


  const visibleProjects = useMemo(() => {
    const projects = getWorkspaceProjects(workspaceId);

    let filteredProjects = projects;

    if (nameFilter) {
        filteredProjects = filteredProjects.filter(p => p.name.toLowerCase().includes(nameFilter.toLowerCase()));
    }
    if (statusFilter !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.status === statusFilter);
    }
    if (clientFilter !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.clientId === clientFilter);
    }

    return filteredProjects;
  }, [getWorkspaceProjects, workspaceId, nameFilter, statusFilter, clientFilter]);

  
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
     <>
        <div className="flex items-center justify-between space-y-2 mb-4">
            <div>{/* Spacer */}</div>
            <div className="flex items-center space-x-2">
                <ManageProjectDialog project={editingProject} open={isDialogOpen} onOpenChange={handleDialogClose} workspaceId={workspaceId}>
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
            <CardDescription>Uma visão geral de todos os projetos neste espaço de trabalho.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center gap-2 mb-4">
                <Input 
                    placeholder="Filtrar por nome..."
                    value={nameFilter}
                    onChange={(e) => setNameFilter(e.target.value)}
                    className="max-w-sm"
                />
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
            </div>
            
            <ProjectsTable projects={visibleProjects} onEdit={handleEdit} />

        </CardContent>
        </Card>
     </>
  )
}

function WorkspaceProjectsPageContent() {
  const { workspaceId } = useParams() as { workspaceId: string };
  const { workspaces } = useStore();
  const workspace = workspaces.find(w => w.id === workspaceId);

  if (!workspace) {
      return notFound();
  }

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
            <h1 className="text-3xl font-bold tracking-tight font-headline">Projetos: {workspace.name}</h1>
            <p className="text-muted-foreground">{workspace.description}</p>
        </div>
      </div>
      <Tabs defaultValue="projects">
        <TabsList>
            <TabsTrigger value="projects">Projetos</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="projects">
            <ProjectsListTab workspaceId={workspaceId} />
        </TabsContent>
        <TabsContent value="templates">
            <ManageTemplates />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function WorkspaceProjectsPage() {
  return (
    <AppLayout>
      <WorkspaceProjectsPageContent />
    </AppLayout>
  );
}

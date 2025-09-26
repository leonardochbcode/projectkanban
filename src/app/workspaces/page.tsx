
'use client';
import { PlusCircle, Edit, Trash2, Folder, Briefcase, FileText, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useStore } from '@/hooks/use-store';
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
import { useMemo, useState } from 'react';
import type { Workspace } from '@/lib/types';
import { ManageWorkspaceDialog } from '@/components/workspaces/manage-workspace-dialog';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

function WorkspacesPageContent() {
  const { workspaces, deleteWorkspace, getClient, getWorkspaceProjects } = useStore();
  const [editingWorkspace, setEditingWorkspace] = useState<Workspace | undefined>(undefined);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filters, setFilters] = useState({ name: '', client: '' });

  const handleEdit = (workspace: Workspace) => {
    setEditingWorkspace(workspace);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingWorkspace(undefined);
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      setEditingWorkspace(undefined);
    }
    setIsDialogOpen(open);
  }

  const filteredWorkspaces = useMemo(() => workspaces.filter(workspace => {
    const { name, client: clientFilter } = filters;
    const client = workspace.clientId ? getClient(workspace.clientId) : null;
    return (
      workspace.name.toLowerCase().includes(name.toLowerCase()) &&
      (client?.name || '').toLowerCase().includes(clientFilter.toLowerCase())
    );
  }), [workspaces, filters, getClient]);

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Espaços de Trabalho</h1>
        <div className="flex items-center space-x-2">
          <ManageWorkspaceDialog
            workspace={editingWorkspace}
            open={isDialogOpen}
            onOpenChange={handleDialogClose}
          >
            <Button onClick={handleAdd}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Espaço
            </Button>
          </ManageWorkspaceDialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <div className="flex items-center gap-4 pt-4">
            <Input
              placeholder="Filtrar por nome..."
              value={filters.name}
              onChange={e => setFilters(prev => ({ ...prev, name: e.target.value }))}
            />
            <Input
              placeholder="Filtrar por cliente..."
              value={filters.client}
              onChange={e => setFilters(prev => ({ ...prev, client: e.target.value }))}
            />
          </div>
        </CardHeader>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {filteredWorkspaces.map((workspace) => {
          const client = workspace.clientId ? getClient(workspace.clientId) : null;
          const projects = getWorkspaceProjects(workspace.id);
          const projectCount = projects.length;
          const completedProjects = projects.filter(p => p.status === 'Concluído').length;
          const progress = projectCount > 0 ? (completedProjects / projectCount) * 100 : 0;

          return (
            <Card key={workspace.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Folder className="h-6 w-6 text-primary" />
                    <CardTitle className="font-headline">{workspace.name}</CardTitle>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(workspace)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso excluirá permanentemente o espaço de trabalho.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteWorkspace(workspace.id)}>
                            Continuar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <CardDescription>{workspace.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                {client && (
                  <div className="flex items-center text-sm text-muted-foreground gap-2">
                    <Briefcase className="h-4 w-4" />
                    <span>Cliente: {client.name}</span>
                  </div>
                )}
                <div className="flex items-center text-sm text-muted-foreground gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{projectCount} {projectCount === 1 ? 'projeto' : 'projetos'}</span>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">Progresso</span>
                    <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center text-xs text-muted-foreground mt-1 gap-1">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>{completedProjects} de {projectCount} projetos concluídos</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0">
                <Link href={`/workspaces/${workspace.id}/`} passHref>
                  <Button className="w-full">
                    Abrir Espaço
                  </Button>
                </Link>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  );
}

export default function WorkspacesPage() {
  return (
    <AppLayout>
      <WorkspacesPageContent />
    </AppLayout>
  )
}

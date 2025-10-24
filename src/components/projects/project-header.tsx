'use client';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AddTaskDialog } from '../tasks/add-task-dialog';
import { ManageProjectDialog } from './manage-project-dialog';
import type { Project } from '@/lib/types';
import { useStore } from '@/hooks/use-store';
import { useSession } from 'next-auth/react';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Briefcase, Edit, ClipboardList, LayoutGrid, List, ChevronsRight, Lightbulb } from 'lucide-react';
import { OpportunityDetailsSheet } from '../opportunities/opportunity-details-sheet';
import { useState } from 'react';
import type { Opportunity } from '@/lib/types';
import Link from 'next/link';


interface ProjectHeaderProps {
  project: Project;
  viewMode: 'kanban' | 'list';
  setViewMode: (mode: 'kanban' | 'list') => void;
}


export function ProjectHeader({ project, viewMode, setViewMode }: ProjectHeaderProps) {
  const { data: session } = useSession();
  const { getProjectTasks, getClient, getOpportunity, workspaces } = useStore();
  const tasks = getProjectTasks(project.id);
  const client = project.clientId ? getClient(project.clientId) : null;
  const opportunity = project.opportunityId ? getOpportunity(project.opportunityId) : null;
  const workspace = workspaces.find(w => w.id === project.workspaceId);

  const [isOpportunitySheetOpen, setIsOpportunitySheetOpen] = useState(false);

  const completedTasks = tasks.filter((task) => task.status === 'Concluída' || task.status === 'Cancelado').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const handleEditOpportunity = (opportunityToEdit: Opportunity) => {
    // This is a dummy handler to satisfy the sheet component's prop requirement.
    // In this context, we're just viewing the opportunity, not opening an edit dialog from here.
  };

  const onOpportunityBadgeClick = () => {
    if (opportunity) {
      setIsOpportunitySheetOpen(true);
    }
  }

  return (
    <div className="p-4 sm:p-6 border-b text-xs">
      {workspace && (
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mb-2">
          <Link href="/workspaces" className="hover:text-primary">Espaços de Trabalho</Link>
          <ChevronsRight className="h-4 w-4" />
          <Link href={`/workspaces/${workspace.id}/`} className="hover:text-primary">{workspace.name}</Link>
        </div>
      )}
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight font-headline">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <p className="text-muted-foreground">{project.description}</p>
            {client && (
              <Badge variant="secondary" className="gap-1.5">
                <Briefcase className="h-3 w-3" />
                {client.name}
              </Badge>
            )}
            {opportunity && (
              <OpportunityDetailsSheet opportunity={opportunity} onEdit={handleEditOpportunity} open={isOpportunitySheetOpen} onOpenChange={setIsOpportunitySheetOpen}>
                <Badge variant="outline" className="gap-1.5 cursor-pointer hover:bg-muted" onClick={onOpportunityBadgeClick}>
                  <Lightbulb className="h-3 w-3" />
                  Originado da Oportunidade: {opportunity.name}
                </Badge>
              </OpportunityDetailsSheet>
            )}
          </div>
        </div>
        <div className="flex-shrink-0 flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Button variant={viewMode === 'kanban' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('kanban')}>
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} size="icon" onClick={() => setViewMode('list')}>
              <List className="h-4 w-4" />
            </Button>
          </div>
          {session?.user?.userType !== 'Convidado' && (
            <>
              <ManageProjectDialog project={project}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Editar Projeto
                </Button>
              </ManageProjectDialog>
              <AddTaskDialog projectId={project.id}>
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adicionar Tarefa
                </Button>
              </AddTaskDialog>
            </>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} />
        <div className="flex justify-between text-xs text-muted-foreground pt-1">
          <span>{completedTasks} de {tasks.length} tarefas concluídas</span>
        </div>
      </div>
    </div>
  );
}

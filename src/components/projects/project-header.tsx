'use client';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { AddTaskDialog } from '../tasks/add-task-dialog';
import { ManageProjectDialog } from './manage-project-dialog';
import type { Project } from '@/lib/types';
import { useStore } from '@/hooks/use-store';
import { Progress } from '@/components/ui/progress';
import { PlusCircle, Briefcase, Edit, ClipboardList, LayoutGrid, List } from 'lucide-react';
import { LeadDetailsSheet } from '../leads/lead-details-sheet';
import { useState } from 'react';
import type { Lead } from '@/lib/types';


interface ProjectHeaderProps {
  project: Project;
  viewMode: 'kanban' | 'list';
  setViewMode: (mode: 'kanban' | 'list') => void;
}


export function ProjectHeader({ project, viewMode, setViewMode }: ProjectHeaderProps) {
  const { getProjectTasks, getClient, getLead } = useStore();
  const tasks = getProjectTasks(project.id);
  const client = project.clientId ? getClient(project.clientId) : null;
  const lead = project.leadId ? getLead(project.leadId) : null;
  
  const [isLeadSheetOpen, setIsLeadSheetOpen] = useState(false);

  const completedTasks = tasks.filter((task) => task.status === 'Concluída').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
  
  const handleEditLead = (leadToEdit: Lead) => {
    // This is a dummy handler to satisfy the sheet component's prop requirement.
    // In this context, we're just viewing the lead, not opening an edit dialog from here.
  };

  const onLeadBadgeClick = () => {
    if (lead) {
      setIsLeadSheetOpen(true);
    }
  }

  return (
    <div className="p-4 sm:p-6 border-b">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-headline">{project.name}</h1>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <p className="text-muted-foreground">{project.description}</p>
            {client && (
              <Badge variant="secondary" className="gap-1.5">
                <Briefcase className="h-3 w-3" />
                {client.name}
              </Badge>
            )}
             {lead && (
              <LeadDetailsSheet lead={lead} onEdit={handleEditLead} open={isLeadSheetOpen} onOpenChange={setIsLeadSheetOpen}>
                <Badge variant="outline" className="gap-1.5 cursor-pointer hover:bg-muted" onClick={onLeadBadgeClick}>
                    <ClipboardList className="h-3 w-3" />
                    Originado da Proposta: {lead.name}
                </Badge>
              </LeadDetailsSheet>
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
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm text-muted-foreground">
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

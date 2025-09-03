'use client';
import { useStore } from '@/hooks/use-store';
import { AppLayout } from '@/components/layout/app-layout';
import { ProjectsOverviewReport } from '@/components/reports/projects-overview-report';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { ManageProjectDialog } from '@/components/projects/manage-project-dialog';
import { ManageOpportunityDialog } from '@/components/opportunities/manage-opportunity-dialog';
import type { Project, Opportunity } from '@/lib/types';


export default function DashboardPage() {
  const { projects, isLoaded, tasks, clients, currentUser, getRole } = useStore();

  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | undefined>(undefined);
  const [isOpportunityDialogOpen, setIsOpportunityDialogOpen] = useState(false);

  const userRole = currentUser ? getRole(currentUser.roleId) : null;
  const canManageProjects = userRole?.permissions.includes('manage_projects') ?? false;
  const canManageOpportunities = userRole?.permissions.includes('manage_opportunities') ?? false;


  const activeProjects = useMemo(() => {
    return projects.filter(p => p.status === 'Em Andamento');
  }, [projects]);

  const handleAddProject = () => {
    setEditingProject(undefined);
    setIsProjectDialogOpen(true);
  };
  
  const handleAddOpportunity = () => {
    setEditingOpportunity(undefined);
    setIsOpportunityDialogOpen(true);
  };

  const handleProjectDialogClose = (open: boolean) => {
    if (!open) {
      setEditingProject(undefined);
    }
    setIsProjectDialogOpen(open);
  };

  const handleOpportunityDialogClose = (open: boolean) => {
    if (!open) {
      setEditingOpportunity(undefined);
    }
    setIsOpportunityDialogOpen(open);
  };

  const PageContent = () => (
     <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Painel</h1>
        <div className="flex items-center space-x-2">
          {canManageProjects && (
             <ManageProjectDialog project={editingProject} open={isProjectDialogOpen} onOpenChange={handleProjectDialogClose}>
              <Button onClick={handleAddProject}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Criar Projeto
              </Button>
            </ManageProjectDialog>
          )}
           {canManageOpportunities && (
             <ManageOpportunityDialog opportunity={editingOpportunity} open={isOpportunityDialogOpen} onOpenChange={handleOpportunityDialogClose}>
              <Button onClick={handleAddOpportunity}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Adicionar Oportunidade
              </Button>
            </ManageOpportunityDialog>
          )}
        </div>
      </div>
        <ProjectsOverviewReport
          projects={activeProjects}
          tasks={tasks}
          clients={clients}
          isLoaded={isLoaded}
        />
    </div>
  )

  return (
    <AppLayout>
      <PageContent />
    </AppLayout>
  );
}

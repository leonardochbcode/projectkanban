'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AddProjectDialog } from '@/components/dashboard/add-project-dialog';
import { useStore } from '@/hooks/use-store';
import { AppLayout } from '@/components/layout/app-layout';
import { ProjectsOverviewReport } from '@/components/reports/projects-overview-report';


export default function DashboardPage() {
  const { projects, isLoaded, tasks, clients } = useStore();

  const PageContent = () => (
     <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Painel</h1>
        <div className="flex items-center space-x-2">
          <AddProjectDialog>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Criar Projeto
            </Button>
          </AddProjectDialog>
        </div>
      </div>
        <ProjectsOverviewReport
          projects={projects}
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

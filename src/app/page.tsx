'use client';
import { useStore } from '@/hooks/use-store';
import { AppLayout } from '@/components/layout/app-layout';
import { ProjectsOverviewReport } from '@/components/reports/projects-overview-report';
import { useMemo } from 'react';


export default function DashboardPage() {
  const { projects, isLoaded, tasks, clients } = useStore();

  const activeProjects = useMemo(() => {
    return projects.filter(p => p.status === 'Em Andamento');
  }, [projects]);

  const PageContent = () => (
     <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Painel</h1>
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

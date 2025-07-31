'use client';
import { AppLayout } from '@/components/layout/app-layout';
import { ProjectsOverviewReport } from '@/components/reports/projects-overview-report';
import { useStore } from '@/hooks/use-store';

function ReportsPageContent() {
  const { projects, tasks, clients, isLoaded } = useStore();

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Relatórios</h1>
      </div>
      <ProjectsOverviewReport 
        projects={projects} 
        tasks={tasks} 
        clients={clients} 
        isLoaded={isLoaded}
      />
    </div>
  );
}

export default function ReportsPage() {
    return (
        <AppLayout>
            <ReportsPageContent />
        </AppLayout>
    )
}

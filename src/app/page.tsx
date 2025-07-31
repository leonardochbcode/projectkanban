'use client';

import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/dashboard/project-card';
import { SummaryCharts } from '@/components/dashboard/summary-charts';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { AddProjectDialog } from '@/components/dashboard/add-project-dialog';
import { useStore } from '@/hooks/use-store';
import { Skeleton } from '@/components/ui/skeleton';
import { AppLayout } from '@/components/layout/app-layout';

export default function DashboardPage() {
  const { projects, isLoaded, currentUser, getRole } = useStore();

  const userRole = currentUser ? getRole(currentUser.roleId) : null;
  const canViewAllProjects = userRole?.permissions.includes('manage_projects') ?? false;

  const visibleProjects = canViewAllProjects
    ? projects
    : projects.filter(p => p.participantIds.includes(currentUser?.id ?? ''));


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
      <div className="space-y-4">
        <SummaryCharts />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-12 lg:col-span-4">
            <h2 className="text-2xl font-bold tracking-tight mb-4 font-headline">Projetos</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {!isLoaded && Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-48" />)}
              {isLoaded && visibleProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </div>
          <RecentActivity />
        </div>
      </div>
    </div>
  )

  return (
    <AppLayout>
      <PageContent />
    </AppLayout>
  );
}

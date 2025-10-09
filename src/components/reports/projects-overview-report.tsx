'use client';
import type { Project, Task, Client } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';
import Link from 'next/link';
import { TaskChecklist } from '../dashboard/task-checklist';

interface ProjectsOverviewReportProps {
  projects: Project[];
  allProjects: Project[];
  tasks: Task[];
  clients: Client[];
  isLoaded: boolean;
}

export function ProjectsOverviewReport({ projects, allProjects, tasks, clients, isLoaded }: ProjectsOverviewReportProps) {
  const reportData = useMemo(() => {
    const statusCounts = {
      'Planejamento': 0,
      'Em Andamento': 0,
      'Concluído': 0,
      'Pausado': 0,
      'Cancelado': 0,
    };

    const projectDetails = projects.map(project => {
      if (project.status in statusCounts) {
        statusCounts[project.status as keyof typeof statusCounts]++;
      }
      
      const projectTasks = tasks.filter(t => t.projectId === project.id);
      const completedTasks = projectTasks.filter(t => t.status === 'Concluída').length;
      const progress = projectTasks.length > 0 ? (completedTasks / projectTasks.length) * 100 : 0;
      const client = clients.find(c => c.id === project.clientId);

      return {
        ...project,
        clientName: client?.name || 'N/A',
        taskCount: projectTasks.length,
        progress: Math.round(progress),
      };
    });

    const totalProjects = projects.length;
    const concludedProjects = statusCounts['Concluído'];
    const planningProjects = statusCounts['Planejamento'];

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const sevenDaysFromNow = new Date(today);
    sevenDaysFromNow.setDate(today.getDate() + 7);

    const upcomingTasks = tasks
      .filter(task => {
        const dueDate = new Date(task.dueDate);
        return task.status !== 'Concluída' && dueDate <= sevenDaysFromNow;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return { totalProjects, concludedProjects, planningProjects, projectDetails, upcomingTasks };
  }, [projects, tasks, clients]);

  const statusColors: { [key: string]: string } = {
    'Em Andamento': 'bg-blue-500/20 text-blue-700',
    'Planejamento': 'bg-yellow-500/20 text-yellow-700',
    'Concluído': 'bg-green-500/20 text-green-700',
    'Pausado': 'bg-gray-500/20 text-gray-700',
    'Cancelado': 'bg-red-500/20 text-red-700',
  };

  if (!isLoaded) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects.filter(p => p.status === 'Em Andamento').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.concludedProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Planejamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reportData.planningProjects}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        <TaskChecklist tasks={reportData.upcomingTasks} projects={allProjects} />
      </div>
    </div>
  );
}

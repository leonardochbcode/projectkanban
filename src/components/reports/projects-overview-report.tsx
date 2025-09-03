'use client';
import type { Project, Task, Client } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Skeleton } from '../ui/skeleton';
import { Progress } from '../ui/progress';
import Link from 'next/link';

interface ProjectsOverviewReportProps {
  projects: Project[];
  tasks: Task[];
  clients: Client[];
  isLoaded: boolean;
}

export function ProjectsOverviewReport({ projects, tasks, clients, isLoaded }: ProjectsOverviewReportProps) {
  const reportData = useMemo(() => {
    const statusCounts = {
      'Planejamento': 0,
      'Em Andamento': 0,
      'Concluído': 0,
      'Pausado': 0,
    };

    const projectDetails = projects.map(project => {
      statusCounts[project.status]++;
      
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

    const pieData = Object.entries(statusCounts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0);

    const totalProjects = projects.length;
    const concludedProjects = statusCounts['Concluído'];
    const planningProjects = statusCounts['Planejamento'];

    return { totalProjects, concludedProjects, planningProjects, projectDetails, pieData };
  }, [projects, tasks, clients]);

  const COLORS = {
    'Em Andamento': 'hsl(var(--chart-1))',
    'Planejamento': 'hsl(var(--chart-2))',
    'Concluído': 'hsl(var(--chart-4))',
    'Pausado': 'hsl(var(--chart-3))',
  };

  const statusColors: { [key: string]: string } = {
    'Em Andamento': 'bg-blue-500/20 text-blue-700',
    'Planejamento': 'bg-yellow-500/20 text-yellow-700',
    'Concluído': 'bg-green-500/20 text-green-700',
    'Pausado': 'bg-gray-500/20 text-gray-700',
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Tabela de Projetos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Projeto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progresso</TableHead>
                  <TableHead className="text-right">Tarefas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.projectDetails.map(project => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                       <Link href={`/projects/${project.id}`} className="hover:underline">
                        {project.name}
                       </Link>
                    </TableCell>
                    <TableCell>{project.clientName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn(statusColors[project.status])}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                        <div className="flex items-center gap-2">
                            <Progress value={project.progress} className="h-2 w-24" />
                            <span className="text-xs text-muted-foreground">{project.progress}%</span>
                        </div>
                    </TableCell>
                    <TableCell className="text-right">{project.taskCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Projetos por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {reportData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    borderColor: 'hsl(var(--border))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

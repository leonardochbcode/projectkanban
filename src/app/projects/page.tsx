'use client';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useStore } from '@/hooks/use-store';
import { cn } from '@/lib/utils';
import { AddProjectDialog } from '@/components/dashboard/add-project-dialog';
import Link from 'next/link';
import { AppLayout } from '@/components/layout/app-layout';

function ProjectsPageContent() {
  const { projects } = useStore();

  const statusColors: { [key: string]: string } = {
    'Em Andamento': 'bg-blue-500/20 text-blue-700 dark:text-blue-400 border-blue-500/30',
    Planejamento: 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border-yellow-500/30',
    Concluído: 'bg-green-500/20 text-green-700 dark:text-green-400 border-green-500/30',
    Pausado: 'bg-gray-500/20 text-gray-700 dark:text-gray-400 border-gray-500/30',
  };
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Projetos</h1>
        <div className="flex items-center space-x-2">
            <AddProjectDialog>
                <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Criar Projeto
                </Button>
            </AddProjectDialog>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Lista de Projetos</CardTitle>
          <CardDescription>Uma visão geral de todos os seus projetos.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data de Início</TableHead>
                <TableHead>Data de Término</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">
                    <Link href={`/projects/${project.id}`} className="hover:underline">
                        {project.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(statusColors[project.status])}>
                      {project.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(project.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(project.endDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ProjectsPage() {
    return (
        <AppLayout>
            <ProjectsPageContent />
        </AppLayout>
    )
}

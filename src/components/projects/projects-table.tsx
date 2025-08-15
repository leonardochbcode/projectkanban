
'use client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MoreVertical, Edit, Copy } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useStore } from '@/hooks/use-store';

interface ProjectsTableProps {
  projects: Project[];
  onEdit: (project: Project) => void;
}

export function ProjectsTable({ projects, onEdit }: ProjectsTableProps) {
  const { duplicateProject } = useStore();

  const statusColors: { [key: string]: string } = {
    'Em Andamento': 'bg-blue-500/20 text-blue-700',
    Planejamento: 'bg-yellow-500/20 text-yellow-700',
    Concluído: 'bg-green-500/20 text-green-700',
    Pausado: 'bg-gray-500/20 text-gray-700',
  };

  const handleDuplicate = (project: Project) => {
    const newProject = duplicateProject(project);
    onEdit(newProject);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Data de Início</TableHead>
          <TableHead>Data de Término</TableHead>
          <TableHead className="text-right">Ações</TableHead>
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
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onSelect={() => onEdit(project)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => handleDuplicate(project)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

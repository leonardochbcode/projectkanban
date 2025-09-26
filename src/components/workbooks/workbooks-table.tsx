'use client';
import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Workbook, Project, Task, Participant } from '@/lib/types';
import { MoreVertical, Edit, FolderKanban, Trash2, Folder, Users, Calendar, Flag, User, ChevronDown, CheckCircle, GripVertical } from 'lucide-react';
import { Progress } from '../ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { useStore } from '@/hooks/use-store';
import { ManageWorkbookProjectsDialog } from './manage-workbook-projects-dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Link from 'next/link';

interface WorkbooksTableProps {
  workbooks: Workbook[];
  onEdit: (workbook: Workbook) => void;
}

const priorityIcons = {
  'Baixa': <Flag className="h-4 w-4 text-gray-500" />,
  'Média': <Flag className="h-4 w-4 text-yellow-500" />,
  'Alta': <Flag className="h-4 w-4 text-red-500" />,
};

const statusColors: { [key: string]: string } = {
  'A Fazer': 'bg-gray-500',
  'Em Andamento': 'bg-blue-500',
  'Concluída': 'bg-green-500',
  'Cancelado': 'bg-red-500',
  'Planejamento': 'bg-yellow-500',
  'Pausado': 'bg-orange-500',
};

function TaskItem({ task, getParticipant }: { task: Task, getParticipant: (id?: string) => Participant | undefined }) {
  const assignee = getParticipant(task.assigneeId);
  return (
    <div className="flex items-center justify-between p-2 border-b last:border-b-0">
      <Link href={`/projects/${task.projectId}?taskId=${task.id}`} className="hover:underline text-sm">
        {task.title}
      </Link>
      <div className="flex items-center gap-4">
        <Badge variant="outline" className="flex items-center gap-1">
          <div className={`h-2 w-2 rounded-full ${statusColors[task.status] || 'bg-gray-400'}`} />
          {task.status}
        </Badge>
        <Badge variant="outline" className="flex items-center gap-1">
          {priorityIcons[task.priority]}
          {task.priority}
        </Badge>
        {assignee && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <User className="h-4 w-4" />
            {assignee.name}
          </Badge>
        )}
      </div>
    </div>
  );
}

function ProjectItem({ project, getProjectTasks, getParticipant }: { project: Project, getProjectTasks: (id: string) => Task[], getParticipant: (id?: string) => Participant | undefined }) {
  const [isOpen, setIsOpen] = useState(false);
  const tasks = getProjectTasks(project.id);
  const participants = project.participantIds.map(id => getParticipant(id)).filter(Boolean) as Participant[];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between p-3 border rounded-md">
        <div className="flex items-center gap-3">
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </Button>
          </CollapsibleTrigger>
          <Link href={`/projects/${project.id}`} className="font-semibold hover:underline">
            {project.name}
          </Link>
        </div>
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{participants.length} Participante(s)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`h-2 w-2 rounded-full ${statusColors[project.status] || 'bg-gray-400'}`} />
            <span>{project.status}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{format(new Date(project.endDate), 'dd/MM/yyyy')}</span>
          </div>
        </div>
      </div>
      <CollapsibleContent className="p-0 pl-12">
        <div className="mt-2 border-l-2">
          {tasks.length > 0 ? (
            tasks.map(task => <TaskItem key={task.id} task={task} getParticipant={getParticipant} />)
          ) : (
            <p className="p-4 text-sm text-muted-foreground">Nenhuma tarefa neste projeto.</p>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function WorkbooksTable({ workbooks, onEdit }: WorkbooksTableProps) {
  const { getProject, deleteWorkbook, getProjectTasks, getParticipant } = useStore();
  const [isProjectsDialogOpen, setIsProjectsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedWorkbook, setSelectedWorkbook] = useState<Workbook | null>(null);

  const handleManageProjects = (workbook: Workbook) => {
    setSelectedWorkbook(workbook);
    setIsProjectsDialogOpen(true);
  };

  const handleDelete = (workbook: Workbook) => {
    setSelectedWorkbook(workbook);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedWorkbook) {
      deleteWorkbook(selectedWorkbook.id);
    }
    setIsDeleteDialogOpen(false);
    setSelectedWorkbook(null);
  };

  return (
    <div className="space-y-2">
      {workbooks.map((workbook) => {
        const projects = workbook.projectIds.map(id => getProject(id)).filter(Boolean) as Project[];
        const completedProjects = projects.filter(p => p.status === 'Concluído').length;
        const progress = projects.length > 0 ? (completedProjects / projects.length) * 100 : 0;

        return (
          <Accordion key={workbook.id} type="single" collapsible className="border rounded-lg px-4">
            <AccordionItem value={workbook.id} className="border-b-0">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-4">
                    <Folder className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold text-left">{workbook.name}</h3>
                      <p className="text-sm text-muted-foreground text-left">{workbook.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 pr-4">
                    <div className="flex flex-col items-center">
                      <span className="text-2xl font-bold">{projects.length}</span>
                      <span className="text-xs text-muted-foreground">PROJETOS</span>
                    </div>
                    <div className="w-40">
                       <div className="flex justify-between items-center mb-1">
                          <span className="text-sm text-muted-foreground flex items-center gap-1"><CheckCircle className="h-4 w-4 text-green-500" /> Concluídos</span>
                          <span className="text-sm font-semibold">{Math.round(progress)}%</span>
                        </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onSelect={() => onEdit(workbook)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar Pasta
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleManageProjects(workbook)}>
                          <FolderKanban className="mr-2 h-4 w-4" />
                          Gerenciar Projetos
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onSelect={() => handleDelete(workbook)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir Pasta
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-2">
                <div className="space-y-3">
                  {projects.length > 0 ? (
                    projects.map(project => <ProjectItem key={project.id} project={project} getProjectTasks={getProjectTasks} getParticipant={getParticipant} />)
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Nenhum projeto foi adicionado a esta pasta de trabalho.</p>
                      <Button variant="link" onClick={() => handleManageProjects(workbook)}>Adicionar Projetos</Button>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )
      })}

      {selectedWorkbook && (
        <ManageWorkbookProjectsDialog
          workbook={selectedWorkbook}
          open={isProjectsDialogOpen}
          onOpenChange={setIsProjectsDialogOpen}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente a pasta de trabalho
              e removerá todas as associações de projetos (os projetos não serão excluídos).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

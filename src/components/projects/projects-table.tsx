
'use client';
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import type { Project, Task } from '@/lib/types';
import { cn } from '@/lib/utils';
import { MoreVertical, Edit, Copy, ChevronDown, ChevronRight, User } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useStore } from '@/hooks/use-store';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { TaskDetailsSheet } from '../tasks/task-details-sheet';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '../ui/tooltip';

interface ProjectsTableProps {
    projects: Project[];
    onEdit: (project: Project) => void;
}

const statusColors: { [key: string]: string } = {
    'Em Andamento': 'bg-blue-500/20 text-blue-700',
    Planejamento: 'bg-yellow-500/20 text-yellow-700',
    Concluído: 'bg-green-500/20 text-green-700',
    Pausado: 'bg-gray-500/20 text-gray-700',
};
const taskStatusColors: { [key: string]: string } = {
    'A Fazer': 'bg-yellow-500/20 text-yellow-700',
    'Em Andamento': 'bg-blue-500/20 text-blue-700',
    'Concluída': 'bg-green-500/20 text-green-700',
    'Cancelado': 'bg-gray-500/20 text-gray-700',
};
const taskPriorityColors: { [key: string]: string } = {
    'Alta': 'bg-red-500/20 text-red-700',
    'Média': 'bg-yellow-500/20 text-yellow-700',
    'Baixa': 'bg-blue-500/20 text-blue-700',
};


function ProjectTasksRow({ project, tasks, isVisible }: { project: Project, tasks: Task[], isVisible: boolean }) {
    const { getParticipant } = useStore();

    if (!isVisible) return null;

    return (
        <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableCell colSpan={6} className="p-0">
                <div className="p-4 text-xs">
                    <h4 className="text-xs font-semibold mb-2">Tarefas do Projeto: {project.name}</h4>
                    {tasks.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[40%]">Título</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Prioridade</TableHead>
                                    <TableHead>Responsável</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {tasks.map(task => {
                                    const assignee = task.assigneeId ? getParticipant(task.assigneeId) : null;
                                    return (
                                        <TaskDetailsSheet key={task.id} task={task}>
                                            <TableRow className="bg-background cursor-pointer text-xs">
                                                <TableCell className="font-medium">{task.title}</TableCell>
                                                <TableCell><Badge variant="outline" className={cn(taskStatusColors[task.status])}>{task.status}</Badge></TableCell>
                                                <TableCell><Badge variant="outline" className={cn(taskPriorityColors[task.priority])}>{task.priority}</Badge></TableCell>
                                                <TableCell>
                                                    {assignee ? (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar className="h-6 w-6">
                                                                <AvatarImage src={assignee.avatar} />
                                                                <AvatarFallback>{assignee.name[0]}</AvatarFallback>
                                                            </Avatar>
                                                            <span className="text-xs">{assignee.name.split(' ')[0]}</span>
                                                        </div>
                                                    ) : <span className="text-xs text-muted-foreground">N/A</span>}
                                                </TableCell>
                                            </TableRow>
                                        </TaskDetailsSheet>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    ) : (
                        <p className="text-sm text-muted-foreground px-4 py-2">Nenhuma tarefa neste projeto.</p>
                    )}
                </div>
            </TableCell>
        </TableRow>
    )
}

export function ProjectsTable({ projects, onEdit }: ProjectsTableProps) {
    const { data: session } = useSession();
    const { duplicateProject, getProjectTasks, getParticipant, participants } = useStore();
    const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

    const handleDuplicate = (project: Project) => {
        const { id, ...projectWithoutId } = project;
        const newProject = {
            ...projectWithoutId,
            name: `${project.name} (Cópia)`,
            isDuplicate: true,
            id: project.id,
        };
        onEdit(newProject as any);
    };

    const toggleRow = (projectId: string) => {
        setExpandedRows(prev => ({ ...prev, [projectId]: !prev[projectId] }));
    };

    const getParticipantsForProject = (project: Project) => {
        return project.participantIds
            .map(id => participants.find(p => p.id === id))
            .filter(Boolean) as typeof participants[0][];
    };

    return (
        <Table className='text-xs'>
            <TableHeader>
                <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Participantes</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Datas</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {projects.map((project) => {
                    const tasks = getProjectTasks(project.id);
                    const projectParticipants = getParticipantsForProject(project);
                    const isExpanded = expandedRows[project.id];
                    return (
                        <React.Fragment key={project.id}>
                            <TableRow>
                                <TableCell>
                                    <Button variant="ghost" size="icon" onClick={() => toggleRow(project.id)} className="h-8 w-8">
                                        {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                                    </Button>
                                </TableCell>
                                <TableCell className="font-medium">
                                    <Link href={`/projects/${project.id}`} className="hover:underline">
                                        Projeto: {project.name}
                                    </Link>
                                </TableCell>
                                <TableCell>
                                    <div className="flex -space-x-2 overflow-hidden">
                                        <TooltipProvider>
                                            {projectParticipants.length > 0 ? projectParticipants.map((p) => (
                                                <Tooltip key={p.id}>
                                                    <TooltipTrigger asChild>
                                                        <Avatar className="inline-block h-7 w-7 rounded-full ring-2 ring-background">
                                                            <AvatarImage src={p.avatar} />
                                                            <AvatarFallback>{p.name[0]}</AvatarFallback>
                                                        </Avatar>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>{p.name}</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            )) : <span className="text-xs text-muted-foreground pl-2">Ninguém</span>}
                                        </TooltipProvider>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={cn(statusColors[project.status])}>
                                        {project.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs">
                                    {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                                </TableCell>
                                <TableCell className="text-right">
                                    {session?.user?.userType !== 'Convidado' && (
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
                                    )}
                                </TableCell>
                            </TableRow>
                            <ProjectTasksRow project={project} tasks={tasks} isVisible={isExpanded} />
                        </React.Fragment>
                    )
                })}
            </TableBody>
        </Table>
    );
}

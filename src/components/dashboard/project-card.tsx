'use client';

import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useStore } from '@/hooks/use-store';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Briefcase, Calendar, User, Users } from 'lucide-react';
import { format } from 'date-fns';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { getProjectTasks, participants, getClient, getParticipant } = useStore();
  const tasks = getProjectTasks(project.id);
  const completedTasks = tasks.filter((task) => task.status === 'Concluída').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const projectParticipants = project.participantIds
    .map((id) => participants.find((p) => p.id === id))
    .filter(Boolean) as (typeof participants[0])[];

  const client = getClient(project.clientId || '');
  const pmo = getParticipant(project.pmoId);

  const statusInfo = {
    'Em Andamento': { label: 'Em Andamento', color: 'bg-blue-500 text-white' },
    'Planejamento': { label: 'Planejamento', color: 'bg-yellow-500 text-white' },
    'Concluído': { label: 'Concluído', color: 'bg-green-500 text-white' },
    'Pausado': { label: 'Pausado', color: 'bg-gray-500 text-white' },
    'Cancelado': { label: 'Cancelado', color: 'bg-red-500 text-white' },
  }[project.status] || { label: project.status, color: 'bg-gray-200 text-gray-800' };


  return (
    <Link href={`/projects/${project.id}`} className="block h-full">
      <Card className="hover:shadow-xl transition-shadow duration-300 h-full flex flex-col border-l-4" style={{ borderLeftColor: statusInfo.color }}>
        <CardHeader>
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="font-headline text-lg leading-tight">{project.name}</CardTitle>
            <Badge variant="default" className={cn("text-xs whitespace-nowrap", statusInfo.color)}>
              {statusInfo.label}
            </Badge>
          </div>
          {project.description && <CardDescription className="text-sm line-clamp-2 mt-1">{project.description}</CardDescription>}
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
            {/* Project Details */}
            <div className="space-y-2 text-sm text-muted-foreground">
                {client && (
                    <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        <span>{client.name}</span>
                    </div>
                )}
                {pmo && (
                     <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>{pmo.name}</span>
                    </div>
                )}
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(project.startDate), 'dd/MM/yy')} - {format(new Date(project.endDate), 'dd/MM/yy')}</span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Progresso</span>
                    <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
                <div className="text-xs text-muted-foreground pt-1">
                    <span>{completedTasks} de {tasks.length} tarefas concluídas</span>
                </div>
            </div>
        </CardContent>
        <CardFooter className="pt-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex -space-x-2 overflow-hidden">
              <TooltipProvider>
                {projectParticipants.slice(0, 5).map((p) =>
                  p ? (
                    <Tooltip key={p.id}>
                      <TooltipTrigger asChild>
                        <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                          <AvatarImage src={p.avatar} alt={p.name} />
                          <AvatarFallback>{p.name[0]}</AvatarFallback>
                        </Avatar>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{p.name}</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : null
                )}
              </TooltipProvider>
               {projectParticipants.length > 5 && (
                 <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted text-muted-foreground text-xs ring-2 ring-background">
                    +{projectParticipants.length - 5}
                 </div>
                )}
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{projectParticipants.length}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

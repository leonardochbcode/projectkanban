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

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  const { getProjectTasks, participants } = useStore();
  const tasks = getProjectTasks(project.id);
  const completedTasks = tasks.filter((task) => task.status === 'Concluída').length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  const projectParticipants = project.participantIds
    .map((id) => participants.find((p) => p.id === id))
    .filter(Boolean) as (typeof participants[0])[];

  const statusColors: { [key: string]: string } = {
    'Em Andamento': 'bg-secondary text-secondary-foreground',
    Planejamento: 'bg-secondary text-secondary-foreground',
    Concluído: 'bg-secondary text-secondary-foreground',
    Pausado: 'bg-secondary text-secondary-foreground',
  };

  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="font-headline text-lg">{project.name}</CardTitle>
            <Badge variant="outline" className={cn(statusColors[project.status])}>
              {project.status}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">{project.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-1">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} />
            <div className="flex justify-between text-xs text-muted-foreground pt-1">
              <span>{completedTasks} / {tasks.length} tarefas</span>
              <span>Prazo: {new Date(project.endDate).toLocaleDateString()}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex -space-x-2 overflow-hidden">
            <TooltipProvider>
              {projectParticipants.map((p) =>
                p ? (
                  <Tooltip key={p.id}>
                    <TooltipTrigger asChild>
                      <Avatar className="inline-block h-8 w-8 rounded-full ring-2 ring-background">
                        <AvatarImage src={p.avatar} />
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
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}

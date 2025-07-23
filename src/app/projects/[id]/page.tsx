'use client';

import { useStore } from '@/hooks/use-store';
import { ProjectHeader } from '@/components/projects/project-header';
import { KanbanBoard } from '@/components/projects/kanban-board';
import { notFound } from 'next/navigation';

export default function ProjectDetailsPage({ params }: { params: { id: string } }) {
  const { projects, getProjectTasks } = useStore();
  const project = projects.find((p) => p.id === params.id);
  
  if (!project) {
    return notFound();
  }

  const tasks = getProjectTasks(project.id);

  return (
    <div className="flex flex-col h-full">
      <ProjectHeader project={project} />
      <div className="flex-1 overflow-x-auto p-4 sm:p-6">
        <KanbanBoard tasks={tasks} projectId={project.id} />
      </div>
    </div>
  );
}

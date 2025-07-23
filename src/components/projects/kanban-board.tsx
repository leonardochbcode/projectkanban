'use client';

import type { Task } from '@/lib/types';
import { TaskCard } from './task-card';

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
}

const statuses: Task['status'][] = ['A Fazer', 'Em Andamento', 'Concluída'];

export function KanbanBoard({ tasks }: KanbanBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-max">
      {statuses.map((status) => (
        <div key={status} className="bg-muted/50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4 font-headline">{status}</h2>
          <div className="space-y-4">
            {tasks
              .filter((task) => task.status === status)
              .map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

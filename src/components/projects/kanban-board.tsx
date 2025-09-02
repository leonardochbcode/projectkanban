'use client';
import { DndContext, closestCenter, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '@/lib/types';
import { TaskCard } from './task-card';
import { useStore } from '@/hooks/use-store';

interface KanbanColumnProps {
  id: string;
  status: Task['status'];
  tasks: Task[];
}

function KanbanColumn({ id, status, tasks }: KanbanColumnProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isOver } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isOver ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-muted/50 rounded-lg p-4 transition-colors ${
        isOver ? 'bg-muted' : ''
      }`}
    >
      <h2 className="text-lg font-semibold mb-4 font-headline">{status}</h2>
      <div className="space-y-4">
        <SortableContext items={tasks.map((t) => t.id)}>
          {tasks.map((task) => (
            <DraggableTaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}

function DraggableTaskCard({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 0,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} />
    </div>
  );
}

interface KanbanBoardProps {
  tasks: Task[];
  projectId: string;
}

const statuses: Task['status'][] = ['A Fazer', 'Em Andamento', 'Concluída'];

export function KanbanBoard({ tasks, projectId }: KanbanBoardProps) {
  const { updateTask } = useStore();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeTask = tasks.find((t) => t.id === active.id);
    const overColumnStatus = over.id as Task['status'];

    if (activeTask && activeTask.status !== overColumnStatus) {
      updateTask({ ...activeTask, status: overColumnStatus });
    }
  };

  return (
    <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-w-max">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            id={status}
            status={status}
            tasks={tasks.filter((task) => task.status === status)}
          />
        ))}
      </div>
    </DndContext>
  );
}

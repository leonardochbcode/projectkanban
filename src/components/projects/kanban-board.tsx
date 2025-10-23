'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  type DragStartEvent,
  type DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
  const { setNodeRef, isOver } = useSortable({ id, data: { type: 'COLUMN' } });

  return (
    <div
      ref={setNodeRef}
      className={`bg-muted/50 rounded-lg p-4 transition-colors min-h-[150px] ${isOver ? 'bg-muted' : ''
        }`}
    >
      <h2 className="text-xs font-semibold mb-4 font-headline">{status}</h2>
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4 text-xs">
          {tasks.map((task) => (
            <DraggableTaskCard key={task.id} task={task} />
          ))}
        </div>
      </SortableContext>
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

const statuses: Task['status'][] = ['A Fazer', 'Em Andamento', 'Concluída', 'Cancelado'];

export function KanbanBoard({ tasks: initialTasks, projectId }: KanbanBoardProps) {
  const { updateTask } = useStore();
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const tasksByStatus = useMemo(() => {
    return statuses.reduce((acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    }, {} as Record<Task['status'], Task[]>);
  }, [tasks]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeTask = tasks.find(t => t.id === active.id);
    if (!activeTask) return;

    const overId = over.id as string;
    const overIsColumn = statuses.includes(overId as Task['status']);

    setTasks(currentTasks => {
      const activeIndex = currentTasks.findIndex(t => t.id === active.id);

      if (overIsColumn) {
        const newStatus = overId as Task['status'];
        if (activeTask.status === newStatus) return currentTasks; // No change if status is same

        currentTasks[activeIndex].status = newStatus;
        return arrayMove(currentTasks, activeIndex, activeIndex); // Trigger re-render
      }

      const overTask = currentTasks.find(t => t.id === overId);
      if (!overTask || activeTask.status !== overTask.status) return currentTasks;

      const overIndex = currentTasks.findIndex(t => t.id === overId);
      return arrayMove(currentTasks, activeIndex, overIndex);
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const originalTask = initialTasks.find(t => t.id === active.id);
    const updatedTask = tasks.find(t => t.id === active.id);

    if (originalTask && updatedTask && (originalTask.status !== updatedTask.status)) {
      updateTask({ id: updatedTask.id, status: updatedTask.status });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statuses.map((status) => (
          <KanbanColumn
            key={status}
            id={status}
            status={status}
            tasks={tasksByStatus[status]}
          />
        ))}
      </div>
    </DndContext>
  );
}

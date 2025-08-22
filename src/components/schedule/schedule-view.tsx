'use client';

import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useStore } from '@/hooks/use-store';
import { parseISO } from 'date-fns';
import { TaskDetailsSheet } from '../tasks/task-details-sheet';
import { useState } from 'react';
import type { Task } from '@/lib/types';


const locales = {
  'pt-BR': ptBR,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export function ScheduleView() {
  const { tasks, participants, projects } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);

  const { events, resources } = useMemo(() => {
    const resources = participants.map((p) => ({
      resourceId: p.id,
      resourceTitle: p.name,
    }));

    const events = tasks.map((task) => {
       const project = projects.find(p => p.id === task.projectId);
       return {
            id: task.id,
            title: `${project?.name || 'Projeto'}: ${task.title}`,
            start: parseISO(task.dueDate),
            end: parseISO(task.dueDate),
            resourceId: task.assigneeId,
            data: task,
        }
    }).filter(event => event.resourceId); // Only show tasks with an assignee

    return { events, resources };
  }, [tasks, participants, projects]);

  const handleSelectEvent = (event: any) => {
    setSelectedTask(event.data);
  };
  
  const onSheetOpenChange = (isOpen: boolean) => {
    if(!isOpen) {
        setSelectedTask(undefined);
    }
  }

  return (
    <>
      <div className="h-[75vh] bg-card p-4 rounded-lg border">
        <Calendar
          localizer={localizer}
          events={events}
          resources={resources}
          resourceIdAccessor="resourceId"
          resourceTitleAccessor="resourceTitle"
          defaultView="day"
          views={['day', 'week', 'month']}
          step={60}
          onSelectEvent={handleSelectEvent}
          messages={{
            next: "Próximo",
            previous: "Anterior",
            today: "Hoje",
            month: "Mês",
            week: "Semana",
            day: "Dia",
            agenda: "Agenda",
            date: "Data",
            time: "Hora",
            event: "Evento",
            noEventsInRange: "Não há eventos neste período.",
            showMore: total => `+ Ver mais (${total})`
          }}
          culture='pt-BR'
        />
      </div>
      {selectedTask && (
        <TaskDetailsSheet task={selectedTask}>
          {/* This is a dummy trigger, the sheet is controlled by the state */}
          <div data-state={selectedTask ? 'open' : 'closed'} style={{display: 'none'}} onOpenChange={onSheetOpenChange}></div>
        </TaskDetailsSheet>
      )}
    </>
  );
}

'use client';

import { useStore } from '@/hooks/use-store';
import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { differenceInDays, parseISO, startOfDay } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { TaskDetailsSheet } from '../tasks/task-details-sheet';
import { useState } from 'react';
import type { Task } from '@/lib/types';
import { cn } from '@/lib/utils';

const statusColors: { [key: string]: string } = {
  'A Fazer': 'hsl(var(--chart-2))',
  'Em Andamento': 'hsl(var(--chart-1))',
  'Concluída': 'hsl(var(--chart-4))',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const task = data.originalTask;

    if (!task) return null;

    return (
      <div className="bg-background border p-2 rounded-md shadow-lg text-sm">
        <p className="font-bold">{task.title}</p>
        <p>Status: {task.status}</p>
        <p>Prazo: {new Date(task.dueDate).toLocaleDateString()}</p>
        <p>Projeto: {data.name}</p>
      </div>
    );
  }
  return null;
};


export function GanttChartComponent() {
  const { projects, tasks } = useStore();
  const [selectedTask, setSelectedTask] = useState<Task | undefined>(undefined);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

 const processedData = useMemo(() => {
    if (projects.length === 0 || tasks.length === 0) return [];
    
    // Find the earliest start date across all projects
    const overallStartDate = projects.reduce((earliest, p) => {
      const pDate = parseISO(p.startDate);
      return pDate < earliest ? pDate : earliest;
    }, parseISO(projects[0].startDate));

    // Map tasks to a flat structure for the chart
    return tasks.map(task => {
      const project = projects.find(p => p.id === task.projectId);
      if (!project) return null; // Should not happen if data is consistent

      const taskDate = parseISO(task.dueDate);
      // Offset is the number of days from the overall start date
      const offset = differenceInDays(taskDate, overallStartDate);

      return {
        name: project.name, // Project name for the Y-axis
        offset: offset, // Where the task bar starts
        duration: 1, // All tasks are 1 day long as we only have due dates
        taskName: task.title,
        status: task.status,
        originalTask: task // Attach the full task object
      };
    }).filter(Boolean); // Filter out any nulls

  }, [projects, tasks]);


  const handleBarClick = (data: any) => {
    // `data` here is the payload of the item of data from the clicked bar
    if(data && data.originalTask) {
        setSelectedTask(data.originalTask);
        setIsSheetOpen(true);
    }
  };

  const onSheetOpenChange = (isOpen: boolean) => {
    setIsSheetOpen(isOpen);
    if (!isOpen) {
      setSelectedTask(undefined);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Linha do Tempo dos Projetos</CardTitle>
        </CardHeader>
        <CardContent className="h-[75vh] pr-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={processedData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              barCategoryGap="30%"
              stackOffset="expand"
            >
              <XAxis type="number" dataKey="offset" domain={['dataMin', 'dataMax + 5']} unit="d" />
              <YAxis type="category" dataKey="name" width={150} tick={{ width: 150 }} scale="point" />
              <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(240, 240, 240, 0.5)'}} />
              
              <Bar 
                dataKey="duration" 
                stackId={(d: any) => d.name} // Stack by project name
                layout="vertical"
                onClick={handleBarClick}
                className="cursor-pointer"
              >
                  <LabelList dataKey="taskName" position="insideRight" fill="#fff" fontSize={10} />
                  {processedData.map((entry, entryIndex) => (
                      <Cell 
                        key={`cell-${entryIndex}`} 
                        fill={statusColors[entry.status as keyof typeof statusColors] || '#ccc'}
                      />
                  ))}
              </Bar>

            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      {selectedTask && (
        <TaskDetailsSheet
          task={selectedTask}
          open={isSheetOpen}
          onOpenChange={onSheetOpenChange}
        />
      )}
    </>
  );
}

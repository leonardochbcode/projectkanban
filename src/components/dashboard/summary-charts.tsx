'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStore } from '@/hooks/use-store';
import { Skeleton } from '../ui/skeleton';

export function SummaryCharts() {
  const { projects, tasks, isLoaded } = useStore();

  const projectStatusData = projects.reduce((acc, project) => {
    const status = project.status;
    const existing = acc.find((item) => item.name === status);
    if (existing) {
      existing.total++;
    } else {
      acc.push({ name: status, total: 1 });
    }
    return acc;
  }, [] as { name: string; total: number }[]);

  const taskPriorityData = tasks.reduce((acc, task) => {
    const priority = task.priority;
    const existing = acc.find((item) => item.name === priority);
    if (existing) {
      existing.value++;
    } else {
      acc.push({ name: priority, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const COLORS = {
    Alta: 'hsl(var(--destructive))',
    Média: 'hsl(var(--chart-2))',
    Baixa: 'hsl(var(--chart-3))',
  };

  if (!isLoaded) {
    return (
        <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-[350px]"/>
            <Skeleton className="h-[350px]"/>
        </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Projetos por Status</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectStatusData}>
              <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))'
                }}
              />
              <Bar dataKey="total" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Tarefas por Prioridade</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskPriorityData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                nameKey="name"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {taskPriorityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                ))}
              </Pie>
               <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  borderColor: 'hsl(var(--border))'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

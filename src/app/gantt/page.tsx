'use client';
import { AppLayout } from '@/components/layout/app-layout';
import { GanttChartComponent } from '@/components/gantt/gantt-chart-component';

function GanttPageContent() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6 h-full flex flex-col">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Gráfico de Gantt</h1>
      </div>
      <div className="flex-1 h-full">
         <GanttChartComponent />
      </div>
    </div>
  );
}

export default function GanttPage() {
    return (
        <AppLayout>
            <GanttPageContent />
        </AppLayout>
    )
}

'use client';
import { AppLayout } from '@/components/layout/app-layout';
import { ScheduleView } from '@/components/schedule/schedule-view';

function SchedulePageContent() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6 h-full flex flex-col">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Agenda da Equipe</h1>
      </div>
      <div className="flex-1 h-full">
         <ScheduleView />
      </div>
    </div>
  );
}

export default function SchedulePage() {
    return (
        <AppLayout>
            <SchedulePageContent />
        </AppLayout>
    )
}

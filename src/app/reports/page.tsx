'use client';
import { AppLayout } from '@/components/layout/app-layout';

function ReportsPageContent() {
  return (
    <div className="flex-1 space-y-4 p-4 sm:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h1 className="text-3xl font-bold tracking-tight font-headline">Relatórios</h1>
      </div>
      <p>Em breve, novos relatórios estarão disponíveis aqui.</p>
    </div>
  );
}

export default function ReportsPage() {
    return (
        <AppLayout>
            <ReportsPageContent />
        </AppLayout>
    )
}

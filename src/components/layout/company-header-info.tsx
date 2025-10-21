'use client';
import { useStore } from '@/hooks/use-store';
import { Skeleton } from '../ui/skeleton';

export function CompanyHeaderInfo() {
  const { companyInfo, currentUser, isLoaded } = useStore();

  if (!isLoaded || !currentUser || !companyInfo) {
    return (
      <div className="flex-1 text-sm text-foreground">
        <Skeleton className="h-5 w-64 mb-1.5" />
        <Skeleton className="h-4 w-80 mb-1.5" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  const userName = currentUser.name.split(' ')[0].toUpperCase();

  return (
    <div className="flex-1 text-sm text-foreground">
      <p className="font-semibold text-base">{companyInfo.suportewebCode} - {companyInfo.name}</p>
      <p className="text-xs text-muted-foreground">
        {userName} | {companyInfo.name} | {companyInfo.cnpj}
      </p>
      <p className="text-xs text-muted-foreground mt-1">
        Recentes: Início
      </p>
    </div>
  );
}

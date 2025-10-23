'use client';
import { useStore } from '@/hooks/use-store';
import { Skeleton } from '../ui/skeleton';

export function CompanyHeaderInfo() {
  const { companyInfo, currentUser, isLoaded } = useStore();

  if (!isLoaded || !currentUser || !companyInfo) {
    return (
      <div className="flex-1 text-xs text-[var(--header-foreground)]">
        <Skeleton className="h-5 w-64 mb-1.5" />
        <Skeleton className="h-4 w-80 mb-1.5" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  const userName = currentUser.name.split(' ')[0].toUpperCase();

  return (
    <div className="flex-1 text-xs text-[var(--header-foreground)]">
      <p className="font-semibold text-[0.9em]">{companyInfo.suportewebCode} - {companyInfo.name}</p>
      <p className="text-[0.8em] text-[var(--header-foreground)]">
        {userName} | {companyInfo.name} | {companyInfo.cnpj}
      </p>
    </div>
  );
}

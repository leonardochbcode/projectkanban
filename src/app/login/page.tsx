import { Suspense } from 'react';
import LoginPageClient from './login-page-client';
import { Skeleton } from '@/components/ui/skeleton';

// A simple skeleton loader for the login page
function LoginPageSkeleton() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="w-full max-w-sm p-8 space-y-6">
        <div className="space-y-2 text-center">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-full mx-auto" />
        </div>
        <div className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-10 w-full" />
            </div>
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
                <Skeleton className="h-px w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    Ou continue com
                </span>
            </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageSkeleton />}>
      <LoginPageClient />
    </Suspense>
  );
}

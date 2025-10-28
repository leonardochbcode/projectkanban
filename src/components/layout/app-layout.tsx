'use client';

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  LineChart,
  Settings,
  Menu,
  Briefcase,
  LogOut,
  ClipboardList,
  Folder,
  Calendar,
  Lightbulb,
  BarChartHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { UserNav } from '@/components/user-nav';
import { useStore } from '@/hooks/use-store';
import { useEffect } from 'react';
import type { Permission } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { CompanyHeaderInfo } from './company-header-info';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import { useSession } from 'next-auth/react';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status } = useSession();
  const { isLoaded, currentUser, getRole, companyInfo, workspaces } = useStore();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Show a loading skeleton while the session is loading or the store data is not yet ready.
  // We also wait for currentUser to be populated to prevent a flash of the loading screen
  // between the session being ready and the user object being found in the store.
  if (status === 'loading' || !isLoaded || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="p-4 space-y-4 text-center">
          <div className="flex justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-12 w-12 fill-current animate-pulse">
              <path d="M228.4,89.35l-96-64a8,8,0,0,0-8.8,0l-96,64A8,8,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A8,8,0,0,0,228.4,89.35ZM128,42.22,203.1,88,128,133.78,52.9,88ZM40,107.51l88,58.67,88-58.67V200H40Z" />
            </svg>
          </div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const userRole = currentUser ? getRole(currentUser.roleId) : null;
  const userPermissions = userRole?.permissions || [];

  const hasPermission = (permission: Permission) => userPermissions.includes(permission);

  const mainNavItems = [
    { href: '/', label: 'Painel', icon: LayoutDashboard, permission: 'view_dashboard' as Permission },
    { href: '/my-tasks', label: 'Minhas Tarefas', icon: ClipboardList, permission: 'view_dashboard' as Permission },
    // { href: '/schedule', label: 'Agenda(Em Construção)', icon: Calendar, permission: 'view_dashboard' as Permission },
    { href: '/projects', label: 'Projetos', icon: FolderKanban, permission: 'manage_projects' as Permission },
    { href: '/gantt', label: 'Gráfico Gantt', icon: BarChartHorizontal, permission: 'view_dashboard' as Permission },
    // { href: '/opportunities', label: 'Oportunidades', icon: Lightbulb, permission: 'manage_opportunities' as Permission },
    { href: '/clients', label: 'Clientes', icon: Briefcase, permission: 'manage_clients' as Permission },
    { href: '/team', label: 'Equipe', icon: Users, permission: 'manage_team' as Permission },
    // { href: '/reports', label: 'Relatórios', icon: LineChart, permission: 'view_reports' as Permission },
    { href: '/settings', label: 'Configurações', icon: Settings, permission: 'manage_settings' as Permission },
  ];

  const accessibleMainNavItems = mainNavItems.filter(item => hasPermission(item.permission));
  const canManageWorkspaces = hasPermission('manage_workspaces');
  const isGuest = currentUser?.userType === 'Convidado';

  const NavLinks = () => (
    <nav className="grid items-start gap-1 px-4 py-8 text-xs font-medium lg:px-1 fixed max-w-[16em]">
      {accessibleMainNavItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-8 py-3 text-[var(--header-foreground)] transition-all hover:text-[var(--header-foreground)]/80',
            { 'bg-accent text-accent-foreground': pathname.startsWith(href) && href !== '/' },
            { 'bg-accent text-accent-foreground': pathname === '/' && href === '/' },
            { 'bg-accent text-accent-foreground': pathname.startsWith('/opportunities') && href.startsWith('/opportunities') },
            { 'bg-accent text-accent-foreground': pathname.startsWith('/my-tasks') && href.startsWith('/my-tasks') },
          )}
        >
          <Icon className="h-5 w-3" />
          {label}
        </Link>
      ))}

      {(canManageWorkspaces || isGuest) && (
        <Link
          href="/workspaces"
          className={cn(
            'flex items-center gap-3 rounded-lg px-8 py-3 text-[var(--header-foreground)] transition-all hover:text-[var(--header-foreground)]/80',
            { 'bg-accent text-accent-foreground': pathname.startsWith('/workspaces') },
          )}
        >
          <Folder className="h-5 w-3" />
          Espaços de Trabalho
        </Link>
      )}
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr] bg-sky-50">
      <div className="hidden bg-[var(--header-background)] md:block w-[15em]">
        <div className="flex h-full max-h-screen flex-col gap-2 fixed">
          <div className="flex h-10">
            <Link href="/" className="sticky top-0 w-[300px] flex items-center gap-2 font-semibold font-headline text-[var(--header-foreground)] bg-[var(--header-background)]">
              {companyInfo?.logoUrl ? (
                <Image src={companyInfo.logoUrl} alt="Company Logo" width={400} height={300} className='-mx-9 mt-8' />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 fill-current">
                  <path d="M228.4,89.35l-96-64a8,8,0,0,0-8.8,0l-96,64A8,8,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A8,8,0,0,0,228.4,89.35ZM128,42.22,203.1,88,128,133.78,52.9,88ZM40,107.51l88,58.67,88-58.67V200H40Z" />
                </svg>
              )}
            </Link>
          </div>
          <div className="flex-1 overflow-y-auto">
            <NavLinks />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="sticky top-0 z-10 flex h-auto items-center gap-4 bg-[var(--header-background)] px-4 py-1 lg:h-auto lg:px-6 ">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Alternar menu de navegação</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-[var(--header-background)] text-[var(--header-foreground)] p-0">
              <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold font-headline text-[var(--header-foreground)]">
                  {companyInfo?.logoUrl ? (
                    <Image src={companyInfo.logoUrl} alt="Company Logo" width={200} height={200} className="w-60 h-60" />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 fill-current">
                      <path d="M228.4,89.35l-96-64a8,8,0,0,0-8.8,0l-96,64A8,8,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A8,8,0,0,0,228.4,89.35ZM128,42.22,203.1,88,128,133.78,52.9,88ZM40,107.51l88,58.67,88-58.67V200H40Z" />
                    </svg>
                  )}
                </Link>
              </div>
              <div className="overflow-y-auto">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <CompanyHeaderInfo />
          </div>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4max-w-[95.6em] p-2 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
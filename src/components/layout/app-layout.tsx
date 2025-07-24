'use client';

import {
  LayoutDashboard,
  FolderKanban,
  Users,
  LineChart,
  Settings,
  Menu,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNav } from '@/components/user-nav';

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Painel', icon: LayoutDashboard },
    { href: '/projects', label: 'Projetos', icon: FolderKanban },
    { href: '/team', label: 'Equipe', icon: Users },
    { href: '/reports', label: 'Relatórios', icon: LineChart },
    { href: '/settings', label: 'Configurações', icon: Settings },
  ];

  const NavLinks = () => (
    <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
            { 'bg-muted text-primary': pathname === href }
          )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Link>
      ))}
    </nav>
  );
  
  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 fill-primary">
                <path d="M228.4,89.35l-96-64a8,8,0,0,0-8.8,0l-96,64A8,8,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A8,8,0,0,0,228.4,89.35ZM128,42.22,203.1,88,128,133.78,52.9,88ZM40,107.51l88,58.67,88-58.67V200H40Z"/>
              </svg>
              <span className="">VisioTask</span>
            </Link>
          </div>
          <div className="flex-1">
            <NavLinks />
          </div>
          <div className="mt-auto p-4">
             {/* O link de configurações foi movido para a navegação principal */}
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Alternar menu de navegação</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
               <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold font-headline">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 fill-primary">
                            <path d="M228.4,89.35l-96-64a8,8,0,0,0-8.8,0l-96,64A8,8,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A8,8,0,0,0,228.4,89.35ZM128,42.22,203.1,88,128,133.78,52.9,88ZM40,107.51l88,58.67,88-58.67V200H40Z"/>
                        </svg>
                        <span className="">VisioTask</span>
                    </Link>
                </div>
              <NavLinks />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Can add search here */}
          </div>
          <ThemeToggle />
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 bg-background">
            {children}
        </main>
      </div>
    </div>
  );
}

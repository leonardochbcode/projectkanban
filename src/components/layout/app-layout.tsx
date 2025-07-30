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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNav } from '@/components/user-nav';
import { useStore } from '@/hooks/use-store';
import { useEffect } from 'react';
import type { Permission, ThemeColors } from '@/lib/types';
import { Skeleton } from '../ui/skeleton';
import { CompanyHeaderInfo } from './company-header-info';
import Image from 'next/image';

const hexToHslString = (hex: string) => {
    if (!hex) return '';
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
};

const applyColors = (colors: ThemeColors) => {
    let styleString = '';
    if (colors.light) {
        styleString += ':root, .light {';
        for (const [key, value] of Object.entries(colors.light)) {
            styleString += `--${key}: ${hexToHslString(value)};\n`;
        }
        styleString += '}\n';
    }
    if (colors.dark) {
        styleString += '.dark {';
        for (const [key, value] of Object.entries(colors.dark)) {
            styleString += `--${key}: ${hexToHslString(value)};\n`;
        }
        styleString += '}';
    }
    const styleElement = document.getElementById('custom-theme-styles');
    if (styleElement) {
        styleElement.innerHTML = styleString;
    }
};


export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoaded, currentUser, getRole, logout, themeColors, companyInfo } = useStore();

  useEffect(() => {
    if (isLoaded && !currentUser) {
      router.push('/login');
    }
  }, [isLoaded, currentUser, router]);

  useEffect(() => {
    if (themeColors) {
      applyColors(themeColors);
    }
  }, [themeColors]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };
  
  if (!isLoaded || !currentUser) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="p-4 space-y-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    );
  }

  const userRole = currentUser ? getRole(currentUser.roleId) : null;
  const userPermissions = userRole?.permissions || [];

  const hasPermission = (permission: Permission) => userPermissions.includes(permission);

  const navItems = [
    { href: '/', label: 'Painel', icon: LayoutDashboard, permission: 'view_dashboard' as Permission },
    { href: '/projects', label: 'Projetos', icon: FolderKanban, permission: 'manage_projects' as Permission },
    { href: '/leads', label: 'Leads', icon: ClipboardList, permission: 'manage_leads' as Permission },
    { href: '/clients', label: 'Clientes', icon: Briefcase, permission: 'manage_clients' as Permission },
    { href: '/team', label: 'Equipe', icon: Users, permission: 'manage_team' as Permission },
    { href: '/reports', label: 'Relatórios', icon: LineChart, permission: 'view_reports' as Permission },
    { href: '/settings', label: 'Configurações', icon: Settings, permission: 'manage_settings' as Permission },
  ];

  const accessibleNavItems = navItems.filter(item => hasPermission(item.permission));

  const NavLinks = () => (
    <nav className="grid items-start gap-2 px-2 text-sm font-medium lg:px-4">
      {accessibleNavItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={label}
          href={href}
          className={cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-menu-foreground transition-all hover:bg-primary/20 hover:text-primary-foreground',
            { 'bg-primary text-primary-foreground': pathname === href }
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
      <div className="hidden border-r bg-muted md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/" className="flex items-center gap-2 font-semibold font-headline text-primary-foreground">
              {companyInfo?.logoUrl ? (
                <Image src={companyInfo.logoUrl} alt="Company Logo" width={24} height={24} className="h-6 w-6" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 fill-current">
                  <path d="M228.4,89.35l-96-64a8,8,0,0,0-8.8,0l-96,64A8,8,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A8,8,0,0,0,228.4,89.35ZM128,42.22,203.1,88,128,133.78,52.9,88ZM40,107.51l88,58.67,88-58.67V200H40Z"/>
                </svg>
              )}
              <span className="">CHBProject</span>
            </Link>
          </div>
          <div className="flex-1">
            <NavLinks />
          </div>
          <div className="mt-auto p-4">
             <Button variant="ghost" className="w-full justify-start text-menu-foreground hover:bg-primary/20 hover:text-primary-foreground" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
             </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-auto items-center gap-4 border-b bg-muted/40 px-4 lg:h-auto lg:px-6 py-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Alternar menu de navegação</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col bg-muted text-menu-foreground p-0">
               <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/" className="flex items-center gap-2 font-semibold font-headline text-primary-foreground">
                        {companyInfo?.logoUrl ? (
                          <Image src={companyInfo.logoUrl} alt="Company Logo" width={24} height={24} className="h-6 w-6" />
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="h-6 w-6 fill-current">
                              <path d="M228.4,89.35l-96-64a8,8,0,0,0-8.8,0l-96,64A8,8,0,0,0,24,96V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V96A8,8,0,0,0,228.4,89.35ZM128,42.22,203.1,88,128,133.78,52.9,88ZM40,107.51l88,58.67,88-58.67V200H40Z"/>
                          </svg>
                        )}
                        <span className="">CHBProject</span>
                    </Link>
                </div>
              <NavLinks />
              <div className="mt-auto p-4 border-t">
                <Button variant="ghost" className="w-full justify-start text-menu-foreground hover:bg-primary/20 hover:text-primary-foreground" onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                </Button>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <CompanyHeaderInfo />
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

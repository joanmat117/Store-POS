import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { SidebarNav } from './SidebarNav';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/shared/components/ui/sidebar';

export type NavView = 'till' | 'catalog' | 'sales' | 'customers' | 'team' | 'settings';

type Props = {
  view: NavView;
  onNavigate: (view: NavView) => void;
  title: string;
  stats?: ReactNode;
  children: ReactNode;
  todaySales?: string;
  logo?: string;
};

export default function AppShell({
  view,
  onNavigate,
  title,
  stats,
  children,
  todaySales,
  logo,
}: Props) {
  const { apiInfo } = useAuth();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="group/sidebar-wrapper flex min-h-svh w-full">
        <SidebarNav view={view} onNavigate={onNavigate} logo={logo} />

        <SidebarInset>
          <header className="topbar">
            <SidebarTrigger className="md:hidden" />
            <h1>{title}</h1>
            {stats}
            <div className="spacer" />
            {todaySales != null && <div className="stat-pill">Today {todaySales}</div>}
            <div className="ml-auto flex items-center gap-2 text-xs text-muted">
              <span>Till #{apiInfo?.till || 1}</span>
            </div>
          </header>
          <main className="main">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
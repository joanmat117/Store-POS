import * as React from 'react';
import { useAuth } from '../context/AuthContext';
import { getPosBridge } from '../../bridge';
import { getUploadsBase } from '../api/client';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/shared/components/ui/sidebar';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Power,
  CreditCard,
  Receipt,
  Box,
  Users2,
  Shield,
} from 'lucide-react';

type NavView = 'till' | 'catalog' | 'sales' | 'customers' | 'team' | 'settings';

interface SidebarNavProps {
  view: NavView;
  onNavigate: (view: NavView) => void;
  logo?: string;
}

const NAV_ITEMS: {
  id: NavView;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  perm?: 'perm_products' | 'perm_categories' | 'perm_transactions' | 'perm_users' | 'perm_settings';
}[] = [
  { id: 'till', label: 'Till', icon: CreditCard },
  { id: 'catalog', label: 'Catalog', icon: Box, perm: 'perm_products' },
  { id: 'sales', label: 'Sales', icon: Receipt, perm: 'perm_transactions' },
  { id: 'customers', label: 'Customers', icon: Users },
  { id: 'team', label: 'Team', icon: Users2, perm: 'perm_users' },
  { id: 'settings', label: 'Settings', icon: Settings, perm: 'perm_settings' },
];

export function SidebarNav({ view, onNavigate, logo }: SidebarNavProps) {
  const { user, logout, hasPerm, apiInfo } = useAuth();
  const { state, openMobile, setOpenMobile, isMobile } = useSidebar();
  const logoSrc = logo ? `${getUploadsBase()}/${logo}` : '';

  const filteredItems = NAV_ITEMS.filter((item) => {
    if (!item.perm) return true;
    return hasPerm(item.perm);
  });

  return (
    <>
      <Sidebar side="left" variant="sidebar" collapsible="offcanvas">
        <SidebarHeader>
          <div className="flex items-center gap-3 px-2 py-3">
            {logoSrc ? (
              <img
                className="h-10 w-10 rounded-lg object-cover border border-sidebar-border"
                src={logoSrc}
                alt=""
              />
            ) : (
              <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-sidebar-accent">
                <LayoutDashboard className="h-5 w-5 text-sidebar-accent-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <strong className="truncate block text-sidebar-foreground">
                Store POS
              </strong>
              <span className="text-xs text-sidebar-foreground/70 truncate block">
                {apiInfo?.mode?.replace(' Point of Sale', '') || 'Standalone'}
              </span>
            </div>
          </div>
          <SidebarSeparator />
        </SidebarHeader>

        <SidebarContent>
<SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={view === item.id}
                    tooltip={state === 'collapsed' ? item.label : undefined}
                    onClick={() => {
                      onNavigate(item.id);
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    <item.icon className="h-4 w-4" aria-hidden="true" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
        </SidebarContent>

        <SidebarFooter>
          <SidebarSeparator />
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={state === 'collapsed' ? 'Sign out' : undefined}
                onClick={() => {
                  logout();
                  if (isMobile) setOpenMobile(false);
                }}
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span>Sign out</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip={state === 'collapsed' ? 'Quit' : undefined}
                onClick={() => {
                  getPosBridge().quit();
                }}
              >
                <Power className="h-4 w-4" aria-hidden="true" />
                <span>Quit</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="px-2 py-2 border-t border-sidebar-border">
            <div className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.fullname}
            </div>
            <div className="text-xs text-sidebar-foreground/70">
              Till #{apiInfo?.till || 1}
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>

      {isMobile && (
        <SidebarTrigger
          className="fixed bottom-4 right-4 z-50 md:hidden"
          aria-label="Toggle sidebar"
        />
      )}
    </>
  );
}
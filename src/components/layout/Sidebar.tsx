import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FolderOpen,
  MessageSquare,
  FileText,
  Calendar,
  Settings,
  Bot,
  Upload,
  BarChart3,
  Scale,
  ChevronLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: Users,
    description: 'Manage Clients'
  },
  {
    title: 'AI Intake',
    href: '/ai-intake',
    icon: Bot,
    description: 'Smart Client Intake'
  },
  {
    title: 'Cases',
    href: '/cases',
    icon: FolderOpen,
    description: 'Case Management'
  },
  {
    title: 'Documents',
    href: '/ai-documents',
    icon: Upload,
    description: 'AI Document Analysis'
  },
  {
    title: 'Forms',
    href: '/ai-forms',
    icon: FileText,
    description: 'Legal Form Generator'
  },
  {
    title: 'Calendar',
    href: '/calendar',
    icon: Calendar,
    description: 'Schedule & Deadlines'
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
    description: 'Analytics & Reports'
  },
];

const bottomItems = [
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
    description: 'App Settings'
  },
];

import { useAuth } from '@/context/AuthContext';

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const isActiveRoute = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  const getInitials = (firstName = '', lastName = '') => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-full w-72 transform bg-card border-r transition-transform duration-300 ease-in-out',
          'md:relative md:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
       

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            <div className="space-y-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-muted',
                    isActiveRoute(item.href)
                      ? 'bg-primary/10 text-primary border-r-2 border-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => window.innerWidth < 768 && onClose()}
                >
                  <item.icon className="h-5 w-5" />
                  <div className="flex flex-col">
                    <span>{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </NavLink>
              ))}
            </div>
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t space-y-2">
            {bottomItems.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all hover:bg-muted',
                  isActiveRoute(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                onClick={() => window.innerWidth < 768 && onClose()}
              >
                <item.icon className="h-5 w-5" />
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  <span className="text-xs text-muted-foreground">{item.description}</span>
                </div>
              </NavLink>
            ))}

            {/* User Info */}
            <div className="mt-6 p-3 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {user ? getInitials(user.profile.firstName, user.profile.lastName) : ''}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user ? `${user.profile.firstName} ${user.profile.lastName}` : 'Loading...'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">{user ? user.role : ''}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
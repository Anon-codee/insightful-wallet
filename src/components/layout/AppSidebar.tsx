import { NavLink } from '@/components/NavLink';
import { useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  ArrowLeftRight,
  BarChart3,
  Settings,
  Vault,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFinance } from '@/contexts/FinanceContext';

const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Add Income', url: '/add-income', icon: TrendingUp },
  { title: 'Add Expense', url: '/add-expense', icon: TrendingDown },
  { title: 'Transactions', url: '/transactions', icon: ArrowLeftRight },
  { title: 'Reports', url: '/reports', icon: BarChart3 },
  { title: 'Savings Vault', url: '/vault', icon: Vault },
  { title: 'Settings', url: '/settings', icon: Settings },
];

interface AppSidebarProps {
  open: boolean;
  onClose: () => void;
}

export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const location = useLocation();
  const { auth, signOut } = useFinance();

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-sidebar-accent-foreground">
              Fin<span className="text-primary">Track</span>
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-sidebar-foreground hover:text-sidebar-accent-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
          {navItems.map(item => {
            const isActive = location.pathname === item.url;
            return (
              <NavLink
                key={item.url}
                to={item.url}
                end
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                )}
                activeClassName="bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                onClick={onClose}
              >
                <item.icon className={cn('h-4 w-4', isActive && 'text-primary')} />
                <span>{item.title}</span>
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4 space-y-3">
          {/* User email */}
          {auth.email && (
            <p className="text-xs text-sidebar-foreground/70 truncate px-1">
              {auth.email}
            </p>
          )}
          {/* Logout button */}
          <button
            onClick={signOut}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
          <p className="text-xs text-sidebar-foreground/30 px-1">
            FinTrack v1.0 — Smart Finance
          </p>
        </div>
      </aside>
    </>
  );
}
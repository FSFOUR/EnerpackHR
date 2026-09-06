import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Clock, 
  CheckSquare, 
  Menu,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '../../lib/utils';

export interface MobileNavigationProps {
  onMoreClick?: () => void;
  isMoreOpen?: boolean;
  tasksCount?: number;
  className?: string;
}

export interface MobileNavItem {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  badge?: number;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  onMoreClick,
  isMoreOpen = false,
  tasksCount,
  className,
}) => {
  const location = useLocation();

  const primaryNavItems: MobileNavItem[] = [
    { name: 'Home', label: 'Home', icon: Home, path: '/' },
    { name: 'Employees', label: 'Employees', icon: Users, path: '/employees' },
    { name: 'Attendance', label: 'Attendance', icon: Clock, path: '/attendance' },
    { name: 'Tasks', label: 'Tasks', icon: CheckSquare, path: '/tasks', badge: tasksCount },
  ];

  // Secondary module prefixes accessed via the 'More' trigger
  const secondaryModulePrefixes = [
    '/fleet',
    '/recruitment',
    '/onboarding',
    '/documents',
    '/contracts',
    '/policies',
    '/leave',
    '/payroll',
    '/expenses',
    '/performance',
    '/training',
    '/assets',
    '/reports',
    '/settings',
    '/users',
  ];

  const isCurrentInSecondaryModule = secondaryModulePrefixes.some(prefix => 
    location.pathname.startsWith(prefix)
  );

  return (
    <nav
      id="mobile-bottom-navigation"
      aria-label="Mobile Bottom Navigation"
      style={{
        paddingBottom: 'calc(0.5rem + env(safe-area-inset-bottom, 0px))',
      }}
      className={cn(
        // Mobile fixed bottom navigation bar: display none on desktop (hidden-md / md:hidden)
        "fixed bottom-0 left-0 right-0 z-40 md:hidden hidden-md",
        "bg-white/95 backdrop-blur-md border-t border-slate-200/90",
        "px-2 pt-1.5 flex items-center justify-around",
        "shadow-[0_-4px_16px_rgba(0,0,0,0.06)] select-none safe-area-inset-bottom",
        "transition-transform duration-200",
        className
      )}
    >
      {primaryNavItems.map((item) => {
        const isActive = item.path === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(item.path);

        const Icon = item.icon;

        return (
          <NavLink
            key={item.name}
            to={item.path}
            aria-current={isActive ? 'page' : undefined}
            title={item.name === 'Home' ? 'Home (Dashboard)' : item.label}
            className={cn(
              "relative flex flex-col items-center justify-center",
              "py-1 px-2 rounded-xl transition-all duration-150",
              "min-w-[56px] min-h-[48px] text-center",
              "active:scale-95 active:bg-slate-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              isActive
                ? "text-blue-600 font-bold"
                : "text-slate-500 hover:text-slate-800"
            )}
          >
            {/* Active top indicator pill */}
            {isActive && (
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-7 h-1 bg-blue-600 rounded-full shadow-xs animate-in fade-in zoom-in-75 duration-200" />
            )}

            {/* Icon Container with optional Notification / Task Badge */}
            <div className="relative flex items-center justify-center">
              <Icon 
                className={cn(
                  "w-5 h-5 transition-transform duration-150",
                  isActive ? "scale-110 stroke-[2.4] text-blue-600" : "stroke-[1.8]"
                )} 
              />
              {typeof item.badge === 'number' && item.badge > 0 && (
                <span className="absolute -top-1 -right-2 px-1.2 py-0.2 min-w-[15px] h-[15px] bg-rose-500 text-white text-[9px] font-bold font-mono rounded-full flex items-center justify-center leading-none shadow-xs">
                  {item.badge > 9 ? '9+' : item.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className={cn(
                "text-[10px] tracking-tight mt-0.5 leading-tight truncate max-w-[62px]",
                isActive ? "font-bold text-blue-600" : "font-medium text-slate-500"
              )}
            >
              {item.label}
            </span>
          </NavLink>
        );
      })}

      {/* 'More' Trigger Button for secondary modules */}
      <button
        type="button"
        id="mobile-nav-more-trigger"
        onClick={onMoreClick}
        aria-label="Open More Modules and Operations Menu"
        aria-expanded={isMoreOpen}
        title="More Modules"
        className={cn(
          "relative flex flex-col items-center justify-center",
          "py-1 px-2 rounded-xl transition-all duration-150 cursor-pointer",
          "min-w-[56px] min-h-[48px] text-center",
          "active:scale-95 active:bg-slate-100/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
          isMoreOpen || isCurrentInSecondaryModule
            ? "text-blue-600 font-bold"
            : "text-slate-500 hover:text-slate-800"
        )}
      >
        {/* Active top indicator pill if currently in a secondary module or drawer is open */}
        {(isMoreOpen || isCurrentInSecondaryModule) && (
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-7 h-1 bg-blue-600 rounded-full shadow-xs animate-in fade-in zoom-in-75 duration-200" />
        )}

        {/* Icon with active secondary module dot */}
        <div className="relative flex items-center justify-center">
          <Menu 
            className={cn(
              "w-5 h-5 transition-transform duration-150",
              (isMoreOpen || isCurrentInSecondaryModule) ? "scale-110 stroke-[2.4] text-blue-600" : "stroke-[1.8]"
            )} 
          />
          {isCurrentInSecondaryModule && !isMoreOpen && (
            <span 
              title="Active secondary module"
              className="absolute -top-0.5 -right-1 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white animate-pulse" 
            />
          )}
        </div>

        {/* Label */}
        <span
          className={cn(
            "text-[10px] tracking-tight mt-0.5 leading-tight truncate max-w-[62px]",
            isMoreOpen || isCurrentInSecondaryModule ? "font-bold text-blue-600" : "font-medium text-slate-500"
          )}
        >
          More
        </span>
      </button>
    </nav>
  );
};

export default MobileNavigation;

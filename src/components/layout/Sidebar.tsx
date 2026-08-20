import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, ClipboardCheck, 
  Calendar, Clock, DollarSign, Receipt, FileText, 
  Briefcase, ShieldCheck, Target, GraduationCap, 
  Laptop, BarChart3, Settings, X, LogOut
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAuth } from '../../context/AuthContext';

const navGroups = [
  {
    title: 'Core',
    items: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
      { name: 'Employees', icon: Users, path: '/employees' },
      { name: 'Attendance', icon: Clock, path: '/attendance' },
      { name: 'Leave', icon: Calendar, path: '/leave' },
    ]
  },
  {
    title: 'Operations',
    items: [
      { name: 'Recruitment', icon: UserPlus, path: '/recruitment' },
      { name: 'Onboarding', icon: ClipboardCheck, path: '/onboarding' },
      { name: 'Payroll', icon: DollarSign, path: '/payroll' },
      { name: 'Expenses', icon: Receipt, path: '/expenses' },
      { name: 'Documents', icon: FileText, path: '/documents' },
      { name: 'Contracts', icon: Briefcase, path: '/contracts' },
      { name: 'Policies', icon: ShieldCheck, path: '/policies' },
      { name: 'Performance', icon: Target, path: '/performance' },
      { name: 'Training', icon: GraduationCap, path: '/training' },
      { name: 'Assets', icon: Laptop, path: '/assets' },
      { name: 'Reports', icon: BarChart3, path: '/reports' },
    ]
  },
  {
    title: 'System',
    items: [
      { name: 'Settings', icon: Settings, path: '/settings' },
    ]
  }
];

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const { userData, logout } = useAuth();
  const location = useLocation();

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-xs shadow-blue-200">
            E
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 block leading-tight">
              Enerpack <span className="text-blue-600">HR</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Enterprise Suite
            </span>
          </div>
        </div>

        {/* Mobile Close Button */}
        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            aria-label="Close navigation drawer"
            className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* Navigation list */}
      <div className="flex-1 py-3 overflow-y-auto custom-scrollbar px-3">
        <nav className="space-y-4">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {group.title}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => {
                        if (onCloseMobile) onCloseMobile();
                      }}
                      className={cn(
                        "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-all min-h-[44px] font-medium",
                        isActive 
                          ? "bg-blue-50 text-blue-700 font-semibold shadow-2xs" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100"
                      )}
                    >
                      <item.icon className={cn("w-4 h-4 shrink-0", isActive ? "text-blue-600" : "text-slate-400")} />
                      <span className="truncate">{item.name}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>
      
      {/* Footer Profile & Logout */}
      <div className="p-3 border-t border-slate-100 shrink-0 bg-slate-50/50">
        <div className="bg-white rounded-xl p-2.5 border border-slate-200/80 shadow-2xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 font-bold shrink-0 text-sm">
              {userData?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate leading-tight">{userData?.name || 'User'}</p>
              <p className="text-[10px] text-slate-500 truncate">{userData?.role || 'Staff'}</p>
            </div>
          </div>

          <button
            onClick={() => logout && logout()}
            title="Sign out"
            aria-label="Sign out"
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (visible on lg screens) */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 flex-col h-screen sticky top-0 shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onCloseMobile}
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

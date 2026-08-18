import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, UserPlus, ClipboardCheck, 
  Calendar, Clock, DollarSign, Receipt, FileText, 
  Briefcase, ShieldCheck, Target, GraduationCap, 
  Laptop, BarChart3, Settings
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

export const Sidebar: React.FC = () => {
  const { userData } = useAuth();
  
  return (
    <aside className="w-64 bg-white border-r border-[#E2E8F0] flex flex-col h-screen sticky top-0 shrink-0">
      <div className="p-6 flex items-center gap-3 border-b border-[#F1F5F9]">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">E</div>
        <span className="font-bold text-xl tracking-tight text-slate-900">Enerpack <span className="text-blue-600">HR</span></span>
      </div>
      
      <div className="flex-1 py-4 overflow-y-auto custom-scrollbar">
        <nav>
          {navGroups.map((group, idx) => (
            <div key={idx} className="mb-4">
              <div className="px-6 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {group.title}
              </div>
              <div className="space-y-1 px-3">
                {group.items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                      isActive 
                        ? "bg-blue-50 text-blue-700 font-medium" 
                        : "text-slate-600 hover:bg-slate-50 font-medium"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-lg p-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold">
            {userData?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-slate-900 truncate">{userData?.name || 'User'}</p>
            <p className="text-[10px] text-slate-500 truncate">{userData?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

import React from 'react';
import { 
  X, ChevronRight, Users, UserPlus, FileText, Briefcase, 
  ShieldCheck, Calendar, Clock, DollarSign, CarFront, Receipt, 
  CheckSquare, Laptop, Wrench, BarChart3, UserCog, Shield, 
  Settings as SettingsIcon, FileSearch, HelpCircle, PhoneCall,
  LogOut, Building2, ExternalLink
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../../context/AuthContext';
import { cn } from '../../lib/utils';

interface MenuItem {
  title: string;
  desc?: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles?: UserRole[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const MORE_SECTIONS: MenuSection[] = [
  {
    title: 'HR',
    items: [
      { title: 'Employees', desc: 'Workforce records & profiles', path: '/employees', icon: Users, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER', 'PRODUCTION_MANAGER', 'SUPERVISOR'] },
      { title: 'Recruitment', desc: 'Job postings & candidate pipelines', path: '/recruitment', icon: UserPlus, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'] },
      { title: 'Documents', desc: 'Document vault & compliance records', path: '/documents', icon: FileText },
      { title: 'Contracts', desc: 'Employment contract generator', path: '/contracts', icon: Briefcase, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'HR_MANAGER'] },
      { title: 'Policies', desc: 'Corporate policy acknowledgments', path: '/policies', icon: ShieldCheck },
      { title: 'Leave', desc: 'Leave requests & entitlement balances', path: '/leave', icon: Calendar },
      { title: 'Attendance', desc: 'Shift clock-in & yearly heatmap', path: '/attendance', icon: Clock },
      { title: 'Payroll', desc: 'Salary slips & compensation summaries', path: '/payroll', icon: DollarSign, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { title: 'Vehicles', desc: 'Fleet tracker, fuel & trips', path: '/fleet', icon: CarFront },
      { title: 'Expenses', desc: 'Claim submissions & reimbursements', path: '/expenses', icon: Receipt, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'ACCOUNTANT'] },
      { title: 'Tasks', desc: 'Operations & compliance task lists', path: '/tasks', icon: CheckSquare },
      { title: 'Assets', desc: 'Equipment & hardware inventory', path: '/assets', icon: Laptop, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'] },
      { title: 'Maintenance', desc: 'Vehicle & equipment servicing', path: '/fleet/maintenance', icon: Wrench, allowedRoles: ['SUPER_ADMIN', 'ADMIN', 'PRODUCTION_MANAGER'] },
    ]
  },
  {
    title: 'Reports',
    items: [
      { title: 'HR Reports', desc: 'Workforce headcount & demographics', path: '/reports?tab=headcount', icon: BarChart3 },
      { title: 'Attendance Reports', desc: 'Shift punctuality & OT audits', path: '/reports?tab=attendance', icon: Clock },
      { title: 'Expense Reports', desc: 'Departmental spending summaries', path: '/reports?tab=expenses', icon: Receipt },
      { title: 'Vehicle Reports', desc: 'Fleet mileage & fuel analytics', path: '/fleet/reports', icon: CarFront },
      { title: 'Management Reports', desc: 'Executive KPI rollups', path: '/reports?tab=payroll', icon: FileText },
    ]
  },
  {
    title: 'Administration',
    items: [
      { title: 'User Management', desc: 'Staff portal access & roles', path: '/users', icon: UserCog, allowedRoles: ['SUPER_ADMIN', 'ADMIN'] },
      { title: 'Roles & Permissions', desc: 'RBAC security access levels', path: '/users', icon: Shield, allowedRoles: ['SUPER_ADMIN', 'ADMIN'] },
      { title: 'Settings', desc: 'Company parameters & shift times', path: '/settings', icon: SettingsIcon },
      { title: 'Audit Logs', desc: 'System security and compliance log', path: '/settings', icon: FileSearch, allowedRoles: ['SUPER_ADMIN', 'ADMIN'] },
    ]
  },
  {
    title: 'Help',
    items: [
      { title: 'Help Center', desc: 'Documentation & system guides', path: '/settings', icon: HelpCircle },
      { title: 'Contact Administrator', desc: 'Direct support & ticket dispatch', path: '/settings', icon: PhoneCall },
    ]
  }
];

interface MobileMoreDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileMoreDrawer: React.FC<MobileMoreDrawerProps> = ({ isOpen, onClose }) => {
  const { userProfile, logout } = useAuth();
  const currentRole: UserRole = userProfile?.role || 'EMPLOYEE';
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <div className="relative ml-auto w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl z-10 flex flex-col animate-in slide-in-from-right duration-200 safe-area-inset-bottom">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shadow-xs shadow-blue-500/20">
              E
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg text-slate-900 leading-tight">
                  ENERPACK <span className="text-blue-600">HR</span>
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">All Modules & System Functions</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Grouped Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {MORE_SECTIONS.map((section) => {
            const visibleItems = section.items.filter(item => 
              !item.allowedRoles || item.allowedRoles.includes(currentRole)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={section.title} className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                    {section.title}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {visibleItems.length} items
                  </span>
                </div>

                <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl overflow-hidden divide-y divide-slate-100">
                  {visibleItems.map((item) => (
                    <NavLink
                      key={item.title}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) => cn(
                        "flex items-center justify-between p-3.5 transition-colors min-h-[52px] group",
                        isActive ? "bg-blue-50/80 text-blue-700" : "hover:bg-white text-slate-700 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-200/80 text-slate-600 group-hover:text-blue-600 group-hover:border-blue-200 flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                          <item.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-bold block truncate leading-snug">
                            {item.title}
                          </span>
                          {item.desc && (
                            <span className="text-[11px] text-slate-500 block truncate leading-tight mt-0.5">
                              {item.desc}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0 transition-colors" />
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with User info & Sign out */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/60 shrink-0">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {userProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">
                  {userProfile?.displayName || 'User'}
                </p>
                <p className="text-[10px] text-blue-600 font-mono font-semibold truncate">
                  {(userProfile?.role || 'EMPLOYEE').replace('_', ' ')}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                if (logout) logout();
              }}
              title="Sign Out"
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

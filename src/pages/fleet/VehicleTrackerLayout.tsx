import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  CarFront, Users, MapPin, Fuel, Receipt, Wrench, 
  FileText, Activity, AlertOctagon, BarChart3, Settings,
  LayoutDashboard, Plus, ShieldCheck, ChevronDown, UserCircle,
  Clock, Sparkles
} from 'lucide-react';
import { FleetProvider, useFleet } from '../../context/FleetContext';
import { VehicleDetailModal } from '../../components/fleet/VehicleDetailModal';
import { DriverDetailModal } from '../../components/fleet/DriverDetailModal';
import { QuickActionModals } from '../../components/fleet/QuickActionModals';
import { FleetRole } from '../../types/fleet';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/fleet', icon: LayoutDashboard, exact: true },
  { name: 'Vehicles', path: '/fleet/vehicles', icon: CarFront },
  { name: 'Drivers', path: '/fleet/drivers', icon: Users },
  { name: 'Trips', path: '/fleet/trips', icon: MapPin },
  { name: 'Fuel', path: '/fleet/fuel', icon: Fuel },
  { name: 'Expenses', path: '/fleet/expenses', icon: Receipt, badgeKey: 'pendingExpenses' },
  { name: 'Maintenance', path: '/fleet/maintenance', icon: Wrench, badgeKey: 'overdueMaintenance' },
  { name: 'Documents', path: '/fleet/documents', icon: FileText, badgeKey: 'expiringDocs' },
  { name: 'Activities', path: '/fleet/activities', icon: Activity },
  { name: 'Accidents & Incidents', path: '/fleet/incidents', icon: AlertOctagon, badgeKey: 'incidents' },
  { name: 'Reports', path: '/fleet/reports', icon: BarChart3 },
  { name: 'Settings', path: '/fleet/settings', icon: Settings },
];

const FleetTrackerContent: React.FC = () => {
  const location = useLocation();
  const { 
    role, setRole, openQuickModal, 
    expenses, incidents, getOverdueMaintenanceCount, getExpiringDocumentsCount 
  } = useFleet();

  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  const pendingExpensesCount = expenses.filter(e => e.status === 'Pending Approval').length;
  const overdueMaintenanceCount = getOverdueMaintenanceCount();
  const expiringDocsCount = getExpiringDocumentsCount();
  const activeIncidentsCount = incidents.filter(i => i.status !== 'Resolved' && i.status !== 'Closed').length;

  const getBadgeCount = (badgeKey?: string) => {
    if (badgeKey === 'pendingExpenses') return pendingExpensesCount;
    if (badgeKey === 'overdueMaintenance') return overdueMaintenanceCount;
    if (badgeKey === 'expiringDocs') return expiringDocsCount;
    if (badgeKey === 'incidents') return activeIncidentsCount;
    return 0;
  };

  const roles: FleetRole[] = [
    'Super Admin',
    'Fleet/Vehicle Manager',
    'HR/Admin',
    'Accounts',
    'Driver',
    'Management'
  ];

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Banner & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <CarFront className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Enerpack Fleet & Vehicle Tracker</h1>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">Fleet analytics, fuel intelligence, maintenance milestones, trip logs & expense governance</p>
            </div>
          </div>
        </div>

        {/* Role Switcher & Primary Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {/* Active Role Selector */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
            <UserCircle className="w-4 h-4 text-slate-500" />
            <span className="text-xs text-slate-500 font-medium hidden md:inline">Role:</span>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value as FleetRole)}
              className="bg-transparent text-xs font-bold text-slate-900 focus:outline-hidden cursor-pointer"
            >
              {roles.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Quick Actions Dropdown / Direct Buttons */}
          <div className="relative">
            <button
              onClick={() => setQuickMenuOpen(!quickMenuOpen)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Quick Action</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-80" />
            </button>

            {quickMenuOpen && (
              <div 
                className="absolute right-0 mt-1.5 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1.5 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setQuickMenuOpen(false)}
              >
                <div className="py-1">
                  <button 
                    onClick={() => openQuickModal('addFuel')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5"
                  >
                    <Fuel className="w-4 h-4 text-blue-600" />
                    <span>Add Fuel Refill</span>
                  </button>
                  <button 
                    onClick={() => openQuickModal('newTrip')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5"
                  >
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>Create New Trip</span>
                  </button>
                  <button 
                    onClick={() => openQuickModal('addExpense')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5"
                  >
                    <Receipt className="w-4 h-4 text-emerald-600" />
                    <span>Log Vehicle Expense</span>
                  </button>
                </div>
                <div className="py-1">
                  <button 
                    onClick={() => openQuickModal('scheduleService')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5"
                  >
                    <Wrench className="w-4 h-4 text-amber-600" />
                    <span>Record Service / Repair</span>
                  </button>
                  <button 
                    onClick={() => openQuickModal('uploadDocument')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5"
                  >
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Upload Document</span>
                  </button>
                  <button 
                    onClick={() => openQuickModal('inspection')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5"
                  >
                    <ShieldCheck className="w-4 h-4 text-teal-600" />
                    <span>19-Point Inspection</span>
                  </button>
                </div>
                <div className="py-1">
                  <button 
                    onClick={() => openQuickModal('addVehicle')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5"
                  >
                    <CarFront className="w-4 h-4 text-slate-700" />
                    <span>Add New Vehicle</span>
                  </button>
                  <button 
                    onClick={() => openQuickModal('addDriver')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center gap-2.5"
                  >
                    <Users className="w-4 h-4 text-slate-700" />
                    <span>Add New Driver</span>
                  </button>
                  <button 
                    onClick={() => openQuickModal('reportIncident')}
                    className="w-full px-3.5 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2.5"
                  >
                    <AlertOctagon className="w-4 h-4 text-rose-600" />
                    <span>Report Incident / Breakdown</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Secondary Navigation Ribbon */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-x-auto shrink-0">
        <div className="flex px-2 py-1.5 min-w-max gap-1">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
            const count = getBadgeCount(item.badgeKey);
              
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap relative",
                  isActive
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-3.5 h-3.5", isActive ? "text-white" : "text-slate-400")} />
                <span>{item.name}</span>
                {count > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-bold",
                    isActive ? "bg-white text-blue-700" : "bg-amber-100 text-amber-800"
                  )}>
                    {count}
                  </span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Main Outlet Container */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <Outlet />
      </div>

      {/* Global Modals */}
      <VehicleDetailModal />
      <DriverDetailModal />
      <QuickActionModals />
    </div>
  );
};

export const VehicleTrackerLayout: React.FC = () => {
  return (
    <FleetProvider>
      <FleetTrackerContent />
    </FleetProvider>
  );
};

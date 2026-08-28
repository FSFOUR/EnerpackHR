import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  CarFront, Users, MapPin, Fuel, Receipt, Wrench, 
  FileText, Activity, AlertOctagon, BarChart3, Settings,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems = [
  { name: 'Dashboard', path: '/fleet', icon: LayoutDashboard, exact: true },
  { name: 'Vehicles', path: '/fleet/vehicles', icon: CarFront },
  { name: 'Drivers', path: '/fleet/drivers', icon: Users },
  { name: 'Trips', path: '/fleet/trips', icon: MapPin },
  { name: 'Fuel', path: '/fleet/fuel', icon: Fuel },
  { name: 'Expenses', path: '/fleet/expenses', icon: Receipt },
  { name: 'Maintenance', path: '/fleet/maintenance', icon: Wrench },
  { name: 'Documents', path: '/fleet/documents', icon: FileText },
  { name: 'Activities', path: '/fleet/activities', icon: Activity },
  { name: 'Incidents', path: '/fleet/incidents', icon: AlertOctagon },
  { name: 'Reports', path: '/fleet/reports', icon: BarChart3 },
  { name: 'Settings', path: '/fleet/settings', icon: Settings },
];

export const VehicleTrackerLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Vehicle Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Manage company fleet, fuel, expenses, and trips.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-x-auto shrink-0">
        <div className="flex px-2 py-2 min-w-max">
          {navItems.map((item) => {
            const isActive = item.exact 
              ? location.pathname === item.path 
              : location.pathname.startsWith(item.path);
              
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <item.icon className={cn("w-4 h-4", isActive ? "text-blue-600" : "text-slate-400")} />
                {item.name}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <Outlet />
      </div>
    </div>
  );
};

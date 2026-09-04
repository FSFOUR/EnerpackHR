import React, { useState } from 'react';
import { Outlet, Navigate, NavLink, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Clock, Calendar, FileText, Menu, Users, CarFront, Building2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { AccountStatusScreen } from '../auth/AccountStatusScreen';

export const AppLayout: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Requirement 3: Professional loading screen without flashing dashboard
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6 font-sans">
        <div className="flex flex-col items-center gap-4 text-center animate-in fade-in">
          <div className="w-16 h-16 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-500/30">
            <Building2 className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight uppercase">
              ENERPACK
            </h1>
            <p className="text-xs text-slate-400 font-semibold tracking-wider mt-0.5">
              Human Resource Management System
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-slate-300 font-medium">Verifying secure credentials...</span>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated -> Redirect to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Requirement 6 & 7: Check account status (pending approval or suspended)
  if (userProfile && userProfile.status !== 'active') {
    return <AccountStatusScreen status={userProfile.status} />;
  }

  // If driver tries to access non-fleet route, redirect to fleet
  if (userProfile?.role === 'DRIVER' && !location.pathname.startsWith('/fleet')) {
    return <Navigate to="/fleet" replace />;
  }

  const bottomNavItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Attendance', icon: Clock, path: '/attendance' },
    { name: 'Leave', icon: Calendar, path: '/leave' },
    { name: 'Fleet', icon: CarFront, path: '/fleet' },
    { name: 'Employees', icon: Users, path: '/employees' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar (Desktop + Mobile Drawer) */}
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onCloseMobile={() => setMobileMenuOpen(false)} 
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        
        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-5 lg:p-8 pb-24 lg:pb-8 custom-scrollbar focus:outline-none">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar (visible only on mobile devices) */}
        <nav 
          aria-label="Mobile Navigation"
          className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 flex items-center justify-around shadow-lg safe-area-inset-bottom"
        >
          {bottomNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={cn(
                  "flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-w-[56px] min-h-[48px] text-center",
                  isActive
                    ? "text-blue-600 font-bold"
                    : "text-slate-500 hover:text-slate-800"
                )}
              >
                <item.icon className={cn("w-5 h-5 mb-0.5 transition-transform", isActive && "scale-110 text-blue-600")} />
                <span className="text-[10px] font-medium leading-none truncate max-w-[56px]">
                  {item.name}
                </span>
              </NavLink>
            );
          })}

          {/* More Menu Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="All Navigation Items"
            className={cn(
              "flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-w-[56px] min-h-[48px] text-center",
              mobileMenuOpen ? "text-blue-600 font-bold" : "text-slate-500 hover:text-slate-800"
            )}
          >
            <Menu className="w-5 h-5 mb-0.5" />
            <span className="text-[10px] font-medium leading-none">Menu</span>
          </button>
        </nav>
      </div>
    </div>
  );
};

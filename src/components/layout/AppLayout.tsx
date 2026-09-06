import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileMoreDrawer } from './MobileMoreDrawer';
import { MobileNavigation } from './MobileNavigation';
import { useAuth } from '../../context/AuthContext';
import { Building2 } from 'lucide-react';
import { AccountStatusScreen } from '../auth/AccountStatusScreen';

export const AppLayout: React.FC = () => {
  const { user, userProfile, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Loading screen without flashing dashboard
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
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
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

  // Check account status
  if (userProfile && userProfile.status !== 'active') {
    return <AccountStatusScreen status={userProfile.status} />;
  }

  // If driver tries to access non-fleet route, redirect to fleet
  if (userProfile?.role === 'DRIVER' && !location.pathname.startsWith('/fleet')) {
    return <Navigate to="/fleet" replace />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Desktop Sidebar */}
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onCloseMobile={() => setMobileMenuOpen(false)} 
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        <Topbar onOpenMobileMenu={() => setMobileMenuOpen(true)} />
        
        {/* Main Content Viewport: ensure sufficient bottom padding on mobile for fixed tab bar + safe-area insets */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 pb-[calc(6rem+env(safe-area-inset-bottom,0px))] md:pb-8 custom-scrollbar focus:outline-none">
          <Outlet />
        </main>

        {/* Mobile Bottom Navigation Bar: strictly rendered on mobile devices (< 768px) */}
        <MobileNavigation 
          onMoreClick={() => setMobileMenuOpen(true)}
          isMoreOpen={mobileMenuOpen}
        />
      </div>

      {/* Dedicated Full-Height More Drawer for mobile */}
      <MobileMoreDrawer 
        isOpen={mobileMenuOpen} 
        onClose={() => setMobileMenuOpen(false)} 
      />
    </div>
  );
};

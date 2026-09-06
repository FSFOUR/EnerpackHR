import React, { useState, useMemo } from 'react';
import { 
  Search, Bell, Plus, X, User, Clock, FileText, 
  Calendar, CheckSquare, Settings as SettingsIcon,
  ChevronRight, CarFront, Users, Building2
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { MobileNotificationCenter } from './MobileNotificationCenter';
import { MobileUserProfileSheet } from './MobileUserProfileSheet';

interface TopbarProps {
  onOpenMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, userProfile } = useAuth();

  // Page title resolution
  const pageTitle = useMemo(() => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/employees/')) return 'Employee Profile';
    if (path === '/employees') return 'Employees';
    if (path === '/attendance') return 'Attendance';
    if (path === '/leave') return 'Leave';
    if (path === '/tasks') return 'Tasks';
    if (path === '/documents') return 'Document Vault';
    if (path === '/contracts') return 'Contracts';
    if (path === '/policies') return 'Policies';
    if (path === '/expenses') return 'Expenses';
    if (path.startsWith('/fleet')) return 'Fleet Tracker';
    if (path === '/reports') return 'Reports';
    if (path === '/settings') return 'Settings';
    if (path === '/payroll') return 'Payroll';
    if (path === '/recruitment') return 'Recruitment';
    if (path === '/assets') return 'Assets';
    if (path === '/users') return 'User Management';
    return 'ENERPACK HR';
  }, [location.pathname]);

  const handleQuickNav = (path: string) => {
    navigate(path);
    setShowSearchModal(false);
  };

  const displayName = userProfile?.displayName || user?.displayName || 'User';
  const initial = displayName.charAt(0).toUpperCase();

  return (
    <>
      <header className="h-14 sm:h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-20 shrink-0 select-none">
        {/* Left Section: ENERPACK Logo + Current Page Title */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div 
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer shrink-0"
            title="Go to Dashboard"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-extrabold text-sm sm:text-base shadow-xs shadow-blue-500/20">
              E
            </div>
          </div>

          <div className="min-w-0">
            <h1 className="text-sm sm:text-lg font-bold text-slate-900 tracking-tight truncate leading-tight">
              {pageTitle}
            </h1>
            <span className="hidden sm:block text-[11px] text-slate-400 font-medium truncate">
              Enerpack Workforce Operations
            </span>
          </div>
        </div>

        {/* Center Section: Desktop Global Search */}
        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-6">
          <div 
            onClick={() => setShowSearchModal(true)}
            className="flex items-center bg-slate-100 hover:bg-slate-200/70 rounded-xl px-3.5 py-2 w-full cursor-pointer transition-colors border border-slate-200/60"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <span className="text-xs text-slate-400 flex-1 truncate">Search employees, attendance, documents...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 rounded border border-slate-200 shadow-2xs">
              Ctrl+K
            </kbd>
          </div>
        </div>

        {/* Right Section: Search + Notifications + User Avatar */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick Search Trigger (Mobile) */}
          <button 
            onClick={() => setShowSearchModal(true)}
            aria-label="Search"
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Button with Badge */}
          <button 
            onClick={() => setShowNotifications(true)}
            aria-label="Notifications"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center relative cursor-pointer"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white"></span>
          </button>

          {/* User Profile Avatar Button */}
          <button
            onClick={() => setShowProfileSheet(true)}
            aria-label="User profile"
            className="flex items-center gap-2 p-1 sm:p-1.5 rounded-xl hover:bg-slate-100 active:bg-slate-200 transition-colors min-h-[44px] min-w-[44px] cursor-pointer"
          >
            {userProfile?.photoURL ? (
              <img
                src={userProfile.photoURL}
                alt={displayName}
                className="w-8 h-8 rounded-lg object-cover border border-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                {initial}
              </div>
            )}
            <span className="hidden md:inline text-xs font-bold text-slate-700 max-w-[100px] truncate">
              {displayName.split(' ')[0]}
            </span>
          </button>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-14 sm:pt-20">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules, employee, or document..."
                className="w-full bg-transparent border-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none min-h-[36px]"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1 custom-scrollbar">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Navigation
              </div>
              {[
                { name: 'Employees Directory', path: '/employees', icon: Users },
                { name: 'Attendance & 365-Day Heatmap', path: '/attendance', icon: Clock },
                { name: 'Leave Management & Balances', path: '/leave', icon: Calendar },
                { name: 'Task Management & Action Items', path: '/tasks', icon: CheckSquare },
                { name: 'Document Vault & Compliance Files', path: '/documents', icon: FileText },
                { name: 'Fleet & Vehicle Tracker', path: '/fleet', icon: CarFront },
                { name: 'Settings & Company Parameters', path: '/settings', icon: SettingsIcon },
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => handleQuickNav(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 active:bg-blue-100 text-slate-700 hover:text-blue-700 text-xs font-semibold transition-colors text-left min-h-[44px] cursor-pointer"
                >
                  <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Dedicated Mobile Notification Center */}
      <MobileNotificationCenter 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)} 
      />

      {/* Dedicated Mobile User Profile Sheet */}
      <MobileUserProfileSheet 
        isOpen={showProfileSheet} 
        onClose={() => setShowProfileSheet(false)}
        onOpenNotifications={() => setShowNotifications(true)}
      />
    </>
  );
};

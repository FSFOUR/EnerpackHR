import React from 'react';
import { 
  User, FileText, Clock, Calendar, Key, Bell, 
  Settings as SettingsIcon, LogOut, X, ChevronRight,
  ShieldCheck, Mail, Hash, Phone
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface MobileUserProfileSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNotifications?: () => void;
}

export const MobileUserProfileSheet: React.FC<MobileUserProfileSheetProps> = ({ 
  isOpen, 
  onClose,
  onOpenNotifications 
}) => {
  const { user, userProfile, logout } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleNav = (path: string) => {
    navigate(path);
    onClose();
  };

  const handleLogout = async () => {
    onClose();
    if (logout) {
      await logout();
    }
  };

  const menuItems = [
    { label: 'My Profile', icon: User, action: () => handleNav('/settings') },
    { label: 'My Documents', icon: FileText, action: () => handleNav('/documents') },
    { label: 'My Attendance', icon: Clock, action: () => handleNav('/attendance') },
    { label: 'My Leave', icon: Calendar, action: () => handleNav('/leave') },
    { label: 'Change Password', icon: Key, action: () => handleNav('/settings') },
    { 
      label: 'Notifications', 
      icon: Bell, 
      action: () => {
        onClose();
        if (onOpenNotifications) onOpenNotifications();
      } 
    },
    { label: 'Settings', icon: SettingsIcon, action: () => handleNav('/settings') },
  ];

  const name = userProfile?.displayName || user?.displayName || 'Shafi';
  const roleDisplay = (userProfile?.role || 'SUPER_ADMIN').replace('_', ' ');
  const email = user?.email || 'shafi3396@gmail.com';
  const empId = userProfile?.employeeId || 'EMP-001';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Sheet Content */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col z-10 animate-in slide-in-from-bottom duration-200">
        {/* Mobile drag handle */}
        <div className="w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-3 mb-1 sm:hidden shrink-0" />

        {/* Header with Close */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Account Profile
          </span>
          <button
            onClick={onClose}
            aria-label="Close Profile"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info Card */}
        <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-blue-50/40 to-white">
          <div className="flex items-center gap-4">
            {userProfile?.photoURL ? (
              <img 
                src={userProfile.photoURL} 
                alt={name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-blue-500/20 border-2 border-white">
                {name.charAt(0).toUpperCase()}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <h3 className="font-bold text-slate-900 text-base sm:text-lg truncate leading-tight">
                  {name}
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active" />
              </div>
              <p className="text-xs font-semibold text-blue-600 truncate">{roleDisplay}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-500 font-mono">
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  {email}
                </span>
                <span className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-400 shrink-0" />
                  {empId}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu List */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-1 flex-1 custom-scrollbar">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={item.action}
              className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 active:bg-slate-100 text-slate-700 hover:text-slate-900 transition-colors min-h-[48px] text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-blue-50 text-slate-600 group-hover:text-blue-600 flex items-center justify-center transition-colors">
                  <item.icon className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-semibold">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
            </button>
          ))}

          {/* Logout Button */}
          <div className="pt-2 mt-2 border-t border-slate-100">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-between p-3 rounded-xl bg-rose-50/60 hover:bg-rose-50 text-rose-700 transition-colors min-h-[48px] text-left cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100/80 text-rose-600 flex items-center justify-center">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold">Sign Out</span>
              </div>
              <ChevronRight className="w-4 h-4 text-rose-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Search, Bell, HelpCircle, Menu, Plus, X, User, Clock, FileText, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TopbarProps {
  onOpenMobileMenu?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenMobileMenu }) => {
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleQuickNav = (path: string) => {
    navigate(path);
    setShowSearchModal(false);
    setShowQuickAdd(false);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-3 sm:px-6 lg:px-8 sticky top-0 z-20 shrink-0">
        {/* Left Section: Mobile Menu Button & Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpenMobileMenu}
            aria-label="Open Navigation Menu"
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 active:bg-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2 lg:hidden">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <span className="font-bold text-base text-slate-900 tracking-tight">Enerpack</span>
          </div>
        </div>
        
        {/* Middle Section: Desktop Global Search */}
        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-md mx-4">
          <div 
            onClick={() => setShowSearchModal(true)}
            className="flex items-center bg-slate-100/80 hover:bg-slate-100 rounded-xl px-3.5 py-2 w-full cursor-pointer transition-colors border border-slate-200/60"
          >
            <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
            <span className="text-xs text-slate-400 flex-1">Search employees, attendance, documents...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-400 rounded border border-slate-200 shadow-2xs">
              Ctrl+K
            </kbd>
          </div>
        </div>
        
        {/* Right Section: Mobile Search Trigger + Quick Add + Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Mobile Search Icon Button */}
          <button 
            onClick={() => setShowSearchModal(true)}
            aria-label="Search HR Portal"
            className="lg:hidden p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Button */}
          <div 
            className="relative"
            onMouseLeave={() => setShowNotifications(false)}
          >
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
              className="p-2.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-orange-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div 
                onMouseLeave={() => setShowNotifications(false)}
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Notifications</h4>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">2 New</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Shift Reminder</p>
                      <p className="text-[11px] text-slate-500">Standard shift 08:00 AM – 06:00 PM active.</p>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-2.5">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-slate-800">Document Vault</p>
                      <p className="text-[11px] text-slate-500">Warning letter standard template available.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Add Menu */}
          <div 
            className="relative"
            onMouseLeave={() => setShowQuickAdd(false)}
          >
            <button 
              onClick={() => setShowQuickAdd(!showQuickAdd)}
              className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider px-3 sm:px-4 py-2.5 rounded-xl shadow-xs shadow-blue-200 transition-all flex items-center gap-1.5 min-h-[44px] cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Quick Action</span>
            </button>

            {showQuickAdd && (
              <div 
                onMouseLeave={() => setShowQuickAdd(false)}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in zoom-in-95"
              >
                <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                  Quick Actions
                </div>
                <button
                  onClick={() => handleQuickNav('/attendance')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors min-h-[40px] text-left"
                >
                  <Clock className="w-4 h-4 text-blue-600" /> Log Attendance Punch
                </button>
                <button
                  onClick={() => handleQuickNav('/leave')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors min-h-[40px] text-left"
                >
                  <Calendar className="w-4 h-4 text-emerald-600" /> Apply for Leave
                </button>
                <button
                  onClick={() => handleQuickNav('/documents')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors min-h-[40px] text-left"
                >
                  <FileText className="w-4 h-4 text-amber-600" /> Upload Document
                </button>
                <button
                  onClick={() => handleQuickNav('/employees')}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 rounded-xl transition-colors min-h-[40px] text-left"
                >
                  <User className="w-4 h-4 text-purple-600" /> Add Employee
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 pt-16 sm:pt-20">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-3 sm:p-4 border-b border-slate-100 flex items-center gap-3">
              <Search className="w-5 h-5 text-slate-400 shrink-0" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search modules, employee, or document..."
                className="w-full bg-transparent border-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 max-h-80 overflow-y-auto space-y-1">
              <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Quick Navigation
              </div>
              {[
                { name: 'Attendance & 365-Day Heatmap', path: '/attendance', icon: Clock },
                { name: 'Leave Management & Balances', path: '/leave', icon: Calendar },
                { name: 'Document Vault & Warning Letters', path: '/documents', icon: FileText },
                { name: 'Employees Directory', path: '/employees', icon: User },
                { name: 'Payroll & Salary Slips', path: '/payroll', icon: Plus },
              ].map(item => (
                <button
                  key={item.name}
                  onClick={() => handleQuickNav(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-medium transition-colors text-left min-h-[44px]"
                >
                  <item.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                  <span className="truncate">{item.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};


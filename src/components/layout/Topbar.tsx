import React from 'react';
import { Search, Bell, HelpCircle, Menu, Plus } from 'lucide-react';

export const Topbar: React.FC = () => {
  return (
    <header className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
      <div className="flex items-center gap-4 lg:hidden">
        <button className="text-slate-500 hover:text-slate-700">
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-semibold text-lg text-slate-900">Enerpack HR</span>
      </div>
      
      <div className="hidden lg:flex items-center gap-4 flex-1">
        <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96">
          <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
          <input 
            type="text" 
            placeholder="Global Search..." 
            className="bg-transparent border-none text-sm focus:outline-none w-full text-slate-700 placeholder:text-slate-400"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-6">
        <button className="relative text-slate-600 hover:text-slate-800 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full border-2 border-white"></span>
        </button>
        <button className="w-10 h-10 rounded-full border-2 border-slate-100 flex items-center justify-center font-bold text-slate-400 hover:bg-slate-50 transition-colors">
          ?
        </button>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg font-medium shadow-sm shadow-blue-200 transition-all flex items-center gap-2">
          <Plus className="w-4 h-4" /> Quick Add
        </button>
      </div>
    </header>
  );
};

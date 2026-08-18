import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Building, Bell, Lock, Shield, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Settings() {
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'security' | 'notifications'>('profile');
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = () => {
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      {savedToast && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-green-400" />
          <span className="text-sm font-medium">Settings saved successfully!</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Settings & Preferences</h1>
          <p className="text-slate-500 text-sm mt-1">Manage administrative profile, company work hours, and security parameters.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-6">
        <div className="w-full md:w-64 flex flex-col gap-2 shrink-0">
          {[
            { id: 'profile', label: 'My Profile', icon: User },
            { id: 'company', label: 'Company & Work Hours', icon: Building },
            { id: 'security', label: 'Security & Access', icon: Shield },
            { id: 'notifications', label: 'Notifications', icon: Bell },
          ].map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer",
                activeTab === tab.id 
                  ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </div>
        
        <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          {activeTab === 'profile' && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Admin Profile Information</h2>
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Full Name</label>
                  <input type="text" defaultValue="Shafi (Super Admin)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address</label>
                  <input type="email" defaultValue="Shafi3396@gmail.com" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Role & Privileges</label>
                  <input type="text" disabled defaultValue="SUPER ADMIN (Full HR Access)" className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 cursor-not-allowed text-sm font-bold" />
                </div>
                
                <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 cursor-pointer">
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'company' && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Company Shift & Work Hours Schedule</h2>
              <div className="space-y-6 max-w-lg">
                <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center gap-3">
                  <Clock className="w-6 h-6 text-blue-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm text-blue-900">Standard Work Schedule: 08:00 AM – 06:00 PM</h4>
                    <p className="text-xs text-blue-700 mt-0.5">10-hour standard workday schedule configured company-wide.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Shift Start Time</label>
                    <input type="text" defaultValue="08:00 AM" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Shift End Time</label>
                    <input type="text" defaultValue="06:00 PM" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm font-bold" />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Late Grace Period Threshold</label>
                  <input type="text" defaultValue="15 Minutes (Late after 08:15 AM)" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium" />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Manual Attendance Log Approvals</label>
                  <select defaultValue="enabled" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium">
                    <option value="enabled">Allowed with HR / Admin Authorization (Enabled)</option>
                    <option value="manager_only">Direct Manager Authorization Required</option>
                  </select>
                </div>

                <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 cursor-pointer">
                  Update Shift Timings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Security & Authentication</h2>
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Current Admin Account</label>
                  <p className="text-sm font-mono font-bold text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-200">Shafi3396@gmail.com</p>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Password Policy</label>
                  <p className="text-xs text-slate-500">Super Admin access is secured with master credentials.</p>
                </div>
                <button onClick={handleSave} className="px-6 py-3 bg-slate-900 text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors cursor-pointer">
                  Save Security Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div>
              <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Notification Preferences</h2>
              <div className="space-y-4 max-w-lg">
                {[
                  { title: 'Daily Attendance Summary Alert', desc: 'Receive morning shift attendance overview at 08:30 AM.' },
                  { title: 'Manual Entry Submission Alerts', desc: 'Notify admin when employees submit manual attendance adjustments.' },
                  { title: 'Late Punch Alerts', desc: 'Alert when check-ins occur after 08:15 AM threshold.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl">
                    <div>
                      <p className="font-bold text-sm text-slate-900">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-blue-600 rounded cursor-pointer" />
                  </div>
                ))}
                <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 cursor-pointer mt-4">
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

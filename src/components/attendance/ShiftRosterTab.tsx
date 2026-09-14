import React, { useState } from 'react';
import { 
  Clock, Users, Calendar, ArrowLeftRight, Check, X, ShieldAlert, 
  ChevronLeft, ChevronRight, Filter, Search, Sparkles, Moon, Sun, Sunrise
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ENERPACK_EMPLOYEE_MASTER } from '../../data/enerpackEmployeeMaster';

interface ShiftAssignment {
  id: string;
  empId: string;
  empName: string;
  department: string;
  shift: 'Morning Shift' | 'General Shift' | 'Night Shift';
  shiftTiming: string;
  isOvertime: boolean;
  otHours?: string;
}

const INITIAL_ROSTER: ShiftAssignment[] = ENERPACK_EMPLOYEE_MASTER.slice(0, 8).map((e, idx) => ({
  id: `ROST-0${idx + 1}`,
  empId: e.id,
  empName: e.name,
  department: e.department || e.occupation,
  shift: idx % 3 === 0 ? 'General Shift' : idx % 3 === 1 ? 'Morning Shift' : 'Night Shift',
  shiftTiming: idx % 3 === 0 ? '09:00 AM – 05:30 PM' : idx % 3 === 1 ? '06:00 AM – 02:30 PM' : '10:00 PM – 06:30 AM',
  isOvertime: idx % 2 === 0,
  otHours: idx % 2 === 0 ? '2h 00m' : undefined
}));

export function ShiftRosterTab() {
  const [roster, setRoster] = useState<ShiftAssignment[]>(INITIAL_ROSTER);
  const [selectedDate, setSelectedDate] = useState('Today');
  const [activeShiftFilter, setActiveShiftFilter] = useState<'All' | 'Morning Shift' | 'General Shift' | 'Night Shift'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Swap Modal State
  const [swapModalOpen, setSwapModalOpen] = useState(false);
  const [sourceEmployee, setSourceEmployee] = useState<ShiftAssignment | null>(null);
  const [targetEmployeeId, setTargetEmployeeId] = useState('');
  const [swapReason, setSwapReason] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleOpenSwap = (emp: ShiftAssignment) => {
    setSourceEmployee(emp);
    const availableTargets = roster.filter(r => r.id !== emp.id);
    if (availableTargets.length > 0) {
      setTargetEmployeeId(availableTargets[0].empId);
    }
    setSwapReason('');
    setSwapModalOpen(true);
  };

  const handleConfirmSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceEmployee || !targetEmployeeId) return;
    
    const targetEmp = roster.find(r => r.empId === targetEmployeeId);
    if (!targetEmp) return;

    // Swap shifts
    setRoster(prev => prev.map(item => {
      if (item.id === sourceEmployee.id) {
        return { ...item, shift: targetEmp.shift, shiftTiming: targetEmp.shiftTiming };
      }
      if (item.id === targetEmp.id) {
        return { ...item, shift: sourceEmployee.shift, shiftTiming: sourceEmployee.shiftTiming };
      }
      return item;
    }));

    setSwapModalOpen(false);
    showToast(`Successfully swapped shifts between ${sourceEmployee.empName} and ${targetEmp.empName}`);
  };

  const filteredRoster = roster.filter(r => {
    const matchesShift = activeShiftFilter === 'All' || r.shift === activeShiftFilter;
    const matchesSearch = r.empName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.department.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesShift && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="fixed top-16 right-4 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Enerpack Shift Roster & Management</h3>
            <p className="text-xs text-slate-500 font-medium">Manage morning, general, and night shifts with seamless swap workflows.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            {['Today', 'Tomorrow', 'This Week'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDate(d)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer",
                  selectedDate === d ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                )}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Shift Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search shift by staff name, ID, or department..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['All', 'General Shift', 'Morning Shift', 'Night Shift'] as const).map((shift) => (
            <button
              key={shift}
              onClick={() => setActiveShiftFilter(shift)}
              className={cn(
                "px-3 py-2 rounded-xl text-xs font-extrabold shrink-0 transition-all cursor-pointer border",
                activeShiftFilter === shift 
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs" 
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              )}
            >
              {shift}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <h4 className="font-extrabold text-slate-900 text-sm">Assigned Shifts ({filteredRoster.length})</h4>
          <span className="text-xs font-bold text-slate-400">Enerpack Plant Schedule</span>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredRoster.map((item) => (
            <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0",
                  item.shift === 'General Shift' ? "bg-blue-600" : item.shift === 'Morning Shift' ? "bg-amber-500" : "bg-purple-600"
                )}>
                  {item.shift === 'General Shift' ? <Sun className="w-5 h-5" /> : item.shift === 'Morning Shift' ? <Sunrise className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{item.empName}</span>
                    <span className="text-xs font-mono font-bold text-slate-400">({item.empId})</span>
                  </div>
                  <p className="text-xs text-slate-500">{item.department} • <span className="font-semibold text-slate-700">{item.shiftTiming}</span></p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {item.isOvertime && (
                  <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-extrabold rounded-lg flex items-center gap-1">
                    ⚡ OT: {item.otHours || '2h'}
                  </span>
                )}
                <span className={cn(
                  "px-3 py-1 text-xs font-extrabold rounded-lg",
                  item.shift === 'General Shift' ? "bg-blue-50 text-blue-700 border border-blue-200" : item.shift === 'Morning Shift' ? "bg-amber-50 text-amber-700 border border-amber-200" : "bg-purple-50 text-purple-700 border border-purple-200"
                )}>
                  {item.shift}
                </span>

                <button
                  onClick={() => handleOpenSwap(item)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="Swap Shift with Colleague"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" /> Swap
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Shift Swap Modal */}
      {swapModalOpen && sourceEmployee && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 text-base">Shift Swap Request</h3>
              <button onClick={() => setSwapModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSwap} className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900">Source Employee: {sourceEmployee.empName}</p>
                <p className="text-slate-600">Current Shift: {sourceEmployee.shift} ({sourceEmployee.shiftTiming})</p>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Swap With Colleague</label>
                <select
                  value={targetEmployeeId}
                  onChange={(e) => setTargetEmployeeId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 font-semibold text-slate-700 focus:outline-none"
                >
                  {roster.filter(r => r.id !== sourceEmployee.id).map(r => (
                    <option key={r.empId} value={r.empId}>
                      {r.empName} ({r.shift})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-slate-700">Reason for Swap</label>
                <textarea
                  rows={2}
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  placeholder="Enter reason for shift swap..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Confirm Swap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

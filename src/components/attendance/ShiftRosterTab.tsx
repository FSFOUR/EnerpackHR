import React, { useState } from 'react';
import { 
  Clock, Users, Calendar, ArrowLeftRight, Check, X, ShieldAlert, 
  ChevronLeft, ChevronRight, Filter, Search, Sparkles, Moon, Sun, Sunrise
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ATTENDANCE_EMPLOYEES } from '../../data/attendanceData';

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

const INITIAL_ROSTER: ShiftAssignment[] = [
  { id: 'ROST-01', empId: 'EMP-001', empName: 'Arjun Sharma', department: 'Engineering', shift: 'General Shift', shiftTiming: '09:00 AM – 05:30 PM', isOvertime: true, otHours: '2h 15m' },
  { id: 'ROST-02', empId: 'EMP-002', empName: 'Priya Patel', department: 'Human Resources', shift: 'General Shift', shiftTiming: '09:00 AM – 05:30 PM', isOvertime: false },
  { id: 'ROST-03', empId: 'EMP-003', empName: 'Vikram Singh', department: 'Sales', shift: 'Morning Shift', shiftTiming: '06:00 AM – 02:30 PM', isOvertime: false },
  { id: 'ROST-04', empId: 'EMP-004', empName: 'Ananya Desai', department: 'Marketing', shift: 'Morning Shift', shiftTiming: '06:00 AM – 02:30 PM', isOvertime: true, otHours: '1h 30m' },
  { id: 'ROST-05', empId: 'EMP-005', empName: 'Rahul Verma', department: 'Engineering', shift: 'Night Shift', shiftTiming: '10:00 PM – 06:30 AM', isOvertime: false },
  { id: 'ROST-06', empId: 'EMP-006', empName: 'Sneha Reddy', department: 'Operations', shift: 'Morning Shift', shiftTiming: '06:00 AM – 02:30 PM', isOvertime: false },
  { id: 'ROST-07', empId: 'EMP-007', empName: 'Kavita Iyer', department: 'Design', shift: 'General Shift', shiftTiming: '09:00 AM – 05:30 PM', isOvertime: false },
  { id: 'ROST-08', empId: 'EMP-008', empName: 'Amit Kumar', department: 'Sales', shift: 'Night Shift', shiftTiming: '10:00 PM – 06:30 AM', isOvertime: true, otHours: '3h 00m' },
];

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
    if (!sourceEmployee) return;

    const target = roster.find(r => r.empId === targetEmployeeId);
    if (!target) return;

    setRoster(prev => prev.map(item => {
      if (item.empId === sourceEmployee.empId) {
        return { ...item, shift: target.shift, shiftTiming: target.shiftTiming };
      }
      if (item.empId === target.empId) {
        return { ...item, shift: sourceEmployee.shift, shiftTiming: sourceEmployee.shiftTiming };
      }
      return item;
    }));

    showToast(`Shift swap approved between ${sourceEmployee.empName} and ${target.empName}.`);
    setSwapModalOpen(false);
  };

  const filteredRoster = roster.filter(r => {
    const matchesSearch = r.empName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.empId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesShift = activeShiftFilter === 'All' || r.shift === activeShiftFilter;
    return matchesSearch && matchesShift;
  });

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in">
          <Check className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* TODAY SHIFT SUMMARY CARDS (SECTION 14 REQUIREMENT) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Morning Shift */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200/70 shadow-2xs bg-amber-50/20 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs">
              <Sunrise className="w-4 h-4" />
              <span>Morning Shift</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">06:00 AM – 02:30 PM</p>
            <div className="pt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 font-mono">64</span>
              <span className="text-xs text-slate-500 font-medium">Employees</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            Shift A
          </span>
        </div>

        {/* General Shift */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200/70 shadow-2xs bg-blue-50/20 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs">
              <Sun className="w-4 h-4" />
              <span>General Shift</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">09:00 AM – 05:30 PM</p>
            <div className="pt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 font-mono">82</span>
              <span className="text-xs text-slate-500 font-medium">Employees</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            General
          </span>
        </div>

        {/* Night Shift */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-200/70 shadow-2xs bg-indigo-50/20 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-indigo-700 font-bold text-xs">
              <Moon className="w-4 h-4" />
              <span>Night Shift</span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">10:00 PM – 06:30 AM</p>
            <div className="pt-1 flex items-baseline gap-1.5">
              <span className="text-2xl font-bold text-slate-900 font-mono">22</span>
              <span className="text-xs text-slate-500 font-medium">Employees</span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
            Shift C
          </span>
        </div>
      </div>

      {/* SHIFT ROSTER LIST CONTROLS */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3.5">
        {/* Date Selector: < Today > */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="inline-flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button 
                onClick={() => setSelectedDate('Yesterday')}
                className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 text-xs font-bold text-slate-900 font-mono">
                &lt; {selectedDate} &gt;
              </span>
              <button 
                onClick={() => setSelectedDate('Tomorrow')}
                className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button 
              onClick={() => setSelectedDate('Today')}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-lg border border-blue-200 transition-colors cursor-pointer"
            >
              Reset to Today
            </button>
          </div>

          {/* Search bar */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search employee, ID, shift..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {(['All', 'Morning Shift', 'General Shift', 'Night Shift'] as const).map(shift => (
            <button
              key={shift}
              onClick={() => setActiveShiftFilter(shift)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer shrink-0 min-h-[36px]",
                activeShiftFilter === shift
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {shift}
            </button>
          ))}
        </div>

        {/* MOBILE CARDS (MOBILE-FIRST) */}
        <div className="space-y-2.5 pt-1">
          {filteredRoster.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <Clock className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-600">No shift roster records match</p>
            </div>
          ) : (
            filteredRoster.map((item) => (
              <div 
                key={item.id}
                className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 shrink-0">
                      {item.empName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm leading-tight">{item.empName}</h4>
                      <p className="text-[10px] text-slate-500 font-mono">{item.empId} &bull; {item.department}</p>
                    </div>
                  </div>

                  {/* Overtime badge */}
                  {item.isOvertime && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                      OT +{item.otHours}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                  <div>
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border",
                      item.shift === 'Morning Shift' ? "bg-amber-50 text-amber-700 border-amber-200" :
                      item.shift === 'Night Shift' ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                      "bg-blue-50 text-blue-700 border-blue-200"
                    )}>
                      {item.shift}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono ml-2">
                      {item.shiftTiming}
                    </span>
                  </div>

                  <button
                    onClick={() => handleOpenSwap(item)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[38px]"
                  >
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                    <span>Swap Shift</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* SHIFT SWAP REQUEST MODAL */}
      {swapModalOpen && sourceEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <ArrowLeftRight className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Shift Swap Request</h3>
                  <p className="text-xs text-slate-500">Coordinate scheduled roster duty</p>
                </div>
              </div>
              <button 
                onClick={() => setSwapModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSwap} className="space-y-4">
              {/* Source Employee */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Requesting Employee</span>
                <p className="text-sm font-bold text-slate-900">{sourceEmployee.empName} ({sourceEmployee.empId})</p>
                <p className="text-xs text-blue-700 font-semibold">{sourceEmployee.shift} ({sourceEmployee.shiftTiming})</p>
              </div>

              {/* Target Employee */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Target Swap Partner *
                </label>
                <select
                  value={targetEmployeeId}
                  onChange={(e) => setTargetEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
                >
                  {roster.filter(r => r.empId !== sourceEmployee.empId).map(r => (
                    <option key={r.empId} value={r.empId}>
                      {r.empName} — {r.shift} ({r.department})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Swap Date *
                </label>
                <input 
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[44px]"
                />
              </div>

              {/* Reason */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                  Reason for Shift Swap *
                </label>
                <textarea 
                  required
                  rows={2}
                  value={swapReason}
                  onChange={(e) => setSwapReason(e.target.value)}
                  placeholder="E.g., Medical appointment, personal emergency, shift exchange agreement..."
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSwapModalOpen(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-1.5 min-h-[44px] cursor-pointer"
                >
                  <Check className="w-4 h-4" /> Submit Shift Swap
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

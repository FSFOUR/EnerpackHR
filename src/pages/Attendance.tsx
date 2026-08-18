import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Filter, Clock, Calendar as CalendarIcon, Check, X, CheckCircle2, 
  AlertCircle, Building, Laptop, UserCheck, ShieldAlert, ArrowRight,
  FileEdit, Trash2, Info, Sparkles, Download, CheckCheck, Briefcase,
  TrendingUp, Users, LayoutGrid, CalendarDays, Calculator, Zap
} from 'lucide-react';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { EmployeeAttendanceCalendar } from '../components/attendance/EmployeeAttendanceCalendar';
import { YearlyAttendanceTracker } from '../components/attendance/YearlyAttendanceTracker';
import { CompanyAttendanceMatrix } from '../components/attendance/CompanyAttendanceMatrix';
import { DayAttendance } from '../types/attendance';

interface AttendanceRecord {
  id: string;
  empId: string;
  empName: string;
  department: string;
  date: string;
  checkIn: string; // e.g. "08:00 AM"
  checkOut: string; // e.g. "06:00 PM"
  workHours: string; // e.g. "10h 00m"
  overtimeHours?: string;
  actualOvertimeHours?: string;
  otMultiplier?: number;
  companyOvertimeHours?: string;
  isDoubleOvertime?: boolean;
  doubleOvertimeHours?: string;
  otBonus?: number; // ₹50 if overtime over 4 hours after 18:00 (18:00 to 22:00+)
  status: 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave';
  type: 'Office' | 'Remote' | 'Field' | 'On Duty';
  isManual: boolean;
  manualReason?: string;
  approvedBy?: string;
}

const EMPLOYEES_LIST = [
  { id: 'EMP-001', name: 'Arjun Sharma', department: 'Engineering' },
  { id: 'EMP-002', name: 'Priya Patel', department: 'Human Resources' },
  { id: 'EMP-003', name: 'Vikram Singh', department: 'Sales' },
  { id: 'EMP-004', name: 'Ananya Desai', department: 'Marketing' },
  { id: 'EMP-005', name: 'Rohan Mehta', department: 'Finance' },
  { id: 'EMP-006', name: 'Sneha Reddy', department: 'Operations' },
  { id: 'EMP-007', name: 'Kavita Iyer', department: 'Design' },
  { id: 'EMP-008', name: 'Amit Kumar', department: 'Sales' },
];

const INITIAL_RECORDS: AttendanceRecord[] = [
  {
    id: 'ATT-1001',
    empId: 'EMP-001',
    empName: 'Arjun Sharma',
    department: 'Engineering',
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: '07:55 AM',
    checkOut: '10:15 PM',
    workHours: '14h 20m',
    overtimeHours: '4h 20m',
    otBonus: 50,
    status: 'Present',
    type: 'Office',
    isManual: false,
  },
  {
    id: 'ATT-1002',
    empId: 'EMP-002',
    empName: 'Priya Patel',
    department: 'Human Resources',
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: '08:00 AM',
    checkOut: '06:00 PM',
    workHours: '10h 00m',
    status: 'Present',
    type: 'Remote',
    isManual: false,
  },
  {
    id: 'ATT-1003',
    empId: 'EMP-003',
    empName: 'Vikram Singh',
    department: 'Sales',
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: '08:00 AM',
    checkOut: '06:00 PM',
    workHours: '10h 00m',
    status: 'Present',
    type: 'Field',
    isManual: true,
    manualReason: 'Client site morning demonstration in Whitefield',
    approvedBy: 'Rajiv Singh (Manager)',
  },
  {
    id: 'ATT-1004',
    empId: 'EMP-004',
    empName: 'Ananya Desai',
    department: 'Marketing',
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: '08:45 AM',
    checkOut: '06:30 PM',
    workHours: '9h 45m',
    status: 'Late',
    type: 'Office',
    isManual: false,
  },
  {
    id: 'ATT-1005',
    empId: 'EMP-005',
    empName: 'Rohan Mehta',
    department: 'Finance',
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: '08:00 AM',
    checkOut: '06:00 PM',
    workHours: '10h 00m',
    status: 'Present',
    type: 'Office',
    isManual: true,
    manualReason: 'Biometric fingerprint scanner reader offline on 3rd Floor',
    approvedBy: 'Admin (Shafi)',
  },
  {
    id: 'ATT-1006',
    empId: 'EMP-006',
    empName: 'Sneha Reddy',
    department: 'Operations',
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: '--:--',
    checkOut: '--:--',
    workHours: '0h 00m',
    status: 'Absent',
    type: 'Office',
    isManual: false,
  },
  {
    id: 'ATT-1007',
    empId: 'EMP-007',
    empName: 'Kavita Iyer',
    department: 'Design',
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: '--:--',
    checkOut: '--:--',
    workHours: '0h 00m',
    status: 'On Leave',
    type: 'Remote',
    isManual: false,
  },
];

export const Attendance: React.FC = () => {
  // Main Navigation View: 'daily' | 'calendar' | 'yearly' | 'matrix'
  const [mainView, setMainView] = useState<'daily' | 'calendar' | 'yearly' | 'matrix'>('calendar');
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>('EMP-001');

  const [records, setRecords] = useState<AttendanceRecord[]>(INITIAL_RECORDS);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [myCheckInTime, setMyCheckInTime] = useState<string>('08:00 AM');
  const [timeStr, setTimeStr] = useState(format(new Date(), 'hh:mm:ss a'));
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'present' | 'late' | 'absent' | 'manual'>('all');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [showManualModal, setShowManualModal] = useState(false);
  const [selectedManualRecord, setSelectedManualRecord] = useState<AttendanceRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-memory overrides shared with EmployeeAttendanceCalendar: map of "empId_YYYY-MM-DD" -> DayAttendance
  const [sharedDayOverrides, setSharedDayOverrides] = useState<Record<string, DayAttendance>>({});

  // Manual Form State
  const [manualForm, setManualForm] = useState({
    empId: 'EMP-001',
    date: format(new Date(), 'yyyy-MM-dd'),
    checkIn: '08:00',
    checkOut: '18:00',
    type: 'Office' as 'Office' | 'Remote' | 'Field' | 'On Duty',
    status: 'Present' as 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave',
    reasonCategory: 'Biometric Machine Issue',
    customReason: '',
    approvedBy: 'Admin (Shafi)',
    isDoubleOvertime: false,
    otMultiplier: 1.5,
  });

  // Keep digital clock live
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(format(new Date(), 'hh:mm:ss a'));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const todayFormatted = format(new Date(), 'EEE, MMM dd, yyyy');

  // Calculate hours between 24h format times like "08:00" and "18:00"
  const calculateWorkHours = (inTime: string, outTime: string, isDoubleOt: boolean = false, multiplier: number = 1.5): {
    total: string;
    isOvertime: boolean;
    actualOtText?: string;
    companyOtText?: string;
    otText: string;
    otMultiplier: number;
    isOtBonusEligible: boolean;
    otBonus: number;
    doubleOtText?: string;
    otFormulaText?: string;
  } => {
    if (!inTime || !outTime || inTime === '--:--' || outTime === '--:--') {
      return { total: '0h 00m', isOvertime: false, otText: '', otMultiplier: multiplier, isOtBonusEligible: false, otBonus: 0 };
    }
    
    const [inH, inM] = inTime.split(':').map(Number);
    const [outH, outM] = outTime.split(':').map(Number);
    
    let totalMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const totalStr = `${hours}h ${mins.toString().padStart(2, '0')}m`;

    const standardMinutes = 10 * 60; // 10 hours standard workday: 08:00 to 18:00
    let isOvertime = false;
    let otText = '';
    let actualOtText = undefined;
    let companyOtText = undefined;
    let isOtBonusEligible = false;
    let otBonus = 0;
    let doubleOtText = undefined;
    let otFormulaText = undefined;

    const effectiveMultiplier = isDoubleOt ? 2.0 : (multiplier || 1.5);

    if (isDoubleOt && totalMinutes > 0) {
      // All worked hours credited with 2x Double Overtime multiplier
      const dblMinutes = totalMinutes * 2;
      const dblH = Math.floor(dblMinutes / 60);
      const dblM = dblMinutes % 60;
      isOvertime = true;
      doubleOtText = `${dblH}h ${dblM.toString().padStart(2, '0')}m (2x)`;
      otText = `2x OT: ${dblH}h ${dblM.toString().padStart(2, '0')}m`;
      actualOtText = totalStr;
      companyOtText = `${dblH}h ${dblM.toString().padStart(2, '0')}m`;
      otFormulaText = `${totalStr} actual × 2.0 = ${companyOtText}`;
      isOtBonusEligible = true;
      otBonus = 50;
    } else if (totalMinutes > standardMinutes) {
      const rawOtMins = totalMinutes - standardMinutes;
      const actualOtH = Math.floor(rawOtMins / 60);
      const actualOtM = rawOtMins % 60;
      actualOtText = actualOtH > 0 ? `${actualOtH}h ${actualOtM}m` : `${actualOtM}m`;

      const compOtMins = Math.round(rawOtMins * effectiveMultiplier);
      const compH = Math.floor(compOtMins / 60);
      const compM = compOtMins % 60;
      companyOtText = compH > 0 ? `${compH}h ${compM.toString().padStart(2, '0')}m` : `${compM}m`;

      isOvertime = true;
      const actualHoursDecimal = Number((rawOtMins / 60).toFixed(2));
      const compHoursDecimal = Number((compOtMins / 60).toFixed(2));
      
      otFormulaText = `${actualHoursDecimal}h actual × ${effectiveMultiplier} = ${compHoursDecimal}h (${companyOtText})`;
      otText = `${companyOtText} (${effectiveMultiplier}x)`;

      // OT Bonus policy: ₹50 bonus if overtime exceeds 4 hours (>= 240 mins) after 18:00 (18:00 to 22:00+)
      if (rawOtMins >= 240 || compOtMins >= 240) {
        isOtBonusEligible = true;
        otBonus = 50;
      }
    }
    
    return { 
      total: totalStr, 
      isOvertime, 
      otText, 
      actualOtText, 
      companyOtText, 
      otMultiplier: effectiveMultiplier, 
      isOtBonusEligible, 
      otBonus, 
      doubleOtText,
      otFormulaText
    };
  };

  // Convert "08:00" (24h) to "08:00 AM" (12h)
  const formatTo12Hour = (time24: string) => {
    if (!time24) return '--:--';
    const [h, m] = time24.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 === 0 ? 12 : h % 12;
    return `${h12.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
  };

  // Handle Self Web Check-In/Check-Out
  const handleToggleCheckIn = () => {
    if (!isCheckedIn) {
      const currentTime12 = format(new Date(), 'hh:mm a');
      setIsCheckedIn(true);
      setMyCheckInTime(currentTime12);
      showToast(`Checked in successfully at ${currentTime12} for the 08:00 AM - 06:00 PM shift.`);
    } else {
      const currentTime12 = format(new Date(), 'hh:mm a');
      setIsCheckedIn(false);
      showToast(`Checked out successfully at ${currentTime12}. Have a great evening!`);
    }
  };

  // Open manual entry modal
  const handleOpenManualModal = (emp?: { id: string; name: string }) => {
    const targetEmp = emp ? emp.id : (targetEmployeeId || 'EMP-001');
    setManualForm({
      empId: targetEmp,
      date: selectedDate || format(new Date(), 'yyyy-MM-dd'),
      checkIn: '08:00',
      checkOut: '18:00',
      type: 'Office',
      status: 'Present',
      reasonCategory: 'Biometric Machine Issue',
      customReason: '',
      approvedBy: 'Admin (Shafi)',
      isDoubleOvertime: false,
      otMultiplier: 1.5,
    });
    setShowManualModal(true);
  };

  // Auto-determine suggested status based on check-in time vs 08:00 AM working hours
  const handleCheckInTimeChange = (newInTime: string) => {
    let suggestedStatus: 'Present' | 'Late' | 'Half Day' = 'Present';
    const [h, m] = newInTime.split(':').map(Number);
    const totalMinutes = h * 60 + m;
    const standardStartMinutes = 8 * 60; // 08:00 AM
    const graceThresholdMinutes = 8 * 60 + 15; // 08:15 AM

    if (totalMinutes > graceThresholdMinutes && totalMinutes <= 13 * 60) {
      suggestedStatus = 'Late';
    } else if (totalMinutes > 13 * 60) {
      suggestedStatus = 'Half Day';
    } else {
      suggestedStatus = 'Present';
    }

    setManualForm(prev => ({
      ...prev,
      checkIn: newInTime,
      status: suggestedStatus
    }));
  };

  // Save manual attendance record
  const handleSaveManualEntry = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = EMPLOYEES_LIST.find(e => e.id === manualForm.empId) || {
      id: manualForm.empId,
      name: 'Employee',
      department: 'General'
    };

    const isAbsentOrLeave = manualForm.status === 'Absent' || manualForm.status === 'On Leave';
    const checkIn12 = isAbsentOrLeave ? '--:--' : formatTo12Hour(manualForm.checkIn);
    const checkOut12 = isAbsentOrLeave ? '--:--' : formatTo12Hour(manualForm.checkOut);

    const workHoursData = isAbsentOrLeave 
      ? { total: '0h 00m', isOvertime: false, otText: '', isOtBonusEligible: false, otBonus: 0, doubleOtText: undefined, actualOtText: undefined, companyOtText: undefined }
      : calculateWorkHours(manualForm.checkIn, manualForm.checkOut, manualForm.isDoubleOvertime, manualForm.otMultiplier);
    const { total, isOvertime, otText, actualOtText, companyOtText, otBonus, doubleOtText } = workHoursData;

    const reasonText = manualForm.customReason.trim() 
      ? `${manualForm.reasonCategory}: ${manualForm.customReason.trim()}`
      : manualForm.reasonCategory;

    const newRecord: AttendanceRecord = {
      id: `ATT-${Date.now().toString().slice(-4)}`,
      empId: emp.id,
      empName: emp.name,
      department: emp.department,
      date: manualForm.date,
      checkIn: checkIn12,
      checkOut: checkOut12,
      workHours: total,
      overtimeHours: isOvertime ? otText : undefined,
      actualOvertimeHours: actualOtText,
      otMultiplier: manualForm.isDoubleOvertime ? 2.0 : manualForm.otMultiplier,
      companyOvertimeHours: companyOtText,
      isDoubleOvertime: manualForm.isDoubleOvertime,
      doubleOvertimeHours: doubleOtText,
      otBonus: otBonus > 0 ? otBonus : undefined,
      status: manualForm.status,
      type: manualForm.type,
      isManual: true,
      manualReason: reasonText,
      approvedBy: manualForm.approvedBy,
    };

    // Parse date for DayAttendance
    const [yearStr, monthStr, dayStr] = manualForm.date.split('-');
    const dateObj = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
    const dayOfWeek = format(dateObj, 'EEE');
    const dayNumber = Number(dayStr);
    const isWeekend = dayOfWeek === 'Sun';

    const [inH, inM] = manualForm.checkIn.split(':').map(Number);
    const [outH, outM] = manualForm.checkOut.split(':').map(Number);
    let workMinutes = (outH * 60 + outM) - (inH * 60 + inM);
    if (workMinutes < 0) workMinutes += 24 * 60;
    if (isAbsentOrLeave) workMinutes = 0;

    const actualOtMins = isAbsentOrLeave ? 0 : (manualForm.isDoubleOvertime ? workMinutes : (workMinutes > 600 ? workMinutes - 600 : 0));
    const companyOtMins = Math.round(actualOtMins * (manualForm.isDoubleOvertime ? 2.0 : (manualForm.otMultiplier || 1.5)));

    const dayRecord: DayAttendance = {
      date: manualForm.date,
      dayNumber,
      dayOfWeek,
      isWeekend,
      isHoliday: false,
      status: manualForm.status,
      checkIn: isAbsentOrLeave ? undefined : checkIn12,
      checkOut: isAbsentOrLeave ? undefined : checkOut12,
      workHours: total,
      workMinutes,
      actualOvertimeHours: actualOtText,
      actualOvertimeMinutes: actualOtMins,
      otMultiplier: manualForm.isDoubleOvertime ? 2.0 : manualForm.otMultiplier,
      companyOvertimeHours: companyOtText,
      companyOvertimeMinutes: companyOtMins,
      overtimeHours: isOvertime ? companyOtText : undefined,
      overtimeMinutes: companyOtMins,
      isDoubleOvertime: manualForm.isDoubleOvertime,
      doubleOvertimeHours: doubleOtText,
      doubleOvertimeMinutes: manualForm.isDoubleOvertime ? workMinutes * 2 : 0,
      otBonus: otBonus > 0 ? otBonus : undefined,
      otBonusEligible: otBonus > 0,
      type: manualForm.type,
      isManual: true,
      manualReason: reasonText,
      approvedBy: manualForm.approvedBy,
      notes: reasonText,
    };

    // Update shared day overrides so EmployeeCalendar reflects instantly
    setSharedDayOverrides(prev => ({
      ...prev,
      [`${manualForm.empId}_${manualForm.date}`]: dayRecord,
    }));

    // Replace if already exists for this employee and date, or prepend
    setRecords(prev => {
      const existingIdx = prev.findIndex(r => r.empId === newRecord.empId && r.date === newRecord.date);
      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = newRecord;
        return copy;
      }
      return [newRecord, ...prev];
    });

    setShowManualModal(false);
    showToast(`Manual attendance logged for ${emp.name} (${emp.id}) with shift 08:00 AM - 06:00 PM.`);
  };

  const handleSaveDayOverride = (updatedDay: DayAttendance, empId: string) => {
    const key = `${empId}_${updatedDay.date}`;
    setSharedDayOverrides(prev => ({
      ...prev,
      [key]: updatedDay,
    }));
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
    showToast('Attendance record removed.');
  };

  // Filtered records
  const filteredRecords = useMemo(() => {
    return records.filter(r => {
      // Search
      const matchesSearch = 
        r.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Tab filter
      if (activeTabFilter === 'present') return r.status === 'Present';
      if (activeTabFilter === 'late') return r.status === 'Late';
      if (activeTabFilter === 'absent') return r.status === 'Absent' || r.status === 'On Leave';
      if (activeTabFilter === 'manual') return r.isManual;

      return true;
    });
  }, [records, searchTerm, activeTabFilter]);

  // Metric stats
  const stats = useMemo(() => {
    const total = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const late = records.filter(r => r.status === 'Late').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const onLeave = records.filter(r => r.status === 'On Leave').length;
    const manualCount = records.filter(r => r.isManual).length;
    return { total, present, late, absent, onLeave, manualCount };
  }, [records]);

  // Cross navigation helper
  const handleNavigateToCalendar = (empId: string) => {
    setTargetEmployeeId(empId);
    setMainView('calendar');
  };

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-blue-600" /> Standard Shift: 08:00 AM – 06:00 PM (10 hrs)
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Attendance Management</h1>
          <p className="text-slate-500 text-sm">
            Complete employee monthly attendance calendars, 365-day yearly heatmap trackers, and shift punch administration.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button 
            id="btn-log-manual-entry"
            onClick={() => handleOpenManualModal()}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" /> Log Manual Entry
          </button>
        </div>
      </div>

      {/* MAIN MODULE NAVIGATION TABS */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl flex flex-wrap items-center gap-1 border border-slate-200/80 shadow-2xs">
        <button
          onClick={() => setMainView('calendar')}
          className={cn(
            "flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
            mainView === 'calendar'
              ? "bg-white text-blue-700 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          )}
        >
          <CalendarDays className="w-4 h-4 text-blue-600" />
          Employee Calendar
        </button>

        <button
          onClick={() => setMainView('yearly')}
          className={cn(
            "flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
            mainView === 'yearly'
              ? "bg-white text-purple-700 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          )}
        >
          <TrendingUp className="w-4 h-4 text-purple-600" />
          Yearly Tracker & Heatmap
        </button>

        <button
          onClick={() => setMainView('matrix')}
          className={cn(
            "flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
            mainView === 'matrix'
              ? "bg-white text-emerald-700 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          )}
        >
          <LayoutGrid className="w-4 h-4 text-emerald-600" />
          Company Register Matrix
        </button>

        <button
          onClick={() => setMainView('daily')}
          className={cn(
            "flex-1 min-w-[170px] py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
            mainView === 'daily'
              ? "bg-white text-slate-900 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          )}
        >
          <Clock className="w-4 h-4 text-slate-700" />
          Daily Punches & Live Desk
        </button>
      </div>

      {/* VIEW 1: EMPLOYEE ATTENDANCE CALENDAR */}
      {mainView === 'calendar' && (
        <EmployeeAttendanceCalendar 
          initialEmployeeId={targetEmployeeId}
          onOpenManualModal={handleOpenManualModal}
          sharedDayOverrides={sharedDayOverrides}
          onSaveDayOverride={handleSaveDayOverride}
          onSelectedEmployeeChange={setTargetEmployeeId}
        />
      )}

      {/* VIEW 2: YEARLY ATTENDANCE TRACKER & HEATMAP */}
      {mainView === 'yearly' && (
        <YearlyAttendanceTracker
          initialEmployeeId={targetEmployeeId}
          onNavigateToMonth={(monthIdx, year, empId) => {
            setTargetEmployeeId(empId);
            setMainView('calendar');
          }}
        />
      )}

      {/* VIEW 3: COMPANY ATTENDANCE REGISTER MATRIX */}
      {mainView === 'matrix' && (
        <CompanyAttendanceMatrix
          onSelectEmployeeForCalendar={(empId) => {
            handleNavigateToCalendar(empId);
          }}
        />
      )}

      {/* VIEW 4: DAILY PUNCHES & LIVE SHIFT DESK */}
      {mainView === 'daily' && (
        <div className="space-y-6">
          {/* Shift Timing Notice & Highlight Bar */}
          <div className="bg-gradient-to-r from-blue-900 to-slate-900 text-white rounded-2xl p-5 shadow-sm border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-white">General Work Shift: 08:00 AM to 06:00 PM</h3>
                  <span className="bg-blue-500/30 text-blue-200 text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wider border border-blue-400/20">Active</span>
                </div>
                <p className="text-slate-300 text-xs mt-0.5">
                  Standard shift duration is <strong>10 Hours</strong>. Morning check-in window opens at 07:45 AM; grace period extends until 08:15 AM.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 self-start md:self-auto shrink-0 bg-white/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
              <div className="text-right">
                <span className="text-[10px] text-slate-300 uppercase tracking-widest font-bold block">Live Server Time</span>
                <span className="text-sm font-bold text-white font-mono">{timeStr}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Side: Check-in Widget & Shift Metrics */}
            <div className="lg:col-span-1 space-y-6">
              {/* Quick Check-in widget */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center justify-center text-center">
                <div className="w-full flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-3 mb-4">
                  <span>{todayFormatted}</span>
                  <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">10H Shift</span>
                </div>

                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-700 mb-3 shadow-inner">
                  <Clock className="w-8 h-8 text-blue-600" />
                </div>

                <p className="text-2xl font-bold text-slate-900 mb-1 font-mono tracking-tight">{timeStr}</p>
                <p className="text-xs text-slate-500 mb-5">Shift: 08:00 AM - 06:00 PM</p>
                
                {isCheckedIn ? (
                  <div className="w-full space-y-3">
                    <div className="bg-green-50/70 border border-green-200 rounded-xl p-3 text-left">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-green-700 font-bold uppercase tracking-wider text-[10px]">Punched In</span>
                        <span className="font-bold text-green-900 font-mono">{myCheckInTime}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs mt-1 pt-1 border-t border-green-200/50">
                        <span className="text-slate-500 text-[10px] uppercase tracking-wider">Scheduled Out</span>
                        <span className="font-bold text-slate-700 font-mono">06:00 PM</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleToggleCheckIn}
                      className="w-full py-3 bg-orange-600 hover:bg-orange-700 shadow-sm shadow-orange-200 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" /> Web Check-Out
                    </button>
                  </div>
                ) : (
                  <div className="w-full space-y-3">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left text-xs space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-[10px] uppercase font-bold">Standard Shift</span>
                        <span className="font-bold text-slate-800 font-mono">08:00 AM – 06:00 PM</span>
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                        <span>Grace Threshold:</span>
                        <span className="font-semibold text-emerald-700">≤ 08:15 AM</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleToggleCheckIn}
                      className="w-full py-3 bg-blue-600 hover:bg-blue-700 shadow-sm shadow-blue-200 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" /> Web Check-In
                    </button>
                  </div>
                )}
              </div>

              {/* Today's Shift Metrics summary */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="font-bold text-slate-800 uppercase tracking-widest text-xs">Shift Metrics</h3>
                  <span className="text-[10px] font-bold text-slate-400">{todayFormatted}</span>
                </div>

                <div className="space-y-2.5">
                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div> Total Rostered
                    </span>
                    <span className="font-bold text-slate-900 font-mono text-sm">{stats.total}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100">
                    <span className="text-xs font-semibold text-emerald-900 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div> Present (On Time)
                    </span>
                    <span className="font-bold text-emerald-700 font-mono text-sm">{stats.present}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-orange-50/50 border border-orange-100">
                    <span className="text-xs font-semibold text-orange-900 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div> Late Arrivals
                    </span>
                    <span className="font-bold text-orange-600 font-mono text-sm">{stats.late}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-semibold text-slate-700 flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Absent / Leave
                    </span>
                    <span className="font-bold text-red-600 font-mono text-sm">{stats.absent + stats.onLeave}</span>
                  </div>

                  <div className="flex justify-between items-center p-2.5 rounded-xl bg-blue-50/50 border border-blue-100">
                    <span className="text-xs font-semibold text-blue-900 flex items-center gap-2">
                      <FileEdit className="w-3.5 h-3.5 text-blue-600" /> Manual Adjustments
                    </span>
                    <span className="font-bold text-blue-700 font-mono text-sm">{stats.manualCount}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side: Attendance Logs Table & Controls */}
            <div className="lg:col-span-3 space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
                {/* Table Header & Search */}
                <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-slate-900 text-base">Attendance Logs</h2>
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                      {filteredRecords.length} records
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search employee or ID..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                      />
                    </div>
                    <button
                      onClick={() => handleOpenManualModal()}
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors border border-blue-200 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Log Manual Entry
                    </button>
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="px-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-2 pt-2">
                  {[
                    { id: 'all', label: 'All Records', count: records.length },
                    { id: 'present', label: 'Present (On Time)', count: stats.present },
                    { id: 'late', label: 'Late (> 08:15 AM)', count: stats.late },
                    { id: 'absent', label: 'Absent / Leave', count: stats.absent + stats.onLeave },
                    { id: 'manual', label: 'Manual Entries', count: stats.manualCount },
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTabFilter(tab.id as any)}
                      className={cn(
                        "px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 cursor-pointer",
                        activeTabFilter === tab.id
                          ? "border-blue-600 text-blue-600 bg-white shadow-sm"
                          : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70"
                      )}
                    >
                      {tab.label}
                      <span className={cn(
                        "px-1.5 py-0.2 rounded-full text-[9px]",
                        activeTabFilter === tab.id ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                      )}>
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
                
                {/* Table Content */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/30">
                        <th className="py-3.5 px-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                        <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check In</th>
                        <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check Out</th>
                        <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Work Duration</th>
                        <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location / Type</th>
                        <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                        <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 text-sm">
                      {filteredRecords.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                            No attendance records match your filter criteria.
                          </td>
                        </tr>
                      ) : (
                        filteredRecords.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-50/80 transition-colors group">
                            <td className="py-4 px-5 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 font-bold text-xs flex items-center justify-center border border-slate-200 shrink-0">
                                  {record.empName.charAt(0)}
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span 
                                      onClick={() => handleNavigateToCalendar(record.empId)}
                                      className="font-bold text-slate-900 hover:text-blue-600 cursor-pointer transition-colors"
                                    >
                                      {record.empName}
                                    </span>
                                    {record.isManual && (
                                      <span 
                                        className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 cursor-pointer"
                                        title={`Manual Entry: ${record.manualReason || 'Manual adjustment'}`}
                                        onClick={() => setSelectedManualRecord(record)}
                                      >
                                        <FileEdit className="w-2.5 h-2.5" /> Manual
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-medium">{record.empId} &bull; {record.department}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-slate-800">
                              {record.checkIn}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-slate-800">
                              {record.checkOut}
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs font-semibold text-slate-700">{record.workHours}</span>
                                  {record.isDoubleOvertime ? (
                                    <span className="text-[9px] font-extrabold text-purple-800 bg-purple-100 border border-purple-300 px-1.5 py-0.2 rounded">
                                      ⚡ 2x Double OT {record.doubleOvertimeHours ? `(${record.doubleOvertimeHours})` : ''}
                                    </span>
                                  ) : record.overtimeHours ? (
                                    <span className="text-[9px] font-bold text-purple-600 bg-purple-50 border border-purple-200 px-1.5 py-0.2 rounded">
                                      +{record.overtimeHours}
                                    </span>
                                  ) : null}
                                </div>
                                {record.otBonus && record.otBonus > 0 ? (
                                  <span className="inline-flex items-center gap-1 text-[9px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.2 rounded w-fit">
                                    <Sparkles className="w-2.5 h-2.5 text-amber-600" /> +₹{record.otBonus} OT Bonus
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className="text-xs text-slate-600 font-medium flex items-center gap-1.5">
                                {record.type === 'Office' && <Building className="w-3.5 h-3.5 text-slate-400" />}
                                {record.type === 'Remote' && <Laptop className="w-3.5 h-3.5 text-blue-400" />}
                                {record.type === 'Field' && <Briefcase className="w-3.5 h-3.5 text-amber-500" />}
                                {record.type === 'On Duty' && <UserCheck className="w-3.5 h-3.5 text-emerald-500" />}
                                {record.type}
                              </span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap">
                              <span className={cn(
                                "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                                record.status === 'Present' ? 'bg-green-50 text-green-700 border border-green-200' :
                                record.status === 'Late' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                                record.status === 'Half Day' ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                                record.status === 'On Leave' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                                'bg-red-50 text-red-700 border border-red-200'
                              )}>
                                {record.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  onClick={() => handleNavigateToCalendar(record.empId)}
                                  title="View Employee Monthly Calendar"
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <CalendarDays className="w-4 h-4" />
                                </button>
                                {record.isManual && (
                                  <button 
                                    onClick={() => setSelectedManualRecord(record)}
                                    title="View Manual Entry Reason"
                                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    <Info className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenManualModal({ id: record.empId, name: record.empName })}
                                  title="Manual Correction"
                                  className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                >
                                  <FileEdit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRecord(record.id)}
                                  title="Delete Record"
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Table Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium text-slate-500">
                  <span>Showing {filteredRecords.length} of {records.length} employee entries</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Working Hours: 08:00 AM - 06:00 PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ATTENDANCE ENTRY MODAL */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <FileEdit className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-bold text-slate-900">Manual Attendance Entry</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">Override or log manual check-in for the 08:00 AM to 06:00 PM shift.</p>
              </div>
              <button 
                onClick={() => setShowManualModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualEntry} className="space-y-4">
              {/* Employee Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Select Employee *
                </label>
                <select
                  value={manualForm.empId}
                  onChange={(e) => setManualForm(prev => ({ ...prev, empId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  required
                >
                  {EMPLOYEES_LIST.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) &bull; {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Location Mode */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Attendance Date *
                  </label>
                  <input
                    type="date"
                    value={manualForm.date}
                    onChange={(e) => setManualForm(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Work Location / Type *
                  </label>
                  <select
                    value={manualForm.type}
                    onChange={(e) => setManualForm(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Office">Office</option>
                    <option value="Remote">Remote / Work From Home</option>
                    <option value="Field">Field / Client Site</option>
                    <option value="On Duty">On Duty (Authorized)</option>
                  </select>
                </div>
              </div>

              {/* Working Hours Schedule banner */}
              <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl flex items-center justify-between text-xs text-blue-900">
                <span className="font-semibold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600" /> Standard Shift: 08:00 AM – 06:00 PM (10 hrs)
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                  Grace: ≤ 08:15 AM
                </span>
              </div>

              {/* Check-In & Check-Out Times */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Check-In Time (24h) *
                  </label>
                  <input
                    type="time"
                    value={manualForm.checkIn}
                    onChange={(e) => handleCheckInTimeChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Formatted: {formatTo12Hour(manualForm.checkIn)}</span>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Check-Out Time (24h) *
                  </label>
                  <input
                    type="time"
                    value={manualForm.checkOut}
                    onChange={(e) => setManualForm(prev => ({ ...prev, checkOut: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">Formatted: {formatTo12Hour(manualForm.checkOut)}</span>
                </div>
              </div>

              {/* Calculated Work Duration Preview */}
              {(() => {
                const workInfo = calculateWorkHours(manualForm.checkIn, manualForm.checkOut, manualForm.isDoubleOvertime, manualForm.otMultiplier);
                return (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 font-medium">Calculated Work Duration:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {workInfo.total}
                        {workInfo.isOvertime && (
                          <span className={cn(
                            "font-bold ml-1.5 text-xs",
                            manualForm.isDoubleOvertime ? "text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded" : "text-purple-600"
                          )}>
                            (+{workInfo.otText})
                          </span>
                        )}
                      </span>
                    </div>

                    {workInfo.isOtBonusEligible && (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                        <span className="font-semibold flex items-center gap-1.5 text-[11px]">
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" /> ₹50 OT Bonus Policy Qualified:
                        </span>
                        <span className="font-mono font-bold text-amber-800 text-xs">+₹50.00</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* OT Multiplier & Company Calculation Rate Input */}
              <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-purple-950 flex items-center gap-1.5 uppercase tracking-wider">
                    <Calculator className="w-3.5 h-3.5 text-purple-600" />
                    OT Multiplier (Company Calculation)
                  </label>
                  <span className="text-[10px] text-purple-700 font-semibold">
                    e.g. 1h actual × 1.5 = 1.5h Total OT
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '1.5x (Company Standard)', val: 1.5 },
                    { label: '2.0x (2x Double OT)', val: 2.0 },
                  ].map(preset => (
                    <button
                      type="button"
                      key={preset.val}
                      onClick={() => {
                        setManualForm(prev => ({
                          ...prev,
                          otMultiplier: preset.val,
                          isDoubleOvertime: preset.val === 2.0 ? true : (prev.isDoubleOvertime && preset.val !== 2.0 ? false : prev.isDoubleOvertime),
                          reasonCategory: preset.val === 2.0 && prev.reasonCategory === 'Biometric Machine Issue'
                            ? 'Emergency Duty'
                            : prev.reasonCategory
                        }));
                      }}
                      className={cn(
                        "py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center",
                        manualForm.otMultiplier === preset.val
                          ? "bg-purple-600 text-white border-purple-600 shadow-xs"
                          : "bg-white text-purple-900 border-purple-200 hover:bg-purple-100/50"
                      )}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <span className="text-xs text-purple-900 font-medium whitespace-nowrap">Custom Multiplier:</span>
                  <div className="relative flex-1">
                    <input
                      type="number"
                      step="0.05"
                      min="0.5"
                      max="5"
                      value={manualForm.otMultiplier}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1.0;
                        setManualForm(prev => ({
                          ...prev,
                          otMultiplier: val,
                          isDoubleOvertime: val === 2.0 ? true : prev.isDoubleOvertime
                        }));
                      }}
                      className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-sm font-mono font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                    />
                    <span className="absolute right-3 top-1.5 text-xs font-bold text-purple-500">x Factor</span>
                  </div>
                </div>

                {/* Dynamic Formula Display */}
                {(() => {
                  const info = calculateWorkHours(manualForm.checkIn, manualForm.checkOut, manualForm.isDoubleOvertime, manualForm.otMultiplier);
                  return (
                    <div className="p-2.5 bg-white/90 rounded-lg border border-purple-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-purple-900 font-medium">
                        <span>Actual Clocked OT: <strong className="font-mono">{info.actualOtText || '0h 00m'}</strong></span>
                        <span>Company Multiplier: <strong className="font-mono">× {manualForm.otMultiplier}</strong></span>
                        <span>Credited OT: <strong className="font-mono text-purple-700">{info.companyOtText || '0h 00m'}</strong></span>
                      </div>
                      {info.otFormulaText && (
                        <div className="text-[11px] font-mono font-bold text-purple-800 pt-1 border-t border-purple-100 flex items-center justify-between">
                          <span>Calculation:</span>
                          <span>{info.otFormulaText}</span>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>

              {/* Double Overtime Marking Option (Holiday / Off-day Duty) */}
              <div className={cn(
                "p-3 rounded-xl border transition-all",
                manualForm.isDoubleOvertime 
                  ? "bg-purple-50/80 border-purple-300 ring-1 ring-purple-300" 
                  : "bg-slate-50/60 border-slate-200 hover:border-slate-300"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors",
                      manualForm.isDoubleOvertime ? "bg-purple-600 text-white" : "bg-slate-200 text-slate-600"
                    )}>
                      ⚡
                    </div>
                    <div>
                      <label 
                        htmlFor="manual-double-ot-toggle"
                        className="text-xs font-bold text-slate-900 cursor-pointer block"
                      >
                        Double Overtime (2x Multiplier)
                      </label>
                      <p className="text-[10px] text-slate-500">
                        Mark if employee worked on declared public holiday or off-day (all hours credited as 2x OT + ₹50 OT Bonus)
                      </p>
                    </div>
                  </div>

                  <input
                    id="manual-double-ot-toggle"
                    type="checkbox"
                    checked={manualForm.isDoubleOvertime}
                    onChange={(e) => setManualForm(prev => ({ 
                      ...prev, 
                      isDoubleOvertime: e.target.checked,
                      otMultiplier: e.target.checked ? 2.0 : 1.5,
                      reasonCategory: e.target.checked && prev.reasonCategory === 'Biometric Machine Issue' 
                        ? 'Emergency Duty' 
                        : prev.reasonCategory 
                    }))}
                    className="w-5 h-5 accent-purple-600 rounded cursor-pointer shrink-0"
                  />
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Attendance Status *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['Present', 'Late', 'Half Day', 'Absent', 'On Leave'] as const).map(st => (
                    <button
                      type="button"
                      key={st}
                      onClick={() => setManualForm(prev => ({ ...prev, status: st }))}
                      className={cn(
                        "py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center",
                        manualForm.status === st
                          ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason Category */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Reason for Manual Entry *
                </label>
                <select
                  value={manualForm.reasonCategory}
                  onChange={(e) => setManualForm(prev => ({ ...prev, reasonCategory: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none mb-2"
                >
                  <option value="Biometric Machine Issue">Biometric Fingerprint / Face Reader Issue</option>
                  <option value="Forgot to Punch">Employee Forgot to Punch (Authorized)</option>
                  <option value="Client Site Visit / Field Work">Client Site Visit / Field Work</option>
                  <option value="Network / System Outage">Network / Internet Outage</option>
                  <option value="Remote Work Approval">Authorized Remote Work</option>
                  <option value="Late Approval Granted">Manager Approved Late Arrival</option>
                  <option value="Emergency Duty">Emergency Duty / Early Call-In</option>
                  <option value="Other">Other (Specify Below)</option>
                </select>
                <textarea
                  rows={2}
                  placeholder="Additional remarks or notes for audit trail..."
                  value={manualForm.customReason}
                  onChange={(e) => setManualForm(prev => ({ ...prev, customReason: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>

              {/* Approved By */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Authorized By
                </label>
                <input
                  type="text"
                  value={manualForm.approvedBy}
                  onChange={(e) => setManualForm(prev => ({ ...prev, approvedBy: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2 cursor-pointer"
                >
                  <CheckCheck className="w-4 h-4" /> Save Manual Entry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW MANUAL ENTRY AUDIT DETAILS MODAL */}
      {selectedManualRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                  <FileEdit className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Manual Entry Audit Details</h3>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {selectedManualRecord.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedManualRecord(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Employee</p>
                <p className="font-bold text-slate-900">{selectedManualRecord.empName} ({selectedManualRecord.empId})</p>
                <p className="text-xs text-slate-500">{selectedManualRecord.department}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Shift Timing</p>
                  <p className="font-bold text-slate-900 text-xs">08:00 AM – 06:00 PM</p>
                  <p className="text-[10px] text-slate-500">10h Standard Workday</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Punched Record</p>
                  <p className="font-bold text-slate-900 text-xs">{selectedManualRecord.checkIn} - {selectedManualRecord.checkOut}</p>
                  <p className="text-[10px] text-slate-500 font-semibold text-green-700">{selectedManualRecord.workHours}</p>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Reason for Manual Adjustment</p>
                <p className="text-xs font-medium text-amber-950">{selectedManualRecord.manualReason || 'Manual check-in override granted.'}</p>
              </div>

              {selectedManualRecord.approvedBy && (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <span>Approved By:</span>
                  <span className="font-bold text-slate-800">{selectedManualRecord.approvedBy}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedManualRecord(null)}
                className="px-4 py-2 bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

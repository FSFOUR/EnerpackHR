import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, 
  Clock, CheckCircle2, AlertCircle, AlertTriangle, Building, 
  Laptop, Briefcase, UserCheck, FileEdit, Download, Filter, 
  Sparkles, Check, Info, ArrowUpRight, TrendingUp, ShieldCheck
} from 'lucide-react';
import { DayAttendance, EmployeeProfile, MonthlyAttendanceSummary } from '../../types/attendance';
import { ATTENDANCE_EMPLOYEES, calculateMonthSummary, generateMonthAttendance } from '../../data/attendanceData';
import { AttendanceDayModal } from './AttendanceDayModal';
import { cn } from '../../lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface EmployeeAttendanceCalendarProps {
  initialEmployeeId?: string;
  onOpenManualModal?: (emp: { id: string; name: string }) => void;
  sharedDayOverrides?: Record<string, DayAttendance>;
  onSaveDayOverride?: (updatedDay: DayAttendance, empId: string) => void;
  onSelectedEmployeeChange?: (empId: string) => void;
}

export const EmployeeAttendanceCalendar: React.FC<EmployeeAttendanceCalendarProps> = ({
  initialEmployeeId,
  onOpenManualModal,
  sharedDayOverrides = {},
  onSaveDayOverride,
  onSelectedEmployeeChange,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId || ATTENDANCE_EMPLOYEES[0].id);
  const [deptFilter, setDeptFilter] = useState<string>('All');
  
  // Keep in sync with initialEmployeeId if parent updates it
  React.useEffect(() => {
    if (initialEmployeeId && initialEmployeeId !== selectedEmpId) {
      setSelectedEmpId(initialEmployeeId);
    }
  }, [initialEmployeeId]);

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmpId(empId);
    if (onSelectedEmployeeChange) {
      onSelectedEmployeeChange(empId);
    }
  };
  
  // Date state (default to August 2026 or current active date)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIdx, setCurrentMonthIdx] = useState<number>(7); // 7 = August (0-indexed)

  // In-memory overrides store: map of "empId_YYYY-MM-DD" -> DayAttendance
  const [localDayOverrides, setLocalDayOverrides] = useState<Record<string, DayAttendance>>({});
  
  // Merged overrides
  const dayOverrides = useMemo(() => {
    return { ...localDayOverrides, ...sharedDayOverrides };
  }, [localDayOverrides, sharedDayOverrides]);
  
  // Selected day for modal
  const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Current Employee
  const currentEmployee = useMemo(() => {
    return ATTENDANCE_EMPLOYEES.find(e => e.id === selectedEmpId) || ATTENDANCE_EMPLOYEES[0];
  }, [selectedEmpId]);

  // Filtered employees list
  const departments = useMemo(() => {
    const set = new Set(ATTENDANCE_EMPLOYEES.map(e => e.department));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredEmployees = useMemo(() => {
    if (deptFilter === 'All') return ATTENDANCE_EMPLOYEES;
    return ATTENDANCE_EMPLOYEES.filter(e => e.department === deptFilter);
  }, [deptFilter]);

  // Generate month days and merge with any user edits
  const monthDays = useMemo(() => {
    const rawDays = generateMonthAttendance(selectedEmpId, currentYear, currentMonthIdx);
    return rawDays.map(d => {
      const overrideKey = `${selectedEmpId}_${d.date}`;
      if (dayOverrides[overrideKey]) {
        return dayOverrides[overrideKey];
      }
      return d;
    });
  }, [selectedEmpId, currentYear, currentMonthIdx, dayOverrides]);

  // Monthly summary stats
  const summary: MonthlyAttendanceSummary = useMemo(() => {
    return calculateMonthSummary(monthDays, currentYear, currentMonthIdx);
  }, [monthDays, currentYear, currentMonthIdx]);

  // Calendar Grid Padding (First day of month offset)
  const firstDayOfMonth = new Date(currentYear, currentMonthIdx, 1).getDay(); // 0 = Sun, 6 = Sat
  const emptyPaddingDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonthIdx === 0) {
      setCurrentMonthIdx(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIdx(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx === 11) {
      setCurrentMonthIdx(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIdx(prev => prev + 1);
    }
  };

  const handleJumpToCurrent = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear() > 2024 ? now.getFullYear() : 2026);
    setCurrentMonthIdx(now.getMonth());
  };

  const handleSaveDayRecord = (updatedDay: DayAttendance) => {
    const key = `${selectedEmpId}_${updatedDay.date}`;
    setLocalDayOverrides(prev => ({
      ...prev,
      [key]: updatedDay
    }));
    if (onSaveDayOverride) {
      onSaveDayOverride(updatedDay, selectedEmpId);
    }
    setSelectedDay(null);
  };

  // Export PDF Timesheet
  const handleExportPDF = () => {
    const doc = new jsPDF('portrait');

    // Header styling
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 210, 38, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ENERPACK HR - MONTHLY ATTENDANCE STATEMENT', 14, 16);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Period: ${monthNames[currentMonthIdx]} ${currentYear} | Standard Shift: 08:00 AM – 06:00 PM (10 hrs)`, 14, 25);
    doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })}`, 14, 32);

    // Employee Meta box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 44, 182, 28, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${currentEmployee.name} (${currentEmployee.id})`, 18, 52);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Department: ${currentEmployee.department}`, 18, 59);
    doc.text(`Designation: ${currentEmployee.designation}`, 18, 66);

    doc.text(`Working Days: ${summary.workingDays} | Present: ${summary.presentDays}`, 115, 50);
    doc.text(`Late: ${summary.lateDays} | Leaves/Absent: ${summary.leaveDays + summary.absentDays}`, 115, 56);
    doc.text(`Actual OT: ${summary.totalActualOvertimeHoursFormatted || '0h 00m'} | Total OT: ${summary.totalOvertimeHoursFormatted || '0h 00m'}`, 115, 62);
    doc.text(`OT Bonus (₹50/day >4h): ₹${summary.totalOtBonusAmount || 0} (${summary.totalOtBonusDays || 0} days)`, 115, 68);

    // Table Data
    const tableData = monthDays.map(d => {
      // 1. Actual OT
      let actualOt = '—';
      if (d.isDoubleOvertime) {
        actualOt = d.actualOvertimeHours || d.workHours || '10h 00m';
      } else if (d.actualOvertimeHours) {
        actualOt = d.actualOvertimeHours;
      } else if (d.overtimeMinutes && d.overtimeMinutes > 0) {
        const actM = d.actualOvertimeMinutes || d.overtimeMinutes;
        const h = Math.floor(actM / 60);
        const m = actM % 60;
        actualOt = h > 0 ? `${h}h ${m.toString().padStart(2, '0')}m` : `${m}m`;
      }

      // 2. Total OT (Company Credited) - Clean output without formula or multiplier labels
      let totalOt = '—';
      if (d.isDoubleOvertime) {
        const raw = d.doubleOvertimeHours || d.companyOvertimeHours || d.overtimeHours || '20h 00m';
        totalOt = raw.replace(/\s*\(2x\)/gi, '').replace(/\s*2x\s*OT:?\s*/gi, '').trim();
      } else if (d.companyOvertimeHours) {
        totalOt = d.companyOvertimeHours.replace(/\s*\([^)]*\)/g, '').trim();
      } else if (d.overtimeHours) {
        totalOt = d.overtimeHours.replace(/\s*\([^)]*\)/g, '').trim();
      }

      // 3. Clean Remarks (Strictly without company calculation formulas)
      let remarks = 'Normal Punch';
      if (d.isDoubleOvertime) {
        remarks = d.manualReason ? d.manualReason.replace(/\s*\([^)]*Authorized[^)]*\)/gi, '').trim() : (d.notes || 'Holiday Duty (2x OT)');
      } else if (d.isManual) {
        remarks = d.manualReason || 'Manual Adjustment';
      } else if (d.notes) {
        remarks = d.notes;
      }

      return [
        d.date,
        d.dayOfWeek,
        d.status,
        d.checkIn || '—',
        d.checkOut || '—',
        d.workHours || '0h 00m',
        actualOt,
        totalOt,
        (d.otBonus && d.otBonus > 0) || (d.overtimeMinutes && d.overtimeMinutes >= 240) ? `₹${d.otBonus || 50}` : '—',
        remarks
      ];
    });

    autoTable(doc, {
      startY: 78,
      head: [['Date', 'Day', 'Status', 'In Time', 'Out Time', 'Duration', 'Actual OT', 'Total OT', 'OT Bonus', 'Remarks']],
      body: tableData,
      foot: [[
        'TOTAL',
        `${monthDays.length} Days`,
        `${summary.presentDays} Present`,
        '—',
        '—',
        summary.totalWorkHoursFormatted || '0h 00m',
        summary.totalActualOvertimeHoursFormatted || '0h 00m',
        summary.totalOvertimeHoursFormatted || '0h 00m',
        `₹${summary.totalOtBonusAmount || 0}`,
        `${summary.totalOtBonusDays || 0} Bonus Days`
      ]],
      showFoot: 'lastPage',
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 7.8,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 7.2,
        textColor: [51, 65, 85],
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontSize: 7.8,
        fontStyle: 'bold',
        lineWidth: 0.3,
        lineColor: [203, 213, 225]
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          const val = String(data.cell.raw);
          if (val === 'Present') data.cell.styles.textColor = [22, 101, 52];
          else if (val === 'Late') data.cell.styles.textColor = [194, 65, 12];
          else if (val === 'Absent') data.cell.styles.textColor = [185, 28, 28];
          else if (val === 'On Leave') data.cell.styles.textColor = [29, 78, 216];
          else if (val === 'Holiday') data.cell.styles.textColor = [67, 56, 202];
        }
        if ((data.section === 'body' || data.section === 'foot') && data.column.index === 8) {
          const val = String(data.cell.raw);
          if (val.startsWith('₹')) {
            data.cell.styles.textColor = [180, 83, 9]; // amber-700
            data.cell.styles.fontStyle = 'bold';
          }
        }
        if (data.section === 'foot') {
          if (data.column.index === 0 || data.column.index === 5) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [15, 23, 42];
          }
          if (data.column.index === 6) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [30, 41, 59];
          }
          if (data.column.index === 7) {
            data.cell.styles.fontStyle = 'bold';
            data.cell.styles.textColor = [109, 40, 217]; // purple-700
          }
        }
      }
    });

    // Save
    doc.save(`Attendance_${currentEmployee.name.replace(/\s+/g, '_')}_${monthNames[currentMonthIdx]}_${currentYear}.pdf`);
  };

  const getStatusStyle = (day: DayAttendance) => {
    switch (day.status) {
      case 'Present':
        return 'bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-100/70 hover:border-emerald-300';
      case 'Late':
        return 'bg-amber-50/80 border-amber-200 text-amber-950 hover:bg-amber-100/80 hover:border-amber-300';
      case 'Half Day':
        return 'bg-purple-50/70 border-purple-200 text-purple-950 hover:bg-purple-100/70 hover:border-purple-300';
      case 'Absent':
        return 'bg-rose-50/70 border-rose-200 text-rose-950 hover:bg-rose-100/70 hover:border-rose-300';
      case 'On Leave':
        return 'bg-blue-50/70 border-blue-200 text-blue-950 hover:bg-blue-100/70 hover:border-blue-300';
      case 'Holiday':
        return 'bg-indigo-50/80 border-indigo-200 text-indigo-950 hover:bg-indigo-100/80 hover:border-indigo-300';
      case 'Weekend':
        return 'bg-slate-50/60 border-slate-200/80 text-slate-500 hover:bg-slate-100/60';
      default:
        return 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP CONTROLS: EMPLOYEE PICKER & MONTH NAVIGATOR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        {/* Row 1: Employee Select and Department Filter */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-bold text-sm flex items-center justify-center border border-blue-200 shrink-0 shadow-inner">
                {currentEmployee.name.charAt(0)}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Target Employee
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => handleSelectEmployee(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[240px]"
                >
                  {filteredEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) &bull; {emp.department}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department Filter Pills */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setDeptFilter(dept)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                    deptFilter === dept 
                      ? "bg-white text-blue-700 shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Month / Year Navigator */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl p-1 shadow-2xs">
              <button
                onClick={handlePrevMonth}
                title="Previous Month"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Month Dropdown */}
              <select
                value={currentMonthIdx}
                onChange={(e) => setCurrentMonthIdx(Number(e.target.value))}
                className="px-2 py-1 bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {monthNames.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

              {/* Year Dropdown */}
              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="px-2 py-1 bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer border-l border-slate-200"
              >
                {[2025, 2026, 2027].map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>

              <button
                onClick={handleNextMonth}
                title="Next Month"
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleJumpToCurrent}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
            >
              Current
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> PDF Timesheet
            </button>
          </div>
        </div>

        {/* Shift Timing Notice */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Designated Shift: <strong className="text-slate-900 font-mono">08:00 AM – 06:00 PM</strong> (10h Standard Workday)</span>
            <span className="text-slate-400">&bull;</span>
            <span className="text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium">Grace Period: ≤ 08:15 AM</span>
          </div>
          <div className="text-slate-400 font-medium">
            Click any day to view detailed punch breakdown or log manual adjustments.
          </div>
        </div>
      </div>

      {/* MONTHLY KPI SUMMARY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Attendance Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Monthly Score</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{summary.attendancePercentage}%</span>
          </div>
          <span className={cn(
            "text-[10px] font-bold mt-1 inline-block",
            summary.attendancePercentage >= 95 ? "text-emerald-600" : summary.attendancePercentage >= 85 ? "text-amber-600" : "text-rose-600"
          )}>
            {summary.attendancePercentage >= 95 ? 'Excellent Rating' : 'Needs Attention'}
          </span>
        </div>

        {/* Working Days */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Working Days</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{summary.workingDays}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Excl. {summary.weekendDays} Weekends</span>
        </div>

        {/* Present (On Time) */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-xs bg-emerald-50/20">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block mb-1">Present (On Time)</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono tracking-tight">{summary.presentDays}</span>
          <span className="text-[10px] text-emerald-600 font-medium block mt-1">Shift ≤ 08:15 AM</span>
        </div>

        {/* Late Arrivals */}
        <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-xs bg-amber-50/20">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block mb-1">Late Punches</span>
          <span className="text-2xl font-bold text-amber-700 font-mono tracking-tight">{summary.lateDays}</span>
          <span className="text-[10px] text-amber-600 font-medium block mt-1">Grace exceeded</span>
        </div>

        {/* Leaves & Absences */}
        <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-xs bg-rose-50/20">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest block mb-1">Leaves / Absent</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-rose-700 font-mono tracking-tight">{summary.leaveDays + summary.absentDays}</span>
            <span className="text-[10px] text-slate-400">({summary.leaveDays}L / {summary.absentDays}A)</span>
          </div>
          <span className="text-[10px] text-rose-600 font-medium block mt-1">Half Days: {summary.halfDays}</span>
        </div>

        {/* Total Hours Logged */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Hours</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{summary.totalWorkHoursFormatted}</span>
          <span className="text-[10px] text-slate-400 block mt-1">Avg: {summary.avgDailyHoursFormatted}/day</span>
        </div>

        {/* Overtime Logged */}
        <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs bg-purple-50/20">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-widest block mb-1">Total Overtime</span>
          <span className="text-2xl font-bold text-purple-700 font-mono tracking-tight">{summary.totalOvertimeHoursFormatted}</span>
          <span className="text-[10px] text-purple-700 font-semibold block mt-1">
            Actual OT: <strong className="font-mono text-purple-900">{summary.totalActualOvertimeHoursFormatted || '0h 00m'}</strong> (×1.5)
          </span>
        </div>

        {/* OT Bonus Card */}
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs bg-amber-50/30">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block mb-1">OT Bonus (₹50)</span>
          <span className="text-2xl font-bold text-amber-700 font-mono tracking-tight">₹{summary.totalOtBonusAmount || 0}</span>
          <span className="text-[10px] text-amber-800 font-medium block mt-1">{summary.totalOtBonusDays || 0} days (&gt;4h OT)</span>
        </div>
      </div>

      {/* CALENDAR GRID */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Calendar Header Bar */}
        <div className="p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {monthNames[currentMonthIdx]} {currentYear} &bull; Attendance Grid
              </h2>
              <p className="text-xs text-slate-300 font-medium">
                {currentEmployee.name} &bull; {currentEmployee.department} ({currentEmployee.id})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenManualModal?.({ id: currentEmployee.id, name: currentEmployee.name })}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileEdit className="w-3.5 h-3.5" /> Log Manual Punch
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="overflow-x-auto custom-scrollbar">
          <div className="min-w-[620px] sm:min-w-full">
            <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/80 text-center font-bold text-xs uppercase tracking-widest text-slate-500 py-3">
          <div className="text-rose-600">Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div className="text-slate-400">Sat</div>
        </div>

        {/* 7-Column Days Grid */}
        <div className="grid grid-cols-7 gap-px bg-slate-200 p-px">
          {/* Empty offset days for beginning of month */}
          {emptyPaddingDays.map((_, i) => (
            <div key={`empty-${i}`} className="bg-slate-50/40 min-h-[110px] p-2 select-none"></div>
          ))}

          {/* Actual Month Days */}
          {monthDays.map((day) => {
            const isToday = 
              new Date().getDate() === day.dayNumber &&
              new Date().getMonth() === currentMonthIdx &&
              new Date().getFullYear() === currentYear;

            return (
              <div
                key={day.date}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "min-h-[115px] p-2.5 bg-white transition-all cursor-pointer flex flex-col justify-between group relative border",
                  getStatusStyle(day),
                  isToday && "ring-2 ring-blue-500 ring-offset-1 z-10 font-semibold"
                )}
              >
                {/* Top Cell Row: Day Number + Status Badge */}
                <div className="flex items-start justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      isToday 
                        ? "bg-blue-600 text-white shadow-xs" 
                        : day.isWeekend 
                        ? "text-slate-400" 
                        : "text-slate-900"
                    )}>
                      {day.dayNumber}
                    </span>
                    {isToday && (
                      <span className="text-[9px] font-bold text-blue-600 uppercase bg-blue-100 px-1 py-0.2 rounded">Today</span>
                    )}
                  </div>

                  {/* Status Indicator Pill */}
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border leading-none shrink-0",
                    day.status === 'Present' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                    day.status === 'Late' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                    day.status === 'Half Day' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                    day.status === 'Absent' ? 'bg-rose-100 text-rose-800 border-rose-200' :
                    day.status === 'On Leave' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    day.status === 'Holiday' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
                    'bg-slate-100 text-slate-500 border-slate-200'
                  )}>
                    {day.status}
                  </span>
                </div>

                {/* Middle Content: Punch Timestamps or Holiday Name */}
                <div className="my-1.5 space-y-1">
                  {day.isHoliday && !day.isDoubleOvertime ? (
                    <div className="text-[11px] font-semibold text-indigo-900 leading-snug line-clamp-2">
                      🎉 {day.holidayName}
                    </div>
                  ) : day.isWeekend && !day.isDoubleOvertime ? (
                    <div className="text-[11px] text-slate-400 font-medium">
                      {day.dayOfWeek === 'Sun' ? 'Sunday Off' : 'Saturday Off'}
                    </div>
                  ) : day.status === 'On Leave' || day.status === 'Absent' ? (
                    <div className="text-[11px] font-medium text-slate-600">
                      {day.manualReason || (day.status === 'On Leave' ? 'Approved Leave' : 'Unexcused Absence')}
                    </div>
                  ) : (
                    <>
                      {day.isHoliday && (
                        <div className="text-[10px] font-bold text-indigo-950 truncate flex items-center gap-1">
                          🎉 {day.holidayName}
                        </div>
                      )}

                      {/* Check-In / Out Times */}
                      <div className="text-[11px] font-mono font-medium text-slate-700 flex items-center justify-between">
                        <span>{day.checkIn || '—'}</span>
                        <span className="text-slate-300">&rarr;</span>
                        <span>{day.checkOut || '—'}</span>
                      </div>

                      {/* Work Duration and Overtime */}
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-mono font-bold text-slate-900">{day.workHours}</span>
                          {day.isDoubleOvertime ? (
                            <span className="text-[9px] font-extrabold text-purple-800 bg-purple-100 px-1 py-0.2 rounded border border-purple-300">
                              ⚡ 2x OT
                            </span>
                          ) : day.overtimeHours ? (
                            <span className="text-[9px] font-bold text-purple-700 bg-purple-100/70 px-1 py-0.2 rounded">
                              +{day.overtimeHours}
                            </span>
                          ) : null}
                          {day.lateMinutes && day.lateMinutes > 0 ? (
                            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded">
                              +{day.lateMinutes}m Late
                            </span>
                          ) : null}
                        </div>
                        {((day.otBonus && day.otBonus > 0) || (day.overtimeMinutes && day.overtimeMinutes >= 240)) ? (
                          <div className="flex items-center justify-between text-[9px] font-extrabold text-amber-900 bg-amber-100/80 px-1.5 py-0.5 rounded border border-amber-200">
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5 text-amber-600" /> +₹{day.otBonus || 50}
                            </span>
                            <span className="text-[8px] uppercase tracking-wider font-bold text-amber-800">&gt;4h OT</span>
                          </div>
                        ) : null}
                      </div>
                    </>
                  )}
                </div>

                {/* Bottom Row: Location icon + Manual badge */}
                <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-100/60">
                  {day.type && (
                    <span className="flex items-center gap-1 font-medium">
                      {day.type === 'Office' && <Building className="w-3 h-3 text-slate-400" />}
                      {day.type === 'Remote' && <Laptop className="w-3 h-3 text-blue-500" />}
                      {day.type === 'Field' && <Briefcase className="w-3 h-3 text-amber-500" />}
                      {day.type === 'On Duty' && <UserCheck className="w-3 h-3 text-emerald-500" />}
                      {day.type}
                    </span>
                  )}
                  {day.isManual && (
                    <span className="text-amber-700 font-bold bg-amber-100/80 px-1 py-0.2 rounded" title="Manually Adjusted Record">
                      Manual [M]
                    </span>
                  )}
                </div>
              </div>
            );
          })}
            </div>
          </div>
        </div>

        {/* Legend Bar */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-4">
            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Status Key:</span>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
              <span className="text-slate-600 font-medium">Present (08:00 AM - 06:00 PM)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-amber-500"></span>
              <span className="text-slate-600 font-medium">Late Arrival (&gt; 08:15 AM)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              <span className="text-slate-600 font-medium">Half Day (5h)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500"></span>
              <span className="text-slate-600 font-medium">Absent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-slate-600 font-medium">On Leave (CL/SL/PL)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-indigo-500"></span>
              <span className="text-slate-600 font-medium">Public Holiday</span>
            </div>
          </div>

          <div className="text-slate-500 text-[11px] font-mono">
            Standard Shift = 10 Hours &bull; Grace = 15 Mins
          </div>
        </div>
      </div>

      {/* DAY DETAIL & EDIT MODAL */}
      <AttendanceDayModal
        day={selectedDay}
        employee={currentEmployee}
        isOpen={!!selectedDay}
        onClose={() => setSelectedDay(null)}
        onSaveDayRecord={handleSaveDayRecord}
      />
    </div>
  );
};

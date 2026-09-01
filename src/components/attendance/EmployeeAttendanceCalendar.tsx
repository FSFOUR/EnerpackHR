import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, 
  Clock, CheckCircle2, AlertCircle, AlertTriangle, Building, 
  Laptop, Briefcase, UserCheck, FileEdit, Download, Filter, 
  Sparkles, Check, Info, ArrowUpRight, TrendingUp, ShieldCheck,
  LayoutList, LayoutGrid, Zap
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
  const [viewMode, setViewMode] = useState<'week' | 'list' | 'grid'>('week');
  const [listFilter, setListFilter] = useState<'all' | 'working' | 'overtime' | 'leaves'>('all');
  const [selectedWeekIdx, setSelectedWeekIdx] = useState<number>(1); // Default to Week 2 containing standard workdays or first full week
  
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

  // Group month days into Calendar Weeks (Sunday to Saturday)
  const weeks = useMemo(() => {
    const result: {
      weekIndex: number;
      weekLabel: string;
      dateRange: string;
      days: DayAttendance[];
    }[] = [];

    let currentWeekDays: DayAttendance[] = [];
    let weekCounter = 1;

    monthDays.forEach((day, index) => {
      currentWeekDays.push(day);
      if (day.dayOfWeek === 'Sat' || index === monthDays.length - 1) {
        const firstDay = currentWeekDays[0];
        const lastDay = currentWeekDays[currentWeekDays.length - 1];
        result.push({
          weekIndex: weekCounter - 1,
          weekLabel: `Week ${weekCounter}`,
          dateRange: `${monthNames[currentMonthIdx].slice(0, 3)} ${firstDay.dayNumber < 10 ? '0' + firstDay.dayNumber : firstDay.dayNumber} – ${lastDay.dayNumber < 10 ? '0' + lastDay.dayNumber : lastDay.dayNumber}`,
          days: currentWeekDays,
        });
        currentWeekDays = [];
        weekCounter++;
      }
    });

    return result;
  }, [monthDays, currentMonthIdx, monthNames]);

  // Safe active week index
  const safeWeekIdx = Math.min(Math.max(0, selectedWeekIdx), Math.max(0, weeks.length - 1));
  const activeWeek = weeks[safeWeekIdx] || weeks[0] || { weekIndex: 0, weekLabel: 'Week 1', dateRange: '', days: [] };

  // Summary for currently selected week
  const activeWeekSummary = useMemo(() => {
    if (!activeWeek || !activeWeek.days) {
      return { present: 0, late: 0, otHours: 0, totalHoursFormatted: '0h 00m', leaves: 0, otBonus: 0, daysCount: 0 };
    }
    let present = 0;
    let late = 0;
    let otMins = 0;
    let workMins = 0;
    let leaves = 0;
    let otBonus = 0;

    activeWeek.days.forEach(d => {
      if (d.status === 'Present' || d.status === 'Late' || d.status === 'Half Day' || d.isDoubleOvertime) {
        present++;
        if (d.status === 'Late') late++;
        if (d.overtimeMinutes) otMins += d.overtimeMinutes;
        if (d.otBonus) otBonus += d.otBonus;
        
        const hMatch = d.workHours.match(/(\d+)h/);
        const mMatch = d.workHours.match(/(\d+)m/);
        const hours = hMatch ? parseInt(hMatch[1]) : 0;
        const mins = mMatch ? parseInt(mMatch[1]) : 0;
        workMins += (hours * 60) + mins;
      } else if (d.status === 'On Leave' || d.status === 'Absent') {
        leaves++;
      }
    });

    const totH = Math.floor(workMins / 60);
    const totM = workMins % 60;
    const otH = (otMins / 60).toFixed(1);

    return {
      present,
      late,
      otHours: parseFloat(otH),
      totalHoursFormatted: `${totH}h ${totM < 10 ? '0' + totM : totM}m`,
      leaves,
      otBonus,
      daysCount: activeWeek.days.length
    };
  }, [activeWeek]);

  // Monthly summary stats
  const summary: MonthlyAttendanceSummary = useMemo(() => {
    return calculateMonthSummary(monthDays, currentYear, currentMonthIdx);
  }, [monthDays, currentYear, currentMonthIdx]);

  // Filtered month days for list view
  const filteredMonthDays = useMemo(() => {
    if (listFilter === 'working') {
      return monthDays.filter(d => d.status === 'Present' || d.status === 'Late' || d.status === 'Half Day' || d.isDoubleOvertime);
    }
    if (listFilter === 'overtime') {
      return monthDays.filter(d => (d.overtimeMinutes && d.overtimeMinutes > 0) || d.isDoubleOvertime || (d.otBonus && d.otBonus > 0));
    }
    if (listFilter === 'leaves') {
      return monthDays.filter(d => d.status === 'On Leave' || d.status === 'Absent' || d.status === 'Holiday' || (d.isWeekend && !d.isDoubleOvertime));
    }
    return monthDays;
  }, [monthDays, listFilter]);

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

      // 2. Clean Remarks (Strictly without internal formula noise)
      let remarks = 'Normal Punch';
      if (d.isDoubleOvertime) {
        remarks = d.manualReason ? d.manualReason.replace(/\s*\([^)]*Authorized[^)]*\)/gi, '').trim() : (d.notes || 'Holiday / Sunday Duty (2x OT)');
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
        (d.otBonus && d.otBonus > 0) || (d.overtimeMinutes && d.overtimeMinutes >= 240) ? `₹${d.otBonus || 50}` : '—',
        remarks
      ];
    });

    // 1. Main Daily Attendance Table (Total OT column removed from daily rows)
    autoTable(doc, {
      startY: 78,
      margin: { left: 14, right: 14 },
      head: [['Date', 'Day', 'Status', 'In Time', 'Out Time', 'Duration', 'Actual OT', 'OT Bonus', 'Remarks']],
      body: tableData,
      foot: [[
        'TOTAL',
        `${monthDays.length} Days`,
        `${summary.presentDays} Present`,
        '—',
        '—',
        summary.totalWorkHoursFormatted || '0h 00m',
        summary.totalActualOvertimeHoursFormatted || '0h 00m',
        `₹${summary.totalOtBonusAmount || 0}`,
        `${summary.totalOtBonusDays || 0} Bonus Days`
      ]],
      showFoot: 'lastPage',
      theme: 'grid',
      styles: {
        fontSize: 7.2,
        cellPadding: { top: 2, bottom: 2, left: 1.5, right: 1.5 },
        valign: 'middle',
        overflow: 'ellipsize',
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 7.5,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        textColor: [51, 65, 85],
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontSize: 7.5,
        fontStyle: 'bold',
        lineWidth: 0.3,
        lineColor: [203, 213, 225],
        halign: 'center',
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 19, halign: 'center' }, // Date
        1: { cellWidth: 10, halign: 'center' }, // Day
        2: { cellWidth: 16, halign: 'center' }, // Status
        3: { cellWidth: 14, halign: 'center' }, // In Time
        4: { cellWidth: 14, halign: 'center' }, // Out Time
        5: { cellWidth: 17, halign: 'center' }, // Duration
        6: { cellWidth: 17, halign: 'center' }, // Actual OT
        7: { cellWidth: 15, halign: 'center' }, // OT Bonus
        8: { cellWidth: 60, halign: 'left' }   // Remarks
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
        if ((data.section === 'body' || data.section === 'foot') && data.column.index === 7) {
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
            data.cell.styles.textColor = [180, 83, 9]; // amber-700
          }
        }
      }
    });

    // 2. Bottom Total OT Summary (Actual OT, Total OT, Sunday & Holiday OT, Total Overtime, and OT Bonus)
    const mainTableFinalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 6 : 220;

    autoTable(doc, {
      startY: mainTableFinalY,
      margin: { left: 14, right: 14 },
      head: [[
        'Actual OT',
        'Total OT',
        'Sunday & Holiday OT',
        'Total Overtime',
        'OT Bonus'
      ]],
      body: [
        [
          summary.totalActualOvertimeHoursFormatted || '0h 00m',
          summary.weekdayCreditedOtHoursFormatted || '0h 00m',
          summary.sundayHolidayCreditedOtHoursFormatted || '0h 00m',
          summary.totalOvertimeHoursFormatted || '0h 00m',
          `₹${summary.totalOtBonusAmount || 0}`
        ]
      ],
      theme: 'grid',
      styles: {
        valign: 'middle',
        halign: 'center',
        cellPadding: { top: 3.5, bottom: 3.5, left: 1, right: 1 },
        overflow: 'visible',
      },
      headStyles: {
        fillColor: [15, 23, 42],
        textColor: 255,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8.8,
        fontStyle: 'bold',
        textColor: [15, 23, 42],
        halign: 'center',
      },
      columnStyles: {
        0: { cellWidth: 32, halign: 'center' }, // Actual OT
        1: { cellWidth: 32, halign: 'center' }, // Total OT (1.5x)
        2: { cellWidth: 46, halign: 'center' }, // Sunday & Holiday OT (2.0x)
        3: { cellWidth: 40, halign: 'center' }, // Total Overtime (Grand Total)
        4: { cellWidth: 32, halign: 'center' }  // OT Bonus
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          // Column 0: Actual OT
          if (data.column.index === 0) {
            data.cell.styles.textColor = [51, 65, 85]; // slate-700
          }
          // Column 1: Total OT (*1.5)
          else if (data.column.index === 1) {
            data.cell.styles.textColor = [30, 41, 59]; // slate-800
          }
          // Column 2: Sunday & Holiday OT (*2)
          else if (data.column.index === 2) {
            data.cell.styles.textColor = [109, 40, 217]; // purple-700
          }
          // Column 3: Total Overtime (Grand Total highlight)
          else if (data.column.index === 3) {
            data.cell.styles.fillColor = [241, 245, 249];
            data.cell.styles.textColor = [109, 40, 217]; // purple-700
            data.cell.styles.fontSize = 9.2;
          }
          // Column 4: OT Bonus
          else if (data.column.index === 4) {
            data.cell.styles.textColor = [180, 83, 9]; // amber-700
          }
        }
      }
    });

    // 3. Official Signature & Verification Sign-off block
    const summaryFinalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 8 : 265;
    let signY = summaryFinalY;

    if (signY > 268) {
      doc.addPage();
      signY = 22;
    }

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Verification: Computed in strict accordance with Enerpack HR Overtime Regulations (10h Shift, Weekday OT ×1.5, Sunday/Holiday OT ×2.0, OT Bonus ₹50 >4h).', 14, signY);

    signY += 12;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, signY, 65, signY);
    doc.line(78, signY, 130, signY);
    doc.line(144, signY, 196, signY);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text('Employee Signature', 14, signY + 4);
    doc.text('HR & Payroll Officer', 78, signY + 4);
    doc.text('Authorized Signatory (Director)', 144, signY + 4);

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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 sm:gap-3">
        {/* Attendance Rate */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs overflow-hidden min-w-0 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 truncate">Monthly Score</span>
          <div className="flex items-baseline gap-1 overflow-hidden">
            <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight truncate">{summary.attendancePercentage}%</span>
          </div>
          <span className={cn(
            "text-[10px] font-bold mt-1 block truncate",
            summary.attendancePercentage >= 95 ? "text-emerald-600" : summary.attendancePercentage >= 85 ? "text-amber-600" : "text-rose-600"
          )}>
            {summary.attendancePercentage >= 95 ? 'Excellent Rating' : 'Needs Attention'}
          </span>
        </div>

        {/* Working Days */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs overflow-hidden min-w-0 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 truncate">Working Days</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight truncate">{summary.workingDays}</span>
          <span className="text-[10px] text-slate-400 block mt-1 truncate">Excl. {summary.weekendDays} Weekends</span>
        </div>

        {/* Present (On Time) */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-3 sm:p-4 shadow-xs bg-emerald-50/20 overflow-hidden min-w-0 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block mb-1 truncate">Present</span>
          <span className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono tracking-tight truncate">{summary.presentDays}</span>
          <span className="text-[10px] text-emerald-600 font-medium block mt-1 truncate">Shift ≤ 08:15 AM</span>
        </div>

        {/* Late Arrivals */}
        <div className="bg-white rounded-2xl border border-amber-100 p-3 sm:p-4 shadow-xs bg-amber-50/20 overflow-hidden min-w-0 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block mb-1 truncate">Late Punches</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-700 font-mono tracking-tight truncate">{summary.lateDays}</span>
          <span className="text-[10px] text-amber-600 font-medium block mt-1 truncate">Grace exceeded</span>
        </div>

        {/* Leaves & Absences */}
        <div className="bg-white rounded-2xl border border-rose-100 p-3 sm:p-4 shadow-xs bg-rose-50/20 overflow-hidden min-w-0 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest block mb-1 truncate">Leaves / Absent</span>
          <div className="flex items-baseline gap-1 overflow-hidden">
            <span className="text-xl sm:text-2xl font-bold text-rose-700 font-mono tracking-tight truncate">{summary.leaveDays + summary.absentDays}</span>
            <span className="text-[10px] text-slate-400 truncate">({summary.leaveDays}L/{summary.absentDays}A)</span>
          </div>
          <span className="text-[10px] text-rose-600 font-medium block mt-1 truncate">Half: {summary.halfDays}</span>
        </div>

        {/* Total Hours Logged */}
        <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 shadow-xs overflow-hidden min-w-0 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 truncate">Total Hours</span>
          <span className="text-xl sm:text-2xl font-bold text-slate-900 font-mono tracking-tight truncate">{summary.totalWorkHoursFormatted}</span>
          <span className="text-[10px] text-slate-400 block mt-1 truncate">Avg: {summary.avgDailyHoursFormatted}/d</span>
        </div>

        {/* Overtime Logged */}
        <div className="bg-white rounded-2xl border border-purple-100 p-3 sm:p-4 shadow-xs bg-purple-50/20 overflow-hidden min-w-0 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-widest block mb-1 truncate">Total Overtime</span>
          <span className="text-xl sm:text-2xl font-bold text-purple-700 font-mono tracking-tight truncate">{summary.totalOvertimeHoursFormatted}</span>
          <span className="text-[10px] text-purple-700 font-semibold block mt-1 truncate">
            OT: <strong className="font-mono text-purple-900">{summary.totalActualOvertimeHoursFormatted || '0h 00m'}</strong> (×1.5)
          </span>
        </div>

        {/* OT Bonus Card */}
        <div className="bg-white rounded-2xl border border-amber-200 p-3 sm:p-4 shadow-xs bg-amber-50/30 overflow-hidden min-w-0 flex flex-col justify-between">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block mb-1 truncate">OT Bonus</span>
          <span className="text-xl sm:text-2xl font-bold text-amber-700 font-mono tracking-tight truncate">₹{summary.totalOtBonusAmount || 0}</span>
          <span className="text-[10px] text-amber-800 font-medium block mt-1 truncate">{summary.totalOtBonusDays || 0}d (&gt;4h OT)</span>
        </div>
      </div>

      {/* CALENDAR & LIST CONTAINER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
        {/* Calendar Header Bar */}
        <div className="p-3.5 sm:p-4 bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-white leading-tight">
                  {monthNames[currentMonthIdx]} {currentYear} &bull; Attendance
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-300 font-medium truncate max-w-[200px] xs:max-w-xs sm:max-w-none">
                  {currentEmployee.name} &bull; {currentEmployee.department} ({currentEmployee.id})
                </p>
              </div>
            </div>

            {/* View Switcher Segmented Control */}
            <div className="flex bg-slate-800 p-0.5 rounded-xl border border-slate-700/80 shrink-0">
              <button
                onClick={() => setViewMode('week')}
                title="1-Week Screen (No Scroll)"
                className={cn(
                  "px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                  viewMode === 'week' 
                    ? "bg-blue-600 text-white shadow-2xs" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase tracking-wider">1-Week</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                title="Full Month List"
                className={cn(
                  "px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer",
                  viewMode === 'list' 
                    ? "bg-blue-600 text-white shadow-2xs" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                <LayoutList className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase tracking-wider">Month</span>
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Monthly Calendar Grid"
                className={cn(
                  "hidden md:flex px-2.5 py-1 text-xs font-bold rounded-lg transition-all items-center gap-1.5 cursor-pointer",
                  viewMode === 'grid' 
                    ? "bg-blue-600 text-white shadow-2xs" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px] uppercase tracking-wider">Grid</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenManualModal?.({ id: currentEmployee.id, name: currentEmployee.name })}
              className="w-full sm:w-auto px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px] sm:min-h-0"
            >
              <FileEdit className="w-3.5 h-3.5" /> Log Manual Punch
            </button>
          </div>
        </div>

        {/* 1-WEEK VIEW (Fits completely in a mobile screen without scrolling) */}
        {viewMode === 'week' && (
          <div className="flex flex-col bg-white">
            {/* Week Navigation & Selector Bar */}
            <div className="p-2.5 sm:p-3 bg-slate-50 border-b border-slate-200 flex flex-col xs:flex-row items-center justify-between gap-2">
              <div className="flex items-center gap-2 w-full xs:w-auto justify-between xs:justify-start">
                <button
                  onClick={() => setSelectedWeekIdx(prev => Math.max(0, prev - 1))}
                  disabled={safeWeekIdx === 0}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 transition-all cursor-pointer shadow-2xs"
                  title="Previous Week"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="text-center xs:text-left">
                  <span className="text-xs sm:text-sm font-bold text-slate-900 block leading-tight">
                    {activeWeek.weekLabel} &bull; {activeWeek.dateRange}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {monthNames[currentMonthIdx]} {currentYear}
                  </span>
                </div>

                <button
                  onClick={() => setSelectedWeekIdx(prev => Math.min(weeks.length - 1, prev + 1))}
                  disabled={safeWeekIdx >= weeks.length - 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed text-slate-700 transition-all cursor-pointer shadow-2xs"
                  title="Next Week"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Week Jump Pills */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {weeks.map((w, idx) => (
                  <button
                    key={`w-${idx}`}
                    onClick={() => setSelectedWeekIdx(idx)}
                    className={cn(
                      "px-2 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap",
                      safeWeekIdx === idx
                        ? "bg-blue-600 text-white shadow-2xs"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    )}
                  >
                    W{idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Week Quick Stats Summary Bar */}
            <div className="px-3 py-2 bg-blue-50/60 border-b border-blue-100/80 flex flex-wrap items-center justify-between gap-y-1.5 gap-x-3 text-[11px] text-slate-700 font-medium overflow-hidden">
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span className="flex items-center gap-1 font-bold text-blue-900 shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{activeWeekSummary.present} Worked</span>
                </span>
                <span className="text-slate-300 hidden xs:inline">&bull;</span>
                <span className="shrink-0">Hours: <strong className="font-mono text-slate-900">{activeWeekSummary.totalHoursFormatted}</strong></span>
                <span className="text-slate-300 hidden xs:inline">&bull;</span>
                <span className="shrink-0">OT: <strong className="font-mono text-purple-700">+{activeWeekSummary.otHours}h</strong></span>
              </div>
              {activeWeekSummary.otBonus > 0 && (
                <span className="shrink-0 flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded border border-amber-200 truncate">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600 shrink-0" /> +₹{activeWeekSummary.otBonus} OT Bonus
                </span>
              )}
            </div>

            {/* Compact 7-Day List (Fits on single screen with zero vertical scrolling) */}
            <div className="p-2 sm:p-2.5 space-y-1.5 bg-slate-50/40 overflow-hidden">
              {activeWeek.days.map((day) => {
                const isToday = 
                  new Date().getDate() === day.dayNumber &&
                  new Date().getMonth() === currentMonthIdx &&
                  new Date().getFullYear() === currentYear;

                return (
                  <div
                    key={day.date}
                    onClick={() => setSelectedDay(day)}
                    className={cn(
                      "flex items-center justify-between p-2 sm:p-2.5 rounded-xl border transition-all cursor-pointer group shadow-2xs hover:shadow-xs overflow-hidden min-w-0 gap-1.5 sm:gap-2.5",
                      day.isHoliday ? "bg-indigo-50/40 border-indigo-200/80" :
                      day.dayOfWeek === 'Sun' ? "bg-rose-50/30 border-rose-100" :
                      day.isWeekend && !day.isDoubleOvertime ? "bg-slate-100/60 border-slate-200/80 text-slate-500" :
                      day.status === 'Present' ? "bg-white border-slate-200 hover:border-blue-300" :
                      day.status === 'Late' ? "bg-amber-50/30 border-amber-200" :
                      day.status === 'Half Day' ? "bg-purple-50/30 border-purple-200" :
                      day.status === 'On Leave' ? "bg-blue-50/30 border-blue-200" :
                      "bg-white border-slate-200",
                      isToday && "ring-2 ring-blue-500 bg-blue-50/40 font-semibold"
                    )}
                  >
                    {/* 1. Date & Day Pill */}
                    <div className="flex items-center gap-1.5 shrink-0 min-w-0">
                      <div className={cn(
                        "w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex flex-col items-center justify-center font-bold text-center border shrink-0",
                        isToday ? "bg-blue-600 text-white border-blue-700 shadow-2xs" :
                        day.isHoliday ? "bg-indigo-100 text-indigo-900 border-indigo-200" :
                        day.dayOfWeek === 'Sun' ? "bg-rose-100 text-rose-800 border-rose-200" :
                        day.isWeekend ? "bg-slate-100 text-slate-600 border-slate-200" :
                        "bg-slate-100 text-slate-800 border-slate-200"
                      )}>
                        <span className="text-[9px] uppercase font-bold tracking-wider leading-none">{day.dayOfWeek}</span>
                        <span className="text-xs font-extrabold leading-none mt-0.5">{day.dayNumber < 10 ? `0${day.dayNumber}` : day.dayNumber}</span>
                      </div>
                      {isToday && (
                        <span className="hidden sm:inline text-[9px] font-extrabold text-blue-600 bg-blue-100 px-1 py-0.2 rounded uppercase shrink-0">
                          Today
                        </span>
                      )}
                    </div>

                    {/* 2. Middle Content (Timestamps & Hours or Rest Day) */}
                    <div className="flex-1 min-w-0 overflow-hidden px-1">
                      {day.isHoliday && !day.isDoubleOvertime ? (
                        <div className="text-[11px] sm:text-xs font-semibold text-indigo-900 truncate">
                          🎉 {day.holidayName}
                        </div>
                      ) : day.isWeekend && !day.isDoubleOvertime ? (
                        <div className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
                          {day.dayOfWeek === 'Sun' ? 'Sunday Off — Weekly Rest' : 'Saturday Off — Weekend'}
                        </div>
                      ) : day.status === 'On Leave' || day.status === 'Absent' ? (
                        <div className="text-[11px] sm:text-xs text-slate-600 font-medium truncate">
                          {day.status === 'On Leave' ? `Leave: ${day.manualReason || 'Casual / Sick Leave'}` : 'Unexcused Absence'}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-1 sm:gap-2 min-w-0 overflow-hidden">
                          {/* Check-In / Out Times */}
                          <div className="flex items-center gap-1 font-mono text-[10px] xs:text-[11px] sm:text-xs text-slate-700 shrink-0 truncate">
                            <span className={cn(day.status === 'Late' ? "text-amber-700 font-bold" : "text-slate-800")}>
                              {day.checkIn || '—'}
                            </span>
                            <span className="text-slate-300">&rarr;</span>
                            <span className="text-slate-800">{day.checkOut || '—'}</span>
                          </div>

                          {/* Work Duration and Overtime */}
                          <div className="flex items-center gap-1 shrink-0 overflow-hidden">
                            <span className="font-mono text-[10px] xs:text-[11px] sm:text-xs font-bold text-slate-900 whitespace-nowrap">{day.workHours}</span>
                            {day.isDoubleOvertime ? (
                              <span className="text-[8px] xs:text-[9px] font-extrabold text-purple-800 bg-purple-100 px-1 py-0.2 rounded border border-purple-200 whitespace-nowrap">
                                2x OT
                              </span>
                            ) : day.overtimeHours ? (
                              <span className="text-[8px] xs:text-[9px] font-bold text-purple-700 bg-purple-50 px-1 py-0.2 rounded whitespace-nowrap">
                                +{day.overtimeHours}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 3. Status Pill & Edit Pencil Icon */}
                    <div className="flex items-center gap-1 shrink-0">
                      <span className={cn(
                        "px-1.5 py-0.5 rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border leading-tight text-center truncate max-w-[58px] xs:max-w-[70px] sm:max-w-none",
                        day.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        day.status === 'Late' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                        day.status === 'Half Day' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                        day.status === 'On Leave' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                        day.status === 'Holiday' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                        day.status === 'Weekend' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      )}>
                        {day.status === 'Weekend' ? (day.dayOfWeek === 'Sun' ? 'Sun Off' : 'Sat Off') : day.status}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDay(day);
                        }}
                        title="Edit Punch"
                        className="p-1 sm:p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer shrink-0"
                      >
                        <FileEdit className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LIST VIEW (Mobile-Optimized Vertical Cards) */}
        {viewMode === 'list' && (
          <div>
            {/* List Filter Tabs with horizontal smooth touch scrolling */}
            <div className="px-3 sm:px-4 border-b border-slate-100 bg-slate-50/50 flex overflow-x-auto custom-scrollbar no-scrollbar gap-1.5 sm:gap-2 pt-2 scroll-smooth">
              {[
                { id: 'all', label: 'All Days', count: monthDays.length },
                { id: 'working', label: 'Worked / Punched', count: summary.presentDays + summary.lateDays + summary.halfDays },
                { id: 'overtime', label: 'Overtime Days', count: monthDays.filter(d => (d.overtimeMinutes && d.overtimeMinutes > 0) || d.isDoubleOvertime).length },
                { id: 'leaves', label: 'Leaves & Off', count: summary.leaveDays + summary.absentDays + summary.weekendDays + summary.holidayDays },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setListFilter(tab.id as any)}
                  className={cn(
                    "px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider rounded-t-lg transition-all border-b-2 flex items-center gap-1.5 cursor-pointer shrink-0 whitespace-nowrap",
                    listFilter === tab.id
                      ? "border-blue-600 text-blue-600 bg-white shadow-2xs"
                      : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/70"
                  )}
                >
                  <span>{tab.label}</span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[9px] font-mono",
                    listFilter === tab.id ? "bg-blue-100 text-blue-700" : "bg-slate-200 text-slate-600"
                  )}>
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>

            {/* List Body */}
            <div className="p-3 sm:p-4 space-y-3 bg-slate-50/40">
              {filteredMonthDays.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
                  <Clock className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  <p className="font-semibold text-slate-600">No attendance days match filter</p>
                  <p className="text-xs text-slate-400 mt-0.5">Try selecting "All Days".</p>
                </div>
              ) : (
                filteredMonthDays.map((day) => {
                  const isToday = 
                    new Date().getDate() === day.dayNumber &&
                    new Date().getMonth() === currentMonthIdx &&
                    new Date().getFullYear() === currentYear;

                  const isNonWorking = day.isWeekend || day.isHoliday || day.status === 'On Leave' || day.status === 'Absent';

                  return (
                    <div 
                      key={day.date}
                      onClick={() => setSelectedDay(day)}
                      className={cn(
                        "rounded-2xl border p-3.5 sm:p-4 shadow-2xs hover:shadow-xs transition-all space-y-3 cursor-pointer group",
                        day.isHoliday ? "bg-indigo-50/30 border-indigo-200/80" :
                        day.isWeekend && !day.isDoubleOvertime ? "bg-slate-50/70 border-slate-200/80 text-slate-500" :
                        day.status === 'Present' ? "bg-white border-slate-200/90" :
                        day.status === 'Late' ? "bg-amber-50/20 border-amber-200/80" :
                        day.status === 'Half Day' ? "bg-purple-50/20 border-purple-200/80" :
                        day.status === 'On Leave' ? "bg-blue-50/20 border-blue-200/80" :
                        "bg-white border-slate-200/90",
                        isToday && "ring-2 ring-blue-500 ring-offset-1"
                      )}
                    >
                      {/* Top Header: Date Block + Status Badge */}
                      <div className="flex items-start justify-between gap-2.5">
                        <div className="flex items-center gap-3">
                          {/* Calendar Day Icon / Circle */}
                          <div className={cn(
                            "w-11 h-11 rounded-xl flex flex-col items-center justify-center shrink-0 border font-bold text-center",
                            isToday ? "bg-blue-600 text-white border-blue-700 shadow-xs" :
                            day.isHoliday ? "bg-indigo-100 text-indigo-900 border-indigo-200" :
                            day.dayOfWeek === 'Sun' ? "bg-rose-50 text-rose-700 border-rose-200" :
                            day.isWeekend ? "bg-slate-100 text-slate-500 border-slate-200" :
                            "bg-slate-100 text-slate-800 border-slate-200"
                          )}>
                            <span className="text-[10px] uppercase font-bold tracking-wider leading-none">{day.dayOfWeek}</span>
                            <span className="text-base font-extrabold leading-none mt-0.5">{day.dayNumber}</span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900 text-sm sm:text-base leading-tight">
                                {day.dayOfWeek}, {monthNames[currentMonthIdx].slice(0, 3)} {day.dayNumber < 10 ? `0${day.dayNumber}` : day.dayNumber}, {currentYear}
                              </span>
                              {isToday && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-700 uppercase tracking-wider">
                                  Today
                                </span>
                              )}
                              {day.isManual && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                                  <FileEdit className="w-2.5 h-2.5" /> Manual
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-slate-500 font-medium block mt-0.5">
                              {day.isHoliday ? `🎉 Public Holiday: ${day.holidayName}` :
                               day.isWeekend && !day.isDoubleOvertime ? `${day.dayOfWeek === 'Sun' ? 'Sunday Off' : 'Saturday Off'}` :
                               day.status === 'On Leave' ? `Approved Leave: ${day.manualReason || 'Casual / Sick Leave'}` :
                               day.status === 'Absent' ? 'Unexcused Absence' :
                               `10h Standard Workday (08:00 AM – 06:00 PM)`}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span className={cn(
                          "inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider shrink-0 border",
                          day.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          day.status === 'Late' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          day.status === 'Half Day' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                          day.status === 'On Leave' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          day.status === 'Holiday' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                          day.status === 'Weekend' ? 'bg-slate-100 text-slate-600 border-slate-200' :
                          'bg-rose-50 text-rose-700 border-rose-200'
                        )}>
                          {day.status}
                        </span>
                      </div>

                      {/* Middle Punch Grid (When working / checked in) */}
                      {!isNonWorking || day.isDoubleOvertime ? (
                        <div className="grid grid-cols-3 gap-2 bg-slate-50/80 p-2.5 rounded-xl border border-slate-200/60 text-center">
                          {/* Check In */}
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Check In</span>
                            <span className={cn(
                              "font-mono font-bold text-xs sm:text-sm block",
                              day.status === 'Late' ? 'text-amber-700' : 'text-emerald-700'
                            )}>
                              {day.checkIn || '—'}
                            </span>
                            {day.status === 'Late' && (
                              <span className="text-[9px] text-amber-600 font-bold block">
                                {day.lateMinutes ? `+${day.lateMinutes}m Late` : '> 08:15 AM'}
                              </span>
                            )}
                          </div>

                          {/* Check Out */}
                          <div className="space-y-0.5 border-x border-slate-200/80">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Check Out</span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-slate-800 block">
                              {day.checkOut || '—'}
                            </span>
                            <span className="text-[9px] text-slate-400 block font-medium">Standard 18:00</span>
                          </div>

                          {/* Duration & Overtime */}
                          <div className="space-y-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Duration</span>
                            <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 block">
                              {day.workHours || '—'}
                            </span>
                            {day.isDoubleOvertime ? (
                              <span className="text-[9px] font-extrabold text-purple-700 bg-purple-100 px-1 py-0.2 rounded block">
                                ⚡ 2x Double OT
                              </span>
                            ) : day.overtimeHours ? (
                              <span className="text-[9px] font-bold text-purple-600 bg-purple-50 px-1 py-0.2 rounded block">
                                +{day.overtimeHours} OT
                              </span>
                            ) : null}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50/60 rounded-xl p-2.5 border border-slate-200/50 text-xs text-slate-500 flex items-center justify-between">
                          <span>
                            {day.isHoliday ? `Public Holiday — Fully Paid Day Off` :
                             day.isWeekend ? `Weekly Rest Day` :
                             day.status === 'On Leave' ? `Leave Type: ${day.manualReason || 'Paid Leave'}` :
                             `Absence recorded for standard 10h shift`}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px]">0h logged</span>
                        </div>
                      )}

                      {/* Bottom Details Row & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-xs">
                        <div className="flex flex-wrap items-center gap-2">
                          {day.type && (
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700">
                              {day.type === 'Office' && <Building className="w-3 h-3 text-slate-500" />}
                              {day.type === 'Remote' && <Laptop className="w-3 h-3 text-blue-500" />}
                              {day.type === 'Field' && <Briefcase className="w-3 h-3 text-amber-500" />}
                              {day.type === 'On Duty' && <UserCheck className="w-3 h-3 text-emerald-500" />}
                              {day.type}
                            </span>
                          )}

                          {((day.otBonus && day.otBonus > 0) || (day.overtimeMinutes && day.overtimeMinutes >= 240)) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md">
                              <Sparkles className="w-3 h-3 text-amber-600" /> +₹{day.otBonus || 50} OT Bonus (&gt;4h)
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedDay(day);
                            }}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px]"
                          >
                            <FileEdit className="w-3.5 h-3.5 text-blue-600" />
                            <span>Edit Punch</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* GRID VIEW (7-Column Spreadsheet Calendar - Hidden on mobile devices) */}
        {viewMode === 'grid' && (
          <div className="hidden md:block">
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
                          "min-h-[115px] p-2 bg-white transition-all cursor-pointer flex flex-col justify-between group relative border overflow-hidden min-w-0",
                          getStatusStyle(day),
                          isToday && "ring-2 ring-blue-500 ring-offset-1 z-10 font-semibold"
                        )}
                      >
                        {/* Top Cell Row: Day Number + Status Badge */}
                        <div className="flex items-start justify-between gap-1 overflow-hidden min-w-0">
                          <div className="flex items-center gap-1 shrink-0">
                            <span className={cn(
                              "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                              isToday 
                                ? "bg-blue-600 text-white shadow-xs" 
                                : day.isWeekend 
                                ? "text-slate-400" 
                                : "text-slate-900"
                            )}>
                              {day.dayNumber}
                            </span>
                            {isToday && (
                              <span className="hidden xs:inline text-[8px] sm:text-[9px] font-bold text-blue-600 uppercase bg-blue-100 px-1 py-0.2 rounded shrink-0">Today</span>
                            )}
                          </div>

                          {/* Status Indicator Pill */}
                          <span className={cn(
                            "text-[8px] sm:text-[9px] font-bold uppercase tracking-wider px-1 sm:px-1.5 py-0.5 rounded border leading-none shrink-0 truncate max-w-[50px] sm:max-w-none",
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
                        <div className="my-1 space-y-1 overflow-hidden min-w-0">
                          {day.isHoliday && !day.isDoubleOvertime ? (
                            <div className="text-[10px] sm:text-[11px] font-semibold text-indigo-900 leading-snug truncate">
                              🎉 {day.holidayName}
                            </div>
                          ) : day.isWeekend && !day.isDoubleOvertime ? (
                            <div className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate">
                              {day.dayOfWeek === 'Sun' ? 'Sun Off' : 'Sat Off'}
                            </div>
                          ) : day.status === 'On Leave' || day.status === 'Absent' ? (
                            <div className="text-[10px] sm:text-[11px] font-medium text-slate-600 truncate">
                              {day.manualReason || (day.status === 'On Leave' ? 'Leave' : 'Absent')}
                            </div>
                          ) : (
                            <>
                              {day.isHoliday && (
                                <div className="text-[9px] sm:text-[10px] font-bold text-indigo-950 truncate flex items-center gap-1">
                                  🎉 {day.holidayName}
                                </div>
                              )}

                              {/* Check-In / Out Times */}
                              <div className="text-[10px] sm:text-[11px] font-mono font-medium text-slate-700 flex items-center justify-between overflow-hidden min-w-0">
                                <span className="truncate">{day.checkIn || '—'}</span>
                                <span className="text-slate-300 px-0.5">&rarr;</span>
                                <span className="truncate">{day.checkOut || '—'}</span>
                              </div>

                              {/* Work Duration and Overtime */}
                              <div className="flex flex-col gap-0.5 overflow-hidden min-w-0">
                                <div className="flex items-center justify-between text-[9px] sm:text-[10px] overflow-hidden min-w-0">
                                  <span className="font-mono font-bold text-slate-900 truncate">{day.workHours}</span>
                                  {day.isDoubleOvertime ? (
                                    <span className="text-[8px] sm:text-[9px] font-extrabold text-purple-800 bg-purple-100 px-1 py-0.2 rounded border border-purple-300 truncate shrink-0">
                                      2x OT
                                    </span>
                                  ) : day.overtimeHours ? (
                                    <span className="text-[8px] sm:text-[9px] font-bold text-purple-700 bg-purple-100/70 px-1 py-0.2 rounded truncate shrink-0">
                                      +{day.overtimeHours}
                                    </span>
                                  ) : null}
                                </div>
                                {((day.otBonus && day.otBonus > 0) || (day.overtimeMinutes && day.overtimeMinutes >= 240)) ? (
                                  <div className="flex items-center justify-between text-[8px] sm:text-[9px] font-extrabold text-amber-900 bg-amber-100/80 px-1 py-0.2 rounded border border-amber-200 truncate">
                                    <span className="flex items-center gap-0.5 truncate">
                                      <Sparkles className="w-2 h-2 text-amber-600 shrink-0" /> +₹{day.otBonus || 50}
                                    </span>
                                    <span className="text-[7px] sm:text-[8px] uppercase tracking-wider font-bold text-amber-800 shrink-0">&gt;4h</span>
                                  </div>
                                ) : null}
                              </div>
                            </>
                          )}
                        </div>

                        {/* Bottom Row: Location icon + Manual badge */}
                        <div className="flex items-center justify-between text-[9px] text-slate-400 pt-1 border-t border-slate-100/60 overflow-hidden min-w-0">
                          {day.type ? (
                            <span className="flex items-center gap-1 font-medium truncate">
                              {day.type === 'Office' && <Building className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-400 shrink-0" />}
                              {day.type === 'Remote' && <Laptop className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500 shrink-0" />}
                              {day.type === 'Field' && <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-500 shrink-0" />}
                              {day.type === 'On Duty' && <UserCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500 shrink-0" />}
                              <span className="truncate">{day.type}</span>
                            </span>
                          ) : <span />}
                          {day.isManual && (
                            <span className="text-amber-700 font-bold bg-amber-100/80 px-1 py-0.2 rounded shrink-0" title="Manually Adjusted Record">
                              [M]
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

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

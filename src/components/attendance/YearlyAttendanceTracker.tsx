import React, { useState, useMemo } from 'react';
import { 
  Calendar, Download, TrendingUp, User, Award, AlertTriangle, 
  CheckCircle2, Clock, ShieldCheck, ChevronRight, BarChart3, 
  FileText, Sparkles, Filter, ChevronLeft
} from 'lucide-react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, 
  Legend, CartesianGrid, Line, ComposedChart 
} from 'recharts';
import { DayAttendance, EmployeeProfile, YearlyAttendanceSummary } from '../../types/attendance';
import { ATTENDANCE_EMPLOYEES, generateYearAttendance } from '../../data/attendanceData';
import { AttendanceDayModal } from './AttendanceDayModal';
import { cn } from '../../lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface YearlyAttendanceTrackerProps {
  initialEmployeeId?: string;
  onNavigateToMonth?: (monthIdx: number, year: number, empId: string) => void;
}

export const YearlyAttendanceTracker: React.FC<YearlyAttendanceTrackerProps> = ({
  initialEmployeeId,
  onNavigateToMonth,
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState<string>(initialEmployeeId || ATTENDANCE_EMPLOYEES[0].id);
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [deptFilter, setDeptFilter] = useState<string>('All');

  // Day modal state
  const [selectedDay, setSelectedDay] = useState<DayAttendance | null>(null);

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

  // Generate complete annual dataset
  const { summary, allDays } = useMemo(() => {
    return generateYearAttendance(selectedEmpId, selectedYear);
  }, [selectedEmpId, selectedYear]);

  // Chart data for monthly trend
  const chartData = useMemo(() => {
    return summary.monthlyBreakdown.map(m => ({
      month: m.monthName.slice(0, 3),
      attendanceRate: m.attendancePercentage,
      targetRate: 95,
      presentDays: m.presentDays,
      lateDays: m.lateDays,
      absentDays: m.absentDays,
      leaveDays: m.leaveDays,
      workHours: Math.round(m.totalWorkMinutes / 60),
      overtimeHours: Math.round((m.totalOvertimeMinutes / 60) * 10) / 10,
    }));
  }, [summary]);

  // Group allDays by month for heatmap presentation
  const monthGroups = useMemo(() => {
    const groups: { monthIndex: number; monthName: string; days: DayAttendance[] }[] = [];
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    for (let m = 0; m < 12; m++) {
      const days = allDays.filter(d => {
        const mIdx = new Date(d.date).getMonth();
        return mIdx === m;
      });
      groups.push({
        monthIndex: m,
        monthName: monthNames[m],
        days
      });
    }
    return groups;
  }, [allDays]);

  const handleSaveDayRecord = (updatedDay: DayAttendance) => {
    // updates reflected
    setSelectedDay(null);
  };

  // Export Yearly Audit PDF
  const handleExportAnnualPDF = () => {
    const doc = new jsPDF('landscape');

    // Header
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 297, 36, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('ENERPACK HR - ANNUAL ATTENDANCE AUDIT & COMPLIANCE DOSSIER', 14, 15);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Annual Period: Calendar Year ${selectedYear} | Standard Shift: 08:00 AM – 06:00 PM (10 hrs/day)`, 14, 24);
    doc.text(`Employee: ${currentEmployee.name} (${currentEmployee.id}) | Department: ${currentEmployee.department} | Designation: ${currentEmployee.designation}`, 14, 30);

    // Meta box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, 42, 269, 22, 2, 2, 'FD');

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Annual Attendance Score: ${summary.annualAttendanceRate}%`, 18, 50);
    doc.text(`Total Working Days: ${summary.totalWorkingDays}`, 18, 57);

    doc.text(`Present Days: ${summary.totalPresent} | Late: ${summary.totalLate}`, 90, 50);
    doc.text(`Punctuality Index: ${summary.punctualityRate}%`, 90, 57);

    doc.text(`Total Leaves: ${summary.totalLeaves} | Absences: ${summary.totalAbsent}`, 170, 50);
    doc.text(`Half Days: ${summary.totalHalfDays} | Holidays: ${summary.totalHolidays}`, 170, 57);

    doc.text(`Total Work Hours: ${summary.totalWorkHours} hrs`, 220, 50);
    doc.text(`Total Overtime: ${summary.totalOvertimeHours} hrs | OT Bonus: ₹${summary.totalOtBonusAmount || 0} (${summary.totalOtBonusDays || 0} days)`, 220, 57);

    // Table Data
    const tableData = summary.monthlyBreakdown.map(m => [
      m.monthName,
      m.workingDays,
      m.presentDays,
      m.lateDays,
      m.halfDays,
      m.absentDays,
      m.leaveDays,
      m.holidayDays,
      m.totalWorkHoursFormatted,
      m.totalOvertimeHoursFormatted,
      `₹${m.totalOtBonusAmount || 0}`,
      `${m.attendancePercentage}%`,
      m.attendancePercentage >= 95 ? 'Compliant / Excellent' : 'Under Observation'
    ]);

    autoTable(doc, {
      startY: 70,
      head: [[
        'Month', 'Working Days', 'Present', 'Late (>08:15)', 'Half Day', 
        'Absent', 'Leaves', 'Holidays', 'Work Hours', 'Overtime', 'OT Bonus (₹50)', 'Attendance %', 'Status'
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: 255,
        fontSize: 8.5,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [51, 65, 85],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 10) {
          const val = parseFloat(String(data.cell.raw));
          if (val >= 95) data.cell.styles.textColor = [22, 101, 52];
          else if (val >= 85) data.cell.styles.textColor = [194, 65, 12];
          else data.cell.styles.textColor = [185, 28, 28];
        }
      }
    });

    doc.save(`Annual_Attendance_${currentEmployee.name.replace(/\s+/g, '_')}_${selectedYear}.pdf`);
  };

  const getHeatmapColor = (day: DayAttendance) => {
    switch (day.status) {
      case 'Present':
        return day.overtimeHours 
          ? 'bg-emerald-600 hover:bg-emerald-500 ring-1 ring-emerald-700' 
          : 'bg-emerald-500 hover:bg-emerald-400';
      case 'Late':
        return 'bg-amber-400 hover:bg-amber-300';
      case 'Half Day':
        return 'bg-purple-500 hover:bg-purple-400';
      case 'Absent':
        return 'bg-rose-500 hover:bg-rose-400';
      case 'On Leave':
        return 'bg-blue-500 hover:bg-blue-400';
      case 'Holiday':
        return 'bg-indigo-400 hover:bg-indigo-300';
      case 'Weekend':
        return 'bg-slate-200 hover:bg-slate-300';
      default:
        return 'bg-slate-100 hover:bg-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* TOP CONTROLS & FILTER BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm flex items-center justify-center border border-purple-200 shrink-0 shadow-inner">
                {currentEmployee.name.charAt(0)}
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Target Employee
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer min-w-[240px]"
                >
                  {filteredEmployees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) &bull; {emp.department}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Department Filter */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {departments.map(dept => (
                <button
                  key={dept}
                  onClick={() => setDeptFilter(dept)}
                  className={cn(
                    "px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer",
                    deptFilter === dept 
                      ? "bg-white text-purple-700 shadow-xs" 
                      : "text-slate-500 hover:text-slate-800"
                  )}
                >
                  {dept}
                </button>
              ))}
            </div>
          </div>

          {/* Year Selector & Export */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[2025, 2026, 2027].map(yr => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer",
                    selectedYear === yr 
                      ? "bg-purple-600 text-white shadow-xs" 
                      : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {yr}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportAnnualPDF}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Export Annual Audit PDF
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-purple-600" />
            <span>Annual Tracking Policy: <strong className="text-slate-900">08:00 AM – 06:00 PM (10h Shift)</strong></span>
            <span className="text-slate-400">&bull;</span>
            <span>Annual Target Attendance: <strong className="text-emerald-700">95.0%</strong></span>
          </div>
          <div className="text-slate-400 font-medium">
            Full 365-day timeline matrix with interactive monthly jump-points.
          </div>
        </div>
      </div>

      {/* ANNUAL KPI SUMMARY METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* Annual Attendance Score */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Annual Score</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{summary.annualAttendanceRate}%</span>
          <span className={cn(
            "text-[10px] font-bold mt-1 block",
            summary.annualAttendanceRate >= 95 ? "text-emerald-600" : summary.annualAttendanceRate >= 85 ? "text-amber-600" : "text-rose-600"
          )}>
            {summary.annualAttendanceRate >= 95 ? '★ Compliant / Star' : 'Review Required'}
          </span>
        </div>

        {/* Working Days */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Working Days</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{summary.totalWorkingDays}</span>
          <span className="text-[10px] text-slate-400 block mt-1">365 Calendar Days</span>
        </div>

        {/* Total Present Days */}
        <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-xs bg-emerald-50/20">
          <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest block mb-1">Present (On-Time)</span>
          <span className="text-2xl font-bold text-emerald-700 font-mono tracking-tight">{summary.totalPresent}</span>
          <span className="text-[10px] text-emerald-600 font-medium block mt-1">Shift ≤ 08:15 AM</span>
        </div>

        {/* Late Punches */}
        <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-xs bg-amber-50/20">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block mb-1">Late Arrivals</span>
          <span className="text-2xl font-bold text-amber-700 font-mono tracking-tight">{summary.totalLate}</span>
          <span className="text-[10px] text-amber-600 font-medium block mt-1">Punctuality: {summary.punctualityRate}%</span>
        </div>

        {/* Leaves & Absences */}
        <div className="bg-white rounded-2xl border border-rose-100 p-4 shadow-xs bg-rose-50/20">
          <span className="text-[10px] font-bold text-rose-800 uppercase tracking-widest block mb-1">Leaves / Absent</span>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-rose-700 font-mono tracking-tight">{summary.totalLeaves + summary.totalAbsent}</span>
            <span className="text-[10px] text-slate-400">({summary.totalLeaves}L / {summary.totalAbsent}A)</span>
          </div>
          <span className="text-[10px] text-rose-600 font-medium block mt-1">Half Days: {summary.totalHalfDays}</span>
        </div>

        {/* Total Work Hours */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Work Hours</span>
          <span className="text-2xl font-bold text-slate-900 font-mono tracking-tight">{summary.totalWorkHours}h</span>
          <span className="text-[10px] text-slate-400 block mt-1">Expected: {summary.totalWorkingDays * 10}h</span>
        </div>

        {/* Overtime Logged */}
        <div className="bg-white rounded-2xl border border-purple-100 p-4 shadow-xs bg-purple-50/20">
          <span className="text-[10px] font-bold text-purple-800 uppercase tracking-widest block mb-1">Total Overtime</span>
          <span className="text-2xl font-bold text-purple-700 font-mono tracking-tight">+{summary.totalOvertimeHours}h</span>
          <span className="text-[10px] text-purple-600 font-medium block mt-1">Beyond standard shift</span>
        </div>

        {/* Annual OT Bonus */}
        <div className="bg-white rounded-2xl border border-amber-200 p-4 shadow-xs bg-amber-50/30">
          <span className="text-[10px] font-bold text-amber-800 uppercase tracking-widest block mb-1">Annual OT Bonus</span>
          <span className="text-2xl font-bold text-amber-700 font-mono tracking-tight">₹{summary.totalOtBonusAmount || 0}</span>
          <span className="text-[10px] text-amber-800 font-medium block mt-1">{summary.totalOtBonusDays || 0} days (&gt;4h OT)</span>
        </div>
      </div>

      {/* 365-DAY ANNUAL HEATMAP CONTRIBUTION MATRIX */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              Annual Attendance Heatmap Matrix ({selectedYear})
            </h3>
            <p className="text-xs text-slate-500">
              Visual 365-day attendance distribution for {currentEmployee.name} ({currentEmployee.id}). Click any cell for audit logs.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium text-slate-600">
            <span className="text-slate-400 uppercase font-bold">Key:</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-500"></span> Present</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-emerald-700"></span> Present + OT</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-amber-400"></span> Late</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-purple-500"></span> Half Day</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-rose-500"></span> Absent</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-blue-500"></span> Leave</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-indigo-400"></span> Holiday</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs bg-slate-200"></span> Weekend</span>
          </div>
        </div>

        {/* Heatmap Grid by Months */}
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-cols-12 gap-3 min-w-[900px]">
            {monthGroups.map((group) => (
              <div key={group.monthName} className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                  <span>{group.monthName}</span>
                  <button
                    onClick={() => onNavigateToMonth?.(group.monthIndex, selectedYear, selectedEmpId)}
                    title="Jump to Month Calendar"
                    className="text-[9px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                  >
                    View &rarr;
                  </button>
                </div>

                {/* Day Dots Grid (Up to 31 days per month) */}
                <div className="grid grid-cols-4 gap-1 p-1.5 bg-slate-50 rounded-xl border border-slate-100">
                  {group.days.map((day) => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDay(day)}
                      title={`${day.date} (${day.dayOfWeek}): ${day.status}${day.checkIn ? ` [${day.checkIn} - ${day.checkOut}]` : ''}${day.holidayName ? ` - ${day.holidayName}` : ''}`}
                      className={cn(
                        "w-5 h-5 rounded-md transition-all text-[9px] font-mono font-semibold flex items-center justify-center cursor-pointer shadow-2xs",
                        getHeatmapColor(day),
                        day.status === 'Present' || day.status === 'Absent' || day.status === 'On Leave' || day.status === 'Half Day' 
                          ? 'text-white' 
                          : 'text-slate-800'
                      )}
                    >
                      {day.dayNumber}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ANNUAL ATTENDANCE TREND & WORK HOURS CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Monthly Attendance % vs Target */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Monthly Attendance Rate (%)</h4>
              <p className="text-xs text-slate-500">Benchmark comparison vs 95% target compliance line.</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
              Avg: {summary.annualAttendanceRate}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis domain={[70, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `${value}%`,
                    name === 'attendanceRate' ? 'Attendance Rate' : 'Target Threshold'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="attendanceRate" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                <Line type="monotone" dataKey="targetRate" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Monthly Work Hours & Overtime */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Work Duration & Overtime (Hours)</h4>
              <p className="text-xs text-slate-500">Regular 10h workday logs and overtime accumulation.</p>
            </div>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-purple-50 text-purple-700 border border-purple-200">
              Total: {summary.totalWorkHours}h (+{summary.totalOvertimeHours}h OT)
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip 
                  formatter={(value: any, name: any) => [
                    `${value} hrs`,
                    name === 'workHours' ? 'Standard Work Hours' : 'Overtime Logged'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="workHours" fill="#6366f1" stackId="a" radius={[0, 0, 0, 0]} barSize={20} />
                <Bar dataKey="overtimeHours" fill="#a855f7" stackId="a" radius={[4, 4, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 12-MONTH MATRIX OVERVIEW TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Annual 12-Month Attendance Matrix</h3>
            <p className="text-xs text-slate-500">Comprehensive breakdown of all 12 calendar months for {selectedYear}.</p>
          </div>
          <button
            onClick={handleExportAnnualPDF}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download Register
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="py-3 px-4">Month</th>
                <th className="py-3 px-4">Working Days</th>
                <th className="py-3 px-4">Present</th>
                <th className="py-3 px-4">Late (&gt;08:15)</th>
                <th className="py-3 px-4">Half Day</th>
                <th className="py-3 px-4">Absent</th>
                <th className="py-3 px-4">Leaves</th>
                <th className="py-3 px-4">Holidays</th>
                <th className="py-3 px-4">Total Hours</th>
                <th className="py-3 px-4">Overtime</th>
                <th className="py-3 px-4">OT Bonus (₹50)</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {summary.monthlyBreakdown.map((m) => (
                <tr key={m.monthIndex} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    {m.monthName}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    {m.workingDays}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                    {m.presentDays}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-amber-700">
                    {m.lateDays}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-purple-700">
                    {m.halfDays}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-rose-700">
                    {m.absentDays}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-blue-700">
                    {m.leaveDays}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-indigo-700">
                    {m.holidayDays}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-800">
                    {m.totalWorkHoursFormatted}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-purple-700">
                    {m.totalOvertimeHoursFormatted}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-amber-700">
                    {m.totalOtBonusAmount > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded text-[11px]">
                        ₹{m.totalOtBonusAmount} ({m.totalOtBonusDays}d)
                      </span>
                    ) : (
                      <span className="text-slate-400 font-normal">₹0</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-bold font-mono",
                      m.attendancePercentage >= 95 ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                      m.attendancePercentage >= 85 ? "bg-amber-50 text-amber-700 border border-amber-200" :
                      "bg-rose-50 text-rose-700 border border-rose-200"
                    )}>
                      {m.attendancePercentage}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onNavigateToMonth?.(m.monthIndex, selectedYear, selectedEmpId)}
                      className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-[10px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                    >
                      Open Calendar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-slate-900 text-white font-bold text-xs">
                <td className="py-3 px-4">Annual Total</td>
                <td className="py-3 px-4 font-mono">{summary.totalWorkingDays}</td>
                <td className="py-3 px-4 font-mono text-emerald-400">{summary.totalPresent}</td>
                <td className="py-3 px-4 font-mono text-amber-400">{summary.totalLate}</td>
                <td className="py-3 px-4 font-mono text-purple-400">{summary.totalHalfDays}</td>
                <td className="py-3 px-4 font-mono text-rose-400">{summary.totalAbsent}</td>
                <td className="py-3 px-4 font-mono text-blue-400">{summary.totalLeaves}</td>
                <td className="py-3 px-4 font-mono text-indigo-400">{summary.totalHolidays}</td>
                <td className="py-3 px-4 font-mono">{summary.totalWorkHours}h</td>
                <td className="py-3 px-4 font-mono text-purple-400">+{summary.totalOvertimeHours}h</td>
                <td className="py-3 px-4 font-mono text-amber-400">₹{summary.totalOtBonusAmount || 0}</td>
                <td className="py-3 px-4 font-mono text-emerald-400">{summary.annualAttendanceRate}%</td>
                <td className="py-3 px-4 text-right"></td>
              </tr>
            </tfoot>
          </table>
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

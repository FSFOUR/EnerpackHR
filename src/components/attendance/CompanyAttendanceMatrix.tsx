import React, { useState, useMemo } from 'react';
import { 
  Calendar, Download, Users, ChevronLeft, ChevronRight, 
  Search, Filter, Clock, CheckCircle2, AlertCircle, FileEdit
} from 'lucide-react';
import { ATTENDANCE_EMPLOYEES, generateMonthAttendance, COMPANY_HOLIDAYS_MAP } from '../../data/attendanceData';
import { DayAttendance } from '../../types/attendance';
import { cn } from '../../lib/utils';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CompanyAttendanceMatrixProps {
  onSelectEmployeeForCalendar?: (empId: string, monthIdx: number, year: number) => void;
}

export const CompanyAttendanceMatrix: React.FC<CompanyAttendanceMatrixProps> = ({
  onSelectEmployeeForCalendar,
}) => {
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIdx, setCurrentMonthIdx] = useState<number>(7); // August
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('All');

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const dayNumbers = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  // Departments
  const departments = useMemo(() => {
    const set = new Set(ATTENDANCE_EMPLOYEES.map(e => e.department));
    return ['All', ...Array.from(set)];
  }, []);

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    return ATTENDANCE_EMPLOYEES.filter(emp => {
      const matchesSearch = 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = deptFilter === 'All' || emp.department === deptFilter;

      return matchesSearch && matchesDept;
    });
  }, [searchTerm, deptFilter]);

  // Pre-generate matrix data for all filtered employees
  const matrixData = useMemo(() => {
    return filteredEmployees.map(emp => {
      const days = generateMonthAttendance(emp.id, currentYear, currentMonthIdx);
      let present = 0;
      let late = 0;
      let halfDay = 0;
      let absent = 0;
      let leaves = 0;
      let totalMins = 0;
      let otBonusDays = 0;

      days.forEach(d => {
        if (d.status === 'Present') present++;
        else if (d.status === 'Late') late++;
        else if (d.status === 'Half Day') halfDay++;
        else if (d.status === 'Absent') absent++;
        else if (d.status === 'On Leave') leaves++;
        totalMins += d.workMinutes || 0;
        if ((d.otBonus && d.otBonus > 0) || (d.overtimeMinutes && d.overtimeMinutes >= 240)) {
          otBonusDays++;
        }
      });

      const totalH = Math.floor(totalMins / 60);

      return {
        employee: emp,
        days,
        stats: { 
          present, 
          late, 
          halfDay, 
          absent, 
          leaves, 
          totalHours: `${totalH}h`,
          otBonusDays,
          otBonusAmount: otBonusDays * 50
        }
      };
    });
  }, [filteredEmployees, currentYear, currentMonthIdx]);

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

  const getStatusSymbol = (status: DayAttendance['status']) => {
    switch (status) {
      case 'Present':
        return { char: 'P', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
      case 'Late':
        return { char: 'L', color: 'text-amber-700 bg-amber-50 border-amber-200' };
      case 'Half Day':
        return { char: 'HD', color: 'text-purple-700 bg-purple-50 border-purple-200' };
      case 'Absent':
        return { char: 'A', color: 'text-rose-700 bg-rose-50 border-rose-200' };
      case 'On Leave':
        return { char: 'LV', color: 'text-blue-700 bg-blue-50 border-blue-200' };
      case 'Holiday':
        return { char: 'H', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' };
      case 'Weekend':
        return { char: 'WO', color: 'text-slate-400 bg-slate-100 border-slate-200' };
      default:
        return { char: '—', color: 'text-slate-400 bg-slate-50 border-slate-200' };
    }
  };

  // Export Matrix to PDF
  const handleExportMatrixPDF = () => {
    const doc = new jsPDF('landscape');

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 297, 30, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('ENERPACK HR - COMPANY ATTENDANCE REGISTER', 14, 14);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(203, 213, 225);
    doc.text(`Month: ${monthNames[currentMonthIdx]} ${currentYear} | Shift: 08:00 AM – 06:00 PM (10 hrs)`, 14, 22);

    const headers = ['Emp ID', 'Employee Name', 'Department', 'P', 'L', 'HD', 'A', 'LV', 'Hours', 'OT Bonus (₹50)'];
    const tableData = matrixData.map(row => [
      row.employee.id,
      row.employee.name,
      row.employee.department,
      row.stats.present,
      row.stats.late,
      row.stats.halfDay,
      row.stats.absent,
      row.stats.leaves,
      row.stats.totalHours,
      `₹${row.stats.otBonusAmount} (${row.stats.otBonusDays}d)`
    ]);

    const totalP = matrixData.reduce((acc, r) => acc + r.stats.present, 0);
    const totalL = matrixData.reduce((acc, r) => acc + r.stats.late, 0);
    const totalHD = matrixData.reduce((acc, r) => acc + r.stats.halfDay, 0);
    const totalA = matrixData.reduce((acc, r) => acc + r.stats.absent, 0);
    const totalLV = matrixData.reduce((acc, r) => acc + r.stats.leaves, 0);
    const totalBonusAmt = matrixData.reduce((acc, r) => acc + r.stats.otBonusAmount, 0);
    const totalBonusDays = matrixData.reduce((acc, r) => acc + r.stats.otBonusDays, 0);

    autoTable(doc, {
      startY: 38,
      head: [headers],
      body: tableData,
      foot: [[
        'TOTAL',
        `${matrixData.length} Staff`,
        'All Depts',
        totalP,
        totalL,
        totalHD,
        totalA,
        totalLV,
        '—',
        `₹${totalBonusAmt} (${totalBonusDays}d)`
      ]],
      showFoot: 'lastPage',
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        fontSize: 8,
      },
      bodyStyles: {
        fontSize: 8,
      },
      footStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontSize: 8,
        fontStyle: 'bold',
      }
    });

    doc.save(`Attendance_Register_${monthNames[currentMonthIdx]}_${currentYear}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* HEADER & FILTERS */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search employee or dept..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
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
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <select
                value={currentMonthIdx}
                onChange={(e) => setCurrentMonthIdx(Number(e.target.value))}
                className="px-2 py-1 bg-transparent text-sm font-bold text-slate-900 focus:outline-none cursor-pointer"
              >
                {monthNames.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </select>

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
                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleExportMatrixPDF}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> PDF Register
            </button>
          </div>
        </div>
      </div>

      {/* MATRIX TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3.5 sm:p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Monthly Attendance Register: {monthNames[currentMonthIdx]} {currentYear}
            </h3>
            <p className="text-xs text-slate-500">
              Complete day-by-day attendance grid across {filteredEmployees.length} employees.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
            <span className="text-emerald-700">P = Present</span>
            <span className="text-amber-700">L = Late</span>
            <span className="text-rose-700">A = Absent</span>
            <span className="text-blue-700">LV = Leave</span>
            <span className="text-indigo-700">H = Holiday</span>
            <span className="text-slate-400">WO = Weekend</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 sticky left-0 bg-slate-50 z-10 border-r border-slate-200">Employee</th>
                {dayNumbers.map(d => {
                  const dateObj = new Date(currentYear, currentMonthIdx, d);
                  const isWeekend = dateObj.getDay() === 0 || dateObj.getDay() === 6;
                  return (
                    <th key={d} className={cn("py-2.5 px-1 text-center min-w-[28px]", isWeekend && "bg-slate-100/70 text-slate-400")}>
                      <span className="block text-[9px] font-normal">{['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'][dateObj.getDay()]}</span>
                      <span>{d}</span>
                    </th>
                  );
                })}
                <th className="py-3 px-2 text-center text-emerald-700 bg-emerald-50/40">P</th>
                <th className="py-3 px-2 text-center text-amber-700 bg-amber-50/40">L</th>
                <th className="py-3 px-2 text-center text-purple-700 bg-purple-50/40">HD</th>
                <th className="py-3 px-2 text-center text-rose-700 bg-rose-50/40">A</th>
                <th className="py-3 px-2 text-center text-blue-700 bg-blue-50/40">LV</th>
                <th className="py-3 px-3 text-right">Hours</th>
                <th className="py-3 px-3 text-right text-amber-700 bg-amber-50/40">OT Bonus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {matrixData.map(({ employee, days, stats }) => (
                <tr key={employee.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 sticky left-0 bg-white hover:bg-slate-50 z-10 border-r border-slate-200 whitespace-nowrap">
                    <div 
                      onClick={() => onSelectEmployeeForCalendar?.(employee.id, currentMonthIdx, currentYear)}
                      className="cursor-pointer group"
                    >
                      <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors block leading-tight">
                        {employee.name}
                      </span>
                      <span className="text-[10px] text-slate-400">{employee.id} &bull; {employee.department}</span>
                    </div>
                  </td>

                  {days.map((d) => {
                    const { char, color } = getStatusSymbol(d.status);
                    return (
                      <td key={d.date} className="p-0.5 text-center">
                        <span 
                          title={`${d.date} (${d.dayOfWeek}): ${d.status}${d.checkIn ? ` [${d.checkIn} - ${d.checkOut}]` : ''}`}
                          className={cn(
                            "inline-flex items-center justify-center w-6 h-6 rounded-md text-[9px] font-bold border transition-transform hover:scale-110",
                            color
                          )}
                        >
                          {char}
                        </span>
                      </td>
                    );
                  })}

                  <td className="py-3 px-2 text-center font-mono font-bold text-emerald-700 bg-emerald-50/20">{stats.present}</td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-amber-700 bg-amber-50/20">{stats.late}</td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-purple-700 bg-purple-50/20">{stats.halfDay}</td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-rose-700 bg-rose-50/20">{stats.absent}</td>
                  <td className="py-3 px-2 text-center font-mono font-bold text-blue-700 bg-blue-50/20">{stats.leaves}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{stats.totalHours}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-amber-700 bg-amber-50/20">
                    {stats.otBonusAmount > 0 ? `₹${stats.otBonusAmount}` : <span className="text-slate-300 font-normal">₹0</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

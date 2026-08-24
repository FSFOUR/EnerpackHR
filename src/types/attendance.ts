export type AttendanceStatus = 'Present' | 'Late' | 'Half Day' | 'Absent' | 'On Leave' | 'Holiday' | 'Weekend';

export type AttendanceType = 'Office' | 'Remote' | 'Field' | 'On Duty';

export interface DayAttendance {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  dayOfWeek: string; // 'Mon', 'Tue', etc.
  isWeekend: boolean;
  isHoliday: boolean;
  holidayName?: string;
  status: AttendanceStatus;
  checkIn?: string; // e.g. "07:55 AM"
  checkOut?: string; // e.g. "06:05 PM"
  workHours?: string; // e.g. "10h 10m"
  workMinutes?: number;
  overtimeMinutes?: number; // Final credited overtime minutes (after company multiplier)
  overtimeHours?: string; // Formatted final credited overtime
  actualOvertimeMinutes?: number; // Raw clocked overtime minutes (e.g. 60m / 1h)
  actualOvertimeHours?: string; // Raw clocked overtime string (e.g. "1h 00m")
  otMultiplier?: number; // Company calculation multiplier (e.g. 1.5 where 1h * 1.5 = 1.5h, or 2.0 for double OT)
  companyOvertimeMinutes?: number; // Company calculated overtime minutes (actual * multiplier)
  companyOvertimeHours?: string; // Company calculated overtime formatted string (e.g. "1h 30m (1.5x)")
  isDoubleOvertime?: boolean; // Double Overtime (2x multiplier) for working on holidays / off-days
  doubleOvertimeMinutes?: number; // Credited 2x overtime minutes
  doubleOvertimeHours?: string; // Credited 2x overtime hours string
  isHolidayWorked?: boolean; // Flag indicating employee worked on a public holiday
  otBonus?: number; // e.g. 50 rupees if overtime over 4 hours after 18:00 (18:00 to 22:00+)
  otBonusEligible?: boolean;
  type?: AttendanceType;
  isManual?: boolean;
  manualReason?: string;
  approvedBy?: string;
  lateMinutes?: number;
  earlyExitMinutes?: number;
  breakMinutes?: number;
  notes?: string;
  device?: string;
}

export interface EmployeeProfile {
  id: string;
  name: string;
  department: string;
  designation: string;
  avatar?: string;
  joinDate: string;
  shiftTiming: string; // "08:00 AM – 06:00 PM"
  shiftHours: number; // 10
  email: string;
  phone: string;
}

export interface MonthlyAttendanceSummary {
  monthIndex: number; // 0-11
  monthName: string;
  year: number;
  totalCalendarDays: number;
  workingDays: number;
  presentDays: number;
  lateDays: number;
  halfDays: number;
  absentDays: number;
  leaveDays: number;
  holidayDays: number;
  weekendDays: number;
  totalWorkMinutes: number;
  totalWorkHoursFormatted: string;
  totalActualOvertimeMinutes?: number;
  totalActualOvertimeHoursFormatted?: string;
  weekdayActualOtMinutes?: number;
  weekdayActualOtHoursFormatted?: string;
  weekdayCreditedOtMinutes?: number;
  weekdayCreditedOtHoursFormatted?: string;
  sundayHolidayActualOtMinutes?: number;
  sundayHolidayActualOtHoursFormatted?: string;
  sundayHolidayCreditedOtMinutes?: number;
  sundayHolidayCreditedOtHoursFormatted?: string;
  totalOvertimeMinutes: number;
  totalOvertimeHoursFormatted: string;
  totalDoubleOvertimeMinutes?: number;
  totalDoubleOvertimeHoursFormatted?: string;
  totalHolidayWorkDays?: number;
  totalOtBonusDays: number;
  totalOtBonusAmount: number;
  avgDailyMinutes: number;
  avgDailyHoursFormatted: string;
  attendancePercentage: number;
  punctualityScore: number;
}

export interface YearlyAttendanceSummary {
  year: number;
  employeeId: string;
  employeeName: string;
  totalWorkingDays: number;
  totalPresent: number;
  totalLate: number;
  totalHalfDays: number;
  totalAbsent: number;
  totalLeaves: number;
  totalHolidays: number;
  annualAttendanceRate: number;
  punctualityRate: number;
  totalWorkHours: number;
  totalOvertimeHours: number;
  totalDoubleOvertimeHours?: number;
  totalHolidayWorkDays?: number;
  totalOtBonusDays: number;
  totalOtBonusAmount: number;
  monthlyBreakdown: MonthlyAttendanceSummary[];
}

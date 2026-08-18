import { DayAttendance, EmployeeProfile, MonthlyAttendanceSummary, YearlyAttendanceSummary } from '../types/attendance';

export const ATTENDANCE_EMPLOYEES: EmployeeProfile[] = [
  {
    id: 'EMP-001',
    name: 'Arjun Sharma',
    department: 'Engineering',
    designation: 'Lead Systems Architect',
    joinDate: '2022-03-15',
    shiftTiming: '08:00 AM – 06:00 PM',
    shiftHours: 10,
    email: 'arjun.sharma@enerpack.com',
    phone: '+91 98450 12345',
  },
  {
    id: 'EMP-002',
    name: 'Priya Patel',
    department: 'Human Resources',
    designation: 'Head of People & Culture',
    joinDate: '2021-08-01',
    shiftTiming: '08:00 AM – 06:00 PM',
    shiftHours: 10,
    email: 'priya.patel@enerpack.com',
    phone: '+91 98450 23456',
  },
  {
    id: 'EMP-003',
    name: 'Vikram Singh',
    department: 'Sales',
    designation: 'Enterprise Account Executive',
    joinDate: '2023-01-10',
    shiftTiming: '08:00 AM – 06:00 PM',
    shiftHours: 10,
    email: 'vikram.singh@enerpack.com',
    phone: '+91 98450 34567',
  },
  {
    id: 'EMP-004',
    name: 'Ananya Desai',
    department: 'Marketing',
    designation: 'Brand Growth Lead',
    joinDate: '2023-06-20',
    shiftTiming: '08:00 AM – 06:00 PM',
    shiftHours: 10,
    email: 'ananya.desai@enerpack.com',
    phone: '+91 98450 45678',
  },
  {
    id: 'EMP-005',
    name: 'Rohan Mehta',
    department: 'Finance',
    designation: 'Senior Financial Controller',
    joinDate: '2022-11-05',
    shiftTiming: '08:00 AM – 06:00 PM',
    shiftHours: 10,
    email: 'rohan.mehta@enerpack.com',
    phone: '+91 98450 56789',
  },
  {
    id: 'EMP-006',
    name: 'Sneha Reddy',
    department: 'Operations',
    designation: 'Plant & Supply Operations Manager',
    joinDate: '2021-02-18',
    shiftTiming: '08:00 AM – 06:00 PM',
    shiftHours: 10,
    email: 'sneha.reddy@enerpack.com',
    phone: '+91 98450 67890',
  },
  {
    id: 'EMP-007',
    name: 'Kavita Iyer',
    department: 'Design',
    designation: 'Principal UI/UX Architect',
    joinDate: '2023-09-01',
    shiftTiming: '08:00 AM – 06:00 PM',
    shiftHours: 10,
    email: 'kavita.iyer@enerpack.com',
    phone: '+91 98450 78901',
  },
  {
    id: 'EMP-008',
    name: 'Amit Kumar',
    department: 'Sales',
    designation: 'Regional Sales Manager',
    joinDate: '2024-02-15',
    shiftTiming: '08:00 AM – 06:00 PM',
    shiftHours: 10,
    email: 'amit.kumar@enerpack.com',
    phone: '+91 98450 89012',
  },
];

export interface HolidayItem {
  date: string; // YYYY-MM-DD
  name: string;
  type: 'National' | 'Gazetted' | 'Restricted';
}

export const COMPANY_HOLIDAYS_MAP: Record<string, string> = {
  // 2026 Holidays
  '2026-01-01': "New Year's Day",
  '2026-01-26': 'Republic Day (National Holiday)',
  '2026-03-04': 'Maha Shivaratri',
  '2026-03-25': 'Holi (Festival of Colours)',
  '2026-04-10': 'Good Friday',
  '2026-04-14': 'Dr. Ambedkar Jayanti',
  '2026-05-01': 'International Labour Day',
  '2026-08-15': 'Independence Day (National Holiday)',
  '2026-10-02': 'Gandhi Jayanti (National Holiday)',
  '2026-10-20': 'Dussehra / Vijaya Dashami',
  '2026-11-08': 'Diwali / Deepavali',
  '2026-11-09': 'Govardhan Puja',
  '2026-12-25': 'Christmas Day',

  // 2025 Holidays
  '2025-01-01': "New Year's Day",
  '2025-01-26': 'Republic Day',
  '2025-03-14': 'Holi',
  '2025-05-01': 'Labour Day',
  '2025-08-15': 'Independence Day',
  '2025-10-02': 'Gandhi Jayanti',
  '2025-10-21': 'Dussehra',
  '2025-10-29': 'Diwali',
  '2025-12-25': 'Christmas Day',

  // 2027 Holidays
  '2027-01-01': "New Year's Day",
  '2027-01-26': 'Republic Day',
  '2027-03-22': 'Holi',
  '2027-05-01': 'Labour Day',
  '2027-08-15': 'Independence Day',
  '2027-10-02': 'Gandhi Jayanti',
  '2027-10-10': 'Dussehra',
  '2027-10-29': 'Diwali',
  '2027-12-25': 'Christmas Day',
};

// Deterministic Pseudo-Random Generator for consistent realistic attendance history
function pseudoRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Helper to parse time string like "08:00 AM" or "22:15" into minutes from midnight
export function parseTimeToMinutes(timeStr: string): number | null {
  if (!timeStr) return null;
  const clean = timeStr.trim();
  const ampmMatch = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2], 10);
    const meridiem = ampmMatch[3].toUpperCase();
    if (meridiem === 'PM' && hours < 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;
    return hours * 60 + minutes;
  }
  const h24Match = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    const hours = parseInt(h24Match[1], 10);
    const minutes = parseInt(h24Match[2], 10);
    return hours * 60 + minutes;
  }
  return null;
}

// OT BONUS, COMPANY MULTIPLIER & DOUBLE OVERTIME POLICY:
// Standard Shift: 08:00 AM – 06:00 PM (10 hours standard).
// Actual Overtime is any work post 18:00 (06:00 PM) or beyond 10 standard working hours.
// Company OT Calculation: Actual OT * Company Multiplier (e.g. 1 hour actual * 1.5 = 1.5 hours credited OT).
// OT BONUS: ₹50 Rupees flat incentive when overtime duration exceeds 4 hours after 18:00 (18:00 to 22:00+).
// DOUBLE OVERTIME (2x OT): When an employee works on declared Gazetted Public Holidays or Off-Days, 
// all hours worked are marked with 2x OT Multiplier.
export function calculateAttendanceHoursAndBonus(
  checkInStr?: string,
  checkOutStr?: string,
  status: DayAttendance['status'] = 'Present',
  isDoubleOvertime: boolean = false,
  otMultiplier: number = 1.5
): {
  workMinutes: number;
  workHours: string;
  actualOvertimeMinutes: number;
  actualOvertimeHours: string | undefined;
  otMultiplier: number;
  companyOvertimeMinutes: number;
  companyOvertimeHours: string | undefined;
  overtimeMinutes: number;
  overtimeHours: string | undefined;
  doubleOvertimeMinutes?: number;
  doubleOvertimeHours?: string;
  isDoubleOvertime: boolean;
  otBonus: number;
  otBonusEligible: boolean;
  lateMinutes: number;
  otFormulaText?: string;
} {
  const effectiveMultiplier = isDoubleOvertime ? 2.0 : (otMultiplier && otMultiplier > 0 ? otMultiplier : 1.5);

  // If non-working and not marked as Double OT / Holiday duty
  if (!isDoubleOvertime && (status === 'Absent' || status === 'On Leave' || status === 'Holiday' || status === 'Weekend')) {
    return {
      workMinutes: 0,
      workHours: '0h 00m',
      actualOvertimeMinutes: 0,
      actualOvertimeHours: undefined,
      otMultiplier: effectiveMultiplier,
      companyOvertimeMinutes: 0,
      companyOvertimeHours: undefined,
      overtimeMinutes: 0,
      overtimeHours: undefined,
      doubleOvertimeMinutes: 0,
      doubleOvertimeHours: undefined,
      isDoubleOvertime: false,
      otBonus: 0,
      otBonusEligible: false,
      lateMinutes: 0,
    };
  }

  if (status === 'Half Day' && !isDoubleOvertime) {
    return {
      workMinutes: 300,
      workHours: '5h 00m',
      actualOvertimeMinutes: 0,
      actualOvertimeHours: undefined,
      otMultiplier: effectiveMultiplier,
      companyOvertimeMinutes: 0,
      companyOvertimeHours: undefined,
      overtimeMinutes: 0,
      overtimeHours: undefined,
      doubleOvertimeMinutes: 0,
      doubleOvertimeHours: undefined,
      isDoubleOvertime: false,
      otBonus: 0,
      otBonusEligible: false,
      lateMinutes: 0,
    };
  }

  const inMins = parseTimeToMinutes(checkInStr || '08:00 AM') ?? 480; // 08:00 AM
  const outMins = parseTimeToMinutes(checkOutStr || '06:00 PM') ?? 1080; // 06:00 PM

  // Late minutes if arrival is after 08:15 AM (grace limit) - only for regular work days
  const lateMinutes = (!isDoubleOvertime && inMins > 495) ? inMins - 480 : 0;

  // Work duration calculation
  const workMinutes = Math.max(0, outMins - inMins);
  const h = Math.floor(workMinutes / 60);
  const m = workMinutes % 60;
  const workHours = `${h}h ${m < 10 ? '0' + m : m}m`;

  let actualOvertimeMinutes = 0;
  let actualOvertimeHours: string | undefined = undefined;
  let companyOvertimeMinutes = 0;
  let companyOvertimeHours: string | undefined = undefined;
  let overtimeMinutes = 0;
  let overtimeHours: string | undefined = undefined;
  let doubleOvertimeMinutes: number | undefined = undefined;
  let doubleOvertimeHours: string | undefined = undefined;
  let otBonus = 0;
  let otBonusEligible = false;
  let otFormulaText: string | undefined = undefined;

  if (isDoubleOvertime) {
    // HOLIDAY / OFF-DAY DOUBLE OVERTIME (2x MULTIPLIER)
    actualOvertimeMinutes = workMinutes;
    const actH = Math.floor(actualOvertimeMinutes / 60);
    const actM = actualOvertimeMinutes % 60;
    actualOvertimeHours = `${actH}h ${actM < 10 ? '0' + actM : actM}m`;

    doubleOvertimeMinutes = Math.round(actualOvertimeMinutes * 2.0);
    const dH = Math.floor(doubleOvertimeMinutes / 60);
    const dM = doubleOvertimeMinutes % 60;
    doubleOvertimeHours = `${dH}h ${dM < 10 ? '0' + dM : dM}m (2x OT)`;
    
    companyOvertimeMinutes = doubleOvertimeMinutes;
    companyOvertimeHours = doubleOvertimeHours;
    overtimeMinutes = doubleOvertimeMinutes;
    overtimeHours = `2x Double OT (${dH}h ${dM < 10 ? '0' + dM : dM}m)`;
    otFormulaText = `${actualOvertimeHours} actual × 2.0 = ${dH}h ${dM < 10 ? '0' + dM : dM}m`;

    // If worked extended hours (e.g. past 18:00 or > 4h overtime)
    const excessPost1800 = Math.max(0, outMins - 1080);
    if (excessPost1800 >= 240 || workMinutes >= 600) {
      otBonus = 50;
      otBonusEligible = true;
    }
  } else {
    // Standard shift: 10 hours (600 mins) ending at 18:00 (1080 mins)
    if (workMinutes > 600) {
      actualOvertimeMinutes = workMinutes - 600;
    } else if (outMins > 1080) {
      actualOvertimeMinutes = outMins - 1080;
    }

    if (actualOvertimeMinutes > 0) {
      const actH = Math.floor(actualOvertimeMinutes / 60);
      const actM = actualOvertimeMinutes % 60;
      actualOvertimeHours = `${actH}h ${actM < 10 ? '0' + actM : actM}m`;

      // Apply Company Calculation Multiplier (e.g. 1h actual * 1.5 = 1.5h company OT)
      companyOvertimeMinutes = Math.round(actualOvertimeMinutes * effectiveMultiplier);
      const compH = Math.floor(companyOvertimeMinutes / 60);
      const compM = companyOvertimeMinutes % 60;
      const compFormatted = `${compH}h ${compM < 10 ? '0' + compM : compM}m`;
      const compDecimal = (companyOvertimeMinutes / 60).toFixed(1);
      const actDecimal = (actualOvertimeMinutes / 60).toFixed(1);

      if (effectiveMultiplier === 1.0) {
        companyOvertimeHours = actualOvertimeHours;
        overtimeMinutes = actualOvertimeMinutes;
        overtimeHours = actualOvertimeHours;
        otFormulaText = `${actualOvertimeHours} (1:1)`;
      } else {
        companyOvertimeHours = `${compFormatted} (${effectiveMultiplier}x)`;
        overtimeMinutes = companyOvertimeMinutes;
        overtimeHours = `${compFormatted} (${actDecimal}h × ${effectiveMultiplier} = ${compDecimal}h)`;
        otFormulaText = `${actDecimal}h actual × ${effectiveMultiplier} = ${compDecimal}h (${compFormatted})`;
      }

      // Overtime over 4 hours (>= 240 mins) post 18:00 (up to 22:00+) triggers ₹50 bonus
      if (actualOvertimeMinutes >= 240 || companyOvertimeMinutes >= 240) {
        otBonus = 50;
        otBonusEligible = true;
      }
    }
  }

  return {
    workMinutes,
    workHours,
    actualOvertimeMinutes,
    actualOvertimeHours,
    otMultiplier: effectiveMultiplier,
    companyOvertimeMinutes,
    companyOvertimeHours,
    overtimeMinutes,
    overtimeHours,
    doubleOvertimeMinutes,
    doubleOvertimeHours,
    isDoubleOvertime,
    otBonus,
    otBonusEligible,
    lateMinutes,
    otFormulaText,
  };
}

// Generate full month calendar days
export function generateMonthAttendance(
  empId: string,
  year: number,
  monthIndex: number // 0-11
): DayAttendance[] {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const days: DayAttendance[] = [];

  // Seed base on employee ID hash
  let empSeed = 0;
  for (let i = 0; i < empId.length; i++) {
    empSeed += empId.charCodeAt(i) * (i + 1);
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(year, monthIndex, d);
    const dayOfWeekIdx = dateObj.getDay(); // 0 = Sun, 6 = Sat
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayOfWeek = dayNames[dayOfWeekIdx];
    const isWeekend = dayOfWeekIdx === 0 || dayOfWeekIdx === 6; // Sun or Sat

    const monthStr = String(monthIndex + 1).padStart(2, '0');
    const dayStr = String(d).padStart(2, '0');
    const dateKey = `${year}-${monthStr}-${dayStr}`;

    const holidayName = COMPANY_HOLIDAYS_MAP[dateKey];
    const isHoliday = !!holidayName;

    // Daily Seed
    const seed = empSeed + year * 1000 + monthIndex * 50 + d * 3;
    const r1 = pseudoRandom(seed);
    const r2 = pseudoRandom(seed + 1);
    const r3 = pseudoRandom(seed + 2);

    if (isHoliday) {
      // Deterministic Holiday Duty with Double Overtime (e.g. Critical Support / Operations Duty)
      const workedHoliday = (r3 < 0.12 && (empId === 'EMP-001' || empId === 'EMP-003' || empId === 'EMP-007' || empId === 'EMP-002'));
      if (workedHoliday) {
        const doubleOtRes = calculateAttendanceHoursAndBonus('08:00 AM', '06:00 PM', 'Holiday', true);
        days.push({
          date: dateKey,
          dayNumber: d,
          dayOfWeek,
          isWeekend,
          isHoliday: true,
          isHolidayWorked: true,
          isDoubleOvertime: true,
          holidayName,
          status: 'Holiday',
          checkIn: '08:00 AM',
          checkOut: '06:00 PM',
          workHours: '10h 00m',
          workMinutes: 600,
          overtimeMinutes: doubleOtRes.overtimeMinutes,
          overtimeHours: doubleOtRes.overtimeHours,
          doubleOvertimeMinutes: doubleOtRes.doubleOvertimeMinutes,
          doubleOvertimeHours: doubleOtRes.doubleOvertimeHours,
          otBonus: doubleOtRes.otBonus,
          otBonusEligible: doubleOtRes.otBonusEligible,
          type: 'Office',
          isManual: true,
          manualReason: `Holiday Duty on ${holidayName} (Double Overtime / 2x Multiplier Authorized)`,
          approvedBy: 'Operations Management',
          notes: `Gazetted Holiday Worked: ${holidayName} (2x Double Overtime Credited)`,
        });
        continue;
      }

      days.push({
        date: dateKey,
        dayNumber: d,
        dayOfWeek,
        isWeekend,
        isHoliday: true,
        holidayName,
        status: 'Holiday',
        notes: `Paid Gazetted Holiday: ${holidayName}`,
      });
      continue;
    }

    if (isWeekend) {
      days.push({
        date: dateKey,
        dayNumber: d,
        dayOfWeek,
        isWeekend: true,
        isHoliday: false,
        status: 'Weekend',
        notes: dayOfWeek === 'Sun' ? 'Weekly Off (Sunday)' : 'Weekly Off (Saturday)',
      });
      continue;
    }

    // Working Day generation based on employee behavior pattern
    // Most employees have 90-95% on-time attendance
    let status: DayAttendance['status'] = 'Present';
    let checkIn: string | undefined = '07:55 AM';
    let checkOut: string | undefined = '06:05 PM';
    let workHours = '10h 10m';
    let workMinutes = 610; // 10h 10m
    let actualOvertimeMinutes = 0;
    let actualOvertimeHours: string | undefined;
    let otMultiplier = 1.5;
    let companyOvertimeMinutes = 0;
    let companyOvertimeHours: string | undefined;
    let overtimeMinutes = 0;
    let overtimeHours: string | undefined;
    let type: DayAttendance['type'] = 'Office';
    let isManual = false;
    let manualReason: string | undefined;
    let approvedBy: string | undefined;
    let lateMinutes = 0;

    // Special cases:
    if (r1 < 0.04) {
      // Absent (Unexcused / Emergency)
      status = 'Absent';
      checkIn = undefined;
      checkOut = undefined;
      workHours = '0h 00m';
      workMinutes = 0;
      actualOvertimeMinutes = 0;
      actualOvertimeHours = undefined;
      companyOvertimeMinutes = 0;
      companyOvertimeHours = undefined;
      overtimeMinutes = 0;
      overtimeHours = undefined;
    } else if (r1 < 0.09) {
      // On Leave (Casual / Sick / Earned)
      status = 'On Leave';
      checkIn = undefined;
      checkOut = undefined;
      workHours = '0h 00m';
      workMinutes = 0;
      actualOvertimeMinutes = 0;
      actualOvertimeHours = undefined;
      companyOvertimeMinutes = 0;
      companyOvertimeHours = undefined;
      overtimeMinutes = 0;
      overtimeHours = undefined;
      const leaveTypes = ['Casual Leave (CL)', 'Sick Leave (SL)', 'Privilege Leave (PL)'];
      const lType = leaveTypes[Math.floor(r2 * leaveTypes.length)];
      manualReason = `Approved Leave: ${lType}`;
      approvedBy = 'HR Department';
    } else if (r1 < 0.15) {
      // Late arrival (> 08:15 AM grace window)
      status = 'Late';
      const lateMins = 20 + Math.floor(r2 * 40); // 08:20 AM to 09:00 AM
      lateMinutes = lateMins;
      const inHour = 8;
      const inMin = lateMins;
      const formattedMin = inMin < 10 ? `0${inMin}` : `${inMin}`;
      checkIn = `08:${formattedMin} AM`;
      checkOut = '06:15 PM';
      
      const totalMins = (18 * 60 + 15) - (8 * 60 + inMin);
      const h = Math.floor(totalMins / 60);
      const m = totalMins % 60;
      workHours = `${h}h ${m < 10 ? '0' + m : m}m`;
      workMinutes = totalMins;
      actualOvertimeMinutes = 0;
      actualOvertimeHours = undefined;
      companyOvertimeMinutes = 0;
      companyOvertimeHours = undefined;
      overtimeMinutes = 0;
      overtimeHours = undefined;
    } else if (r1 < 0.19) {
      // Half Day
      status = 'Half Day';
      checkIn = '08:00 AM';
      checkOut = '01:00 PM';
      workHours = '5h 00m';
      workMinutes = 300;
      actualOvertimeMinutes = 0;
      actualOvertimeHours = undefined;
      companyOvertimeMinutes = 0;
      companyOvertimeHours = undefined;
      overtimeMinutes = 0;
      overtimeHours = undefined;
      manualReason = 'First-half work completed. Personal half-day leave approved.';
      approvedBy = 'Manager';
    } else {
      // Normal Present with shift 08:00 AM to 06:00 PM
      status = 'Present';
      const checkInVariance = Math.floor(r2 * 20) - 10; // -10 to +10 mins around 08:00 AM (07:50 AM to 08:10 AM)
      
      let inTotalMin = 8 * 60 + checkInVariance;
      if (inTotalMin > 8 * 60 + 15) {
        inTotalMin = 8 * 60 + 10; // keep in grace
      }
      const inH = Math.floor(inTotalMin / 60);
      const inM = inTotalMin % 60;
      checkIn = `0${inH}:${inM < 10 ? '0' + inM : inM} AM`;

      // Deterministic check for Extended Overtime (Sprint/Emergency/Deadline work 18:00 to 22:00+)
      // ~10% of present days have >= 4h OT after 18:00 (Check out between 10:00 PM and 10:30 PM)
      let outTotalMin: number;
      if (r3 < 0.12) {
        // High Overtime day: 22:00 to 22:30 (4h to 4h 30m of overtime after 18:00)
        const extendedMins = Math.floor(r2 * 30); // 0 to 30 mins past 22:00
        outTotalMin = 22 * 60 + extendedMins;
        const outH = 10; // 10:xx PM (22:xx)
        const outM = extendedMins;
        checkOut = `${outH < 10 ? '0' + outH : outH}:${outM < 10 ? '0' + outM : outM} PM`;
      } else {
        // Regular variance (0 to 35 mins past 06:00 PM)
        const checkOutVariance = Math.floor(r3 * 35);
        outTotalMin = 18 * 60 + checkOutVariance;
        const outH = Math.floor(outTotalMin / 60) - 12; // 12hr format
        const outM = outTotalMin % 60;
        checkOut = `0${outH}:${outM < 10 ? '0' + outM : outM} PM`;
      }

      const diff = outTotalMin - inTotalMin;
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      workHours = `${h}h ${m < 10 ? '0' + m : m}m`;
      workMinutes = diff;

      // Overtime calculation with 1.5x multiplier: actual OT * 1.5 = company credited OT
      const calcRes = calculateAttendanceHoursAndBonus(checkIn, checkOut, status, false, 1.5);
      actualOvertimeMinutes = calcRes.actualOvertimeMinutes;
      actualOvertimeHours = calcRes.actualOvertimeHours;
      companyOvertimeMinutes = calcRes.companyOvertimeMinutes;
      companyOvertimeHours = calcRes.companyOvertimeHours;
      overtimeMinutes = calcRes.overtimeMinutes;
      overtimeHours = calcRes.overtimeHours;
    }

    // Determine OT Bonus: ₹50 if overtime over 4 hours (>= 240 minutes) after 18:00 (18:00 to 22:00+)
    let otBonus = 0;
    let otBonusEligible = false;
    if (actualOvertimeMinutes >= 240 || companyOvertimeMinutes >= 240) {
      otBonus = 50;
      otBonusEligible = true;
    }

    // Work location type
    if (r2 < 0.15) {
      type = 'Remote';
    } else if (r2 < 0.22 && (empId === 'EMP-003' || empId === 'EMP-008')) {
      type = 'Field';
    } else {
      type = 'Office';
    }

    // Occasional manual adjustment flag
    if (r3 < 0.07 && (status === 'Present' || status === 'Late')) {
      isManual = true;
      manualReason = 'Biometric sync correction / On-duty client visit';
      approvedBy = 'HR Operations';
    }

    days.push({
      date: dateKey,
      dayNumber: d,
      dayOfWeek,
      isWeekend: false,
      isHoliday: false,
      status,
      checkIn,
      checkOut,
      workHours,
      workMinutes,
      actualOvertimeMinutes,
      actualOvertimeHours,
      otMultiplier,
      companyOvertimeMinutes,
      companyOvertimeHours,
      overtimeMinutes,
      overtimeHours,
      otBonus,
      otBonusEligible,
      type,
      isManual,
      manualReason,
      approvedBy,
      lateMinutes,
      device: type === 'Office' ? 'Biometric Reader Main Gate 01' : type === 'Remote' ? 'Web Mobile Portal (Geo-verified)' : 'Field Punch Mobile App',
    });
  }

  return days;
}

// Compute Monthly summary from daily days
export function calculateMonthSummary(
  days: DayAttendance[],
  year: number,
  monthIndex: number
): MonthlyAttendanceSummary {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  let workingDays = 0;
  let presentDays = 0;
  let lateDays = 0;
  let halfDays = 0;
  let absentDays = 0;
  let leaveDays = 0;
  let holidayDays = 0;
  let weekendDays = 0;
  let totalWorkMinutes = 0;
  let totalActualOvertimeMinutes = 0;
  let totalOvertimeMinutes = 0;
  let totalDoubleOvertimeMinutes = 0;
  let totalHolidayWorkDays = 0;
  let totalOtBonusDays = 0;

  days.forEach(day => {
    if (day.isHoliday) {
      holidayDays++;
      if (day.isDoubleOvertime || day.isHolidayWorked || (day.workMinutes && day.workMinutes > 0)) {
        totalHolidayWorkDays++;
        totalWorkMinutes += day.workMinutes || 0;
        totalActualOvertimeMinutes += day.actualOvertimeMinutes || (day.workMinutes || 0);
        totalOvertimeMinutes += day.companyOvertimeMinutes || day.overtimeMinutes || 0;
        totalDoubleOvertimeMinutes += day.doubleOvertimeMinutes || ((day.workMinutes || 0) * 2);
        if (day.otBonus && day.otBonus > 0) {
          totalOtBonusDays++;
        }
      }
    } else if (day.isWeekend) {
      weekendDays++;
      if (day.isDoubleOvertime || (day.workMinutes && day.workMinutes > 0)) {
        totalHolidayWorkDays++;
        totalWorkMinutes += day.workMinutes || 0;
        totalActualOvertimeMinutes += day.actualOvertimeMinutes || (day.workMinutes || 0);
        totalOvertimeMinutes += day.companyOvertimeMinutes || day.overtimeMinutes || 0;
        totalDoubleOvertimeMinutes += day.doubleOvertimeMinutes || ((day.workMinutes || 0) * 2);
        if (day.otBonus && day.otBonus > 0) {
          totalOtBonusDays++;
        }
      }
    } else {
      workingDays++;
      if (day.status === 'Present') {
        presentDays++;
      } else if (day.status === 'Late') {
        lateDays++;
      } else if (day.status === 'Half Day') {
        halfDays++;
      } else if (day.status === 'Absent') {
        absentDays++;
      } else if (day.status === 'On Leave') {
        leaveDays++;
      }
      totalWorkMinutes += day.workMinutes || 0;
      totalActualOvertimeMinutes += day.actualOvertimeMinutes || day.overtimeMinutes || 0;
      totalOvertimeMinutes += day.companyOvertimeMinutes || day.overtimeMinutes || 0;
      if (day.isDoubleOvertime) {
        totalDoubleOvertimeMinutes += day.doubleOvertimeMinutes || ((day.workMinutes || 0) * 2);
        totalHolidayWorkDays++;
      }
      if (day.otBonus && day.otBonus > 0) {
        totalOtBonusDays++;
      }
    }
  });

  const totalOtBonusAmount = totalOtBonusDays * 50;
  const effectiveWorkedDays = presentDays + lateDays + halfDays * 0.5;
  const attendancePercentage = workingDays > 0 ? Math.min(100, Math.round((effectiveWorkedDays / workingDays) * 1000) / 10) : 100;
  
  const onTimeDays = presentDays;
  const punctualityScore = (presentDays + lateDays) > 0 ? Math.round((onTimeDays / (presentDays + lateDays)) * 100) : 100;

  const totalH = Math.floor(totalWorkMinutes / 60);
  const totalM = totalWorkMinutes % 60;
  const totalWorkHoursFormatted = `${totalH}h ${totalM}m`;

  const actOtH = Math.floor(totalActualOvertimeMinutes / 60);
  const actOtM = totalActualOvertimeMinutes % 60;
  const totalActualOvertimeHoursFormatted = `${actOtH}h ${actOtM}m`;

  const otH = Math.floor(totalOvertimeMinutes / 60);
  const otM = totalOvertimeMinutes % 60;
  const totalOvertimeHoursFormatted = `${otH}h ${otM}m`;

  const dotH = Math.floor(totalDoubleOvertimeMinutes / 60);
  const dotM = totalDoubleOvertimeMinutes % 60;
  const totalDoubleOvertimeHoursFormatted = `${dotH}h ${dotM}m`;

  const avgMinutes = effectiveWorkedDays > 0 ? Math.round(totalWorkMinutes / (presentDays + lateDays + halfDays)) : 0;
  const avgH = Math.floor(avgMinutes / 60);
  const avgM = avgMinutes % 60;
  const avgDailyHoursFormatted = `${avgH}h ${avgM}m`;

  return {
    monthIndex,
    monthName: monthNames[monthIndex],
    year,
    totalCalendarDays: days.length,
    workingDays,
    presentDays,
    lateDays,
    halfDays,
    absentDays,
    leaveDays,
    holidayDays,
    weekendDays,
    totalWorkMinutes,
    totalWorkHoursFormatted,
    totalActualOvertimeMinutes,
    totalActualOvertimeHoursFormatted,
    totalOvertimeMinutes,
    totalOvertimeHoursFormatted,
    totalDoubleOvertimeMinutes,
    totalDoubleOvertimeHoursFormatted,
    totalHolidayWorkDays,
    totalOtBonusDays,
    totalOtBonusAmount,
    avgDailyMinutes: avgMinutes,
    avgDailyHoursFormatted,
    attendancePercentage,
    punctualityScore,
  };
}

// Generate Full Year data for an employee
export function generateYearAttendance(
  empId: string,
  year: number
): {
  summary: YearlyAttendanceSummary;
  allDays: DayAttendance[];
} {
  const employee = ATTENDANCE_EMPLOYEES.find(e => e.id === empId) || ATTENDANCE_EMPLOYEES[0];
  const monthlyBreakdown: MonthlyAttendanceSummary[] = [];
  const allDays: DayAttendance[] = [];

  let totalWorkingDays = 0;
  let totalPresent = 0;
  let totalLate = 0;
  let totalHalfDays = 0;
  let totalAbsent = 0;
  let totalLeaves = 0;
  let totalHolidays = 0;
  let totalWorkMinutes = 0;
  let totalOvertimeMinutes = 0;
  let totalDoubleOvertimeMinutes = 0;
  let totalHolidayWorkDays = 0;
  let totalOtBonusDays = 0;

  for (let m = 0; m < 12; m++) {
    const monthDays = generateMonthAttendance(empId, year, m);
    allDays.push(...monthDays);
    const mSummary = calculateMonthSummary(monthDays, year, m);
    monthlyBreakdown.push(mSummary);

    totalWorkingDays += mSummary.workingDays;
    totalPresent += mSummary.presentDays;
    totalLate += mSummary.lateDays;
    totalHalfDays += mSummary.halfDays;
    totalAbsent += mSummary.absentDays;
    totalLeaves += mSummary.leaveDays;
    totalHolidays += mSummary.holidayDays;
    totalWorkMinutes += mSummary.totalWorkMinutes;
    totalOvertimeMinutes += mSummary.totalOvertimeMinutes;
    totalDoubleOvertimeMinutes += mSummary.totalDoubleOvertimeMinutes || 0;
    totalHolidayWorkDays += mSummary.totalHolidayWorkDays || 0;
    totalOtBonusDays += mSummary.totalOtBonusDays;
  }

  const totalOtBonusAmount = totalOtBonusDays * 50;
  const effectiveWorkedDays = totalPresent + totalLate + totalHalfDays * 0.5;
  const annualAttendanceRate = totalWorkingDays > 0 ? Math.round((effectiveWorkedDays / totalWorkingDays) * 1000) / 10 : 100;
  const punctualityRate = (totalPresent + totalLate) > 0 ? Math.round((totalPresent / (totalPresent + totalLate)) * 1000) / 10 : 100;

  const totalWorkHours = Math.round((totalWorkMinutes / 60) * 10) / 10;
  const totalOvertimeHours = Math.round((totalOvertimeMinutes / 60) * 10) / 10;
  const totalDoubleOvertimeHours = Math.round((totalDoubleOvertimeMinutes / 60) * 10) / 10;

  const summary: YearlyAttendanceSummary = {
    year,
    employeeId: employee.id,
    employeeName: employee.name,
    totalWorkingDays,
    totalPresent,
    totalLate,
    totalHalfDays,
    totalAbsent,
    totalLeaves,
    totalHolidays,
    annualAttendanceRate,
    punctualityRate,
    totalWorkHours,
    totalOvertimeHours,
    totalDoubleOvertimeHours,
    totalHolidayWorkDays,
    totalOtBonusDays,
    totalOtBonusAmount,
    monthlyBreakdown,
  };

  return { summary, allDays };
}

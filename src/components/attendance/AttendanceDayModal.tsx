import React, { useState } from 'react';
import { 
  X, Calendar, Clock, MapPin, Laptop, Building, Briefcase, 
  UserCheck, FileEdit, CheckCircle2, AlertTriangle, ShieldCheck, 
  Info, Sparkles, Check, Download, Award, Zap, Calculator
} from 'lucide-react';
import { DayAttendance, EmployeeProfile } from '../../types/attendance';
import { calculateAttendanceHoursAndBonus } from '../../data/attendanceData';
import { cn } from '../../lib/utils';

interface AttendanceDayModalProps {
  day: DayAttendance | null;
  employee: EmployeeProfile;
  isOpen: boolean;
  onClose: () => void;
  onSaveDayRecord: (updatedDay: DayAttendance) => void;
}

export const AttendanceDayModal: React.FC<AttendanceDayModalProps> = ({
  day,
  employee,
  isOpen,
  onClose,
  onSaveDayRecord,
}) => {
  if (!isOpen || !day) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [status, setStatus] = useState<DayAttendance['status']>(day.status);
  const [checkIn, setCheckIn] = useState<string>(day.checkIn || '08:00 AM');
  const [checkOut, setCheckOut] = useState<string>(day.checkOut || '06:00 PM');
  const [isDoubleOvertime, setIsDoubleOvertime] = useState<boolean>(day.isDoubleOvertime || false);
  const [otMultiplier, setOtMultiplier] = useState<number>(day.otMultiplier ?? (day.isDoubleOvertime ? 2.0 : 1.5));
  const [type, setType] = useState<DayAttendance['type']>(day.type || 'Office');
  const [reason, setReason] = useState<string>(day.manualReason || '');
  const [approvedBy, setApprovedBy] = useState<string>(day.approvedBy || 'HR Operations');
  const [notes, setNotes] = useState<string>(day.notes || '');

  const dateObj = new Date(day.date);
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const computedHours = React.useMemo(() => {
    return calculateAttendanceHoursAndBonus(checkIn, checkOut, status, isDoubleOvertime, otMultiplier);
  }, [checkIn, checkOut, status, isDoubleOvertime, otMultiplier]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const isNonWorking = !isDoubleOvertime && (status === 'Absent' || status === 'On Leave' || status === 'Holiday' || status === 'Weekend');

    const updated: DayAttendance = {
      ...day,
      status,
      checkIn: isNonWorking ? undefined : checkIn,
      checkOut: isNonWorking ? undefined : checkOut,
      workHours: computedHours.workHours,
      workMinutes: computedHours.workMinutes,
      actualOvertimeHours: computedHours.actualOvertimeHours,
      actualOvertimeMinutes: computedHours.actualOvertimeMinutes,
      otMultiplier: computedHours.otMultiplier,
      companyOvertimeHours: computedHours.companyOvertimeHours,
      companyOvertimeMinutes: computedHours.companyOvertimeMinutes,
      overtimeHours: computedHours.overtimeHours,
      overtimeMinutes: computedHours.overtimeMinutes,
      isDoubleOvertime: isDoubleOvertime,
      doubleOvertimeHours: computedHours.doubleOvertimeHours,
      doubleOvertimeMinutes: computedHours.doubleOvertimeMinutes,
      isHolidayWorked: isDoubleOvertime || day.isHoliday,
      otBonus: computedHours.otBonus,
      otBonusEligible: computedHours.otBonusEligible,
      lateMinutes: computedHours.lateMinutes,
      type,
      isManual: true,
      manualReason: reason || (isDoubleOvertime ? 'Holiday Duty with 2x Double Overtime' : 'Manual adjustment via Attendance Calendar'),
      approvedBy,
      notes: notes || (isDoubleOvertime ? `Holiday Work (2x Double Overtime credited)` : undefined),
    };

    onSaveDayRecord(updated);
    setIsEditing(false);
  };

  const handleQuickMarkHolidayWork = () => {
    setIsDoubleOvertime(true);
    setOtMultiplier(2.0);
    setCheckIn('08:00 AM');
    setCheckOut('06:00 PM');
    setReason(`Holiday Duty on ${day.holidayName || formattedDate} (2x Double Overtime Authorized)`);
    setIsEditing(true);
  };

  const getStatusBadge = (st: DayAttendance['status']) => {
    switch (st) {
      case 'Present':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Late':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Half Day':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Absent':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'On Leave':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Holiday':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Weekend':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const showTimeInputs = status === 'Present' || status === 'Late' || status === 'Half Day' || isDoubleOvertime;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" /> Day Audit Record
              </span>
              <span className={cn("px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border", getStatusBadge(day.status))}>
                {day.status}
              </span>
              {day.isDoubleOvertime && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-300 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-600 fill-purple-500" /> 2x Double OT
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">{formattedDate}</h2>
            <p className="text-xs text-slate-500">
              {employee.name} ({employee.id}) &bull; {employee.department} &bull; {employee.designation}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Breakdown vs Edit Form */}
        {!isEditing ? (
          <div className="space-y-5">
            {/* Double Overtime Callout Banner if Applied */}
            {day.isDoubleOvertime && (
              <div className="bg-gradient-to-r from-purple-900/10 via-indigo-500/10 to-amber-500/10 border-2 border-purple-300 rounded-xl p-4 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-base shadow-sm">
                    <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-purple-950">Double Overtime (2x OT) Applied</span>
                      <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 border border-purple-300">
                        Holiday / Off-Day Duty
                      </span>
                    </div>
                    <p className="text-xs text-purple-800 font-medium mt-0.5">
                      Worked on {day.holidayName || 'Holiday/Off-day'}. 100% bonus wage multiplier credited (2x rate).
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-purple-900 block font-mono">
                    {day.doubleOvertimeHours || '2x Double OT'}
                  </span>
                  <span className="text-[10px] text-purple-600 font-semibold uppercase">Overtime Multiplier</span>
                </div>
              </div>
            )}

            {/* Standard Shift & OT Bonus Policy Notice */}
            <div className="space-y-2">
              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-xs text-blue-900 font-medium">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Assigned Shift: <strong>08:00 AM – 06:00 PM</strong> (10h Standard Workday)</span>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase">
                  Grace: ≤ 08:15 AM
                </span>
              </div>

              {/* OT Bonus Policy callout */}
              {(day.otBonus || (day.overtimeMinutes && day.overtimeMinutes >= 240)) ? (
                <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-emerald-500/10 border border-amber-300 rounded-xl p-3.5 flex items-center justify-between shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                      ₹
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-amber-950">₹50 OT Bonus Earned</span>
                        <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                          Policy Verified
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        Overtime exceeded 4 hours after 18:00 (18:00 to 22:00+).
                      </p>
                    </div>
                  </div>
                  <span className="text-base font-bold font-mono text-amber-700 bg-amber-100/90 px-3 py-1 rounded-lg border border-amber-300">
                    +₹50
                  </span>
                </div>
              ) : null}
            </div>

            {/* Punch Details Card */}
            {(day.checkIn || day.workHours || day.isDoubleOvertime) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Check In Time</span>
                  <span className="text-base font-bold font-mono text-slate-900 block">{day.checkIn || '—'}</span>
                  {day.lateMinutes && day.lateMinutes > 0 ? (
                    <span className="text-[10px] font-bold text-amber-600">+{day.lateMinutes}m Late</span>
                  ) : day.checkIn ? (
                    <span className="text-[10px] font-bold text-emerald-600">On Time</span>
                  ) : null}
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Check Out Time</span>
                  <span className="text-base font-bold font-mono text-slate-900 block">{day.checkOut || '—'}</span>
                  {day.checkOut && (
                    <span className="text-[10px] text-slate-500 font-medium">Scheduled: 06:00 PM</span>
                  )}
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Duration</span>
                  <span className="text-base font-bold font-mono text-slate-900 block">{day.workHours || '0h 00m'}</span>
                  {day.isDoubleOvertime ? (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-300">
                      ⚡ 2x Double OT
                    </span>
                  ) : day.overtimeHours ? (
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.2 rounded border border-purple-200">
                      +{day.overtimeHours}
                    </span>
                  ) : null}
                </div>
              </div>
            )}

            {/* Overtime & Company Multiplier Calculation Breakdown (Read-Only) */}
            {((day.overtimeMinutes && day.overtimeMinutes > 0) || day.isDoubleOvertime || (day.actualOvertimeMinutes && day.actualOvertimeMinutes > 0)) && (
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold text-xs">
                      <Calculator className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">Overtime Calculation Audit</h4>
                      <p className="text-[11px] text-purple-700">Actual Clocked OT vs Company Rate Calculation</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-purple-800 font-mono bg-purple-100 px-2 py-0.5 rounded-full border border-purple-300">
                    Rate: {day.otMultiplier || (day.isDoubleOvertime ? 2.0 : 1.5)}x
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 pt-1">
                  <div className="bg-white/90 p-2.5 rounded-xl border border-purple-100">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Actual Clocked OT</span>
                    <span className="text-sm font-bold font-mono text-slate-800">
                      {day.actualOvertimeHours || (day.isDoubleOvertime ? day.workHours : day.overtimeHours) || '0h 00m'}
                    </span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-xl border border-purple-100">
                    <span className="text-[10px] font-semibold text-slate-500 uppercase block">Company Factor</span>
                    <span className="text-sm font-bold font-mono text-purple-700">
                      × {day.otMultiplier || (day.isDoubleOvertime ? 2.0 : 1.5)}
                    </span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-xl border border-purple-200 bg-purple-50/50">
                    <span className="text-[10px] font-bold text-purple-900 uppercase block">Company Credited OT</span>
                    <span className="text-sm font-bold font-mono text-purple-900">
                      {day.companyOvertimeHours || day.overtimeHours || '0h 00m'}
                    </span>
                  </div>
                </div>

                <div className="px-3 py-1.5 bg-purple-100/80 rounded-lg text-[11px] font-medium text-purple-900 flex items-center justify-between font-mono">
                  <span>Formula:</span>
                  <span className="font-bold">
                    {day.actualOvertimeHours || '1h 00m'} actual × {day.otMultiplier || (day.isDoubleOvertime ? 2.0 : 1.5)} = {day.companyOvertimeHours || day.overtimeHours}
                  </span>
                </div>
              </div>
            )}

            {/* Holiday / Weekend Banner if applicable */}
            {day.isHoliday && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-indigo-900 uppercase tracking-wider mb-0.5">Gazetted Public Holiday</p>
                  <p className="text-sm font-semibold text-indigo-950">{day.holidayName}</p>
                  <p className="text-xs text-indigo-700 mt-1">Paid company holiday. Standard 10h wages credited in payroll.</p>
                </div>
                {!day.isDoubleOvertime && (
                  <button
                    type="button"
                    onClick={handleQuickMarkHolidayWork}
                    className="shrink-0 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Mark Double OT
                  </button>
                )}
              </div>
            )}

            {day.isWeekend && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-0.5">Weekly Rest Day</p>
                  <p className="text-sm font-medium text-slate-800">{day.notes || 'Weekly Off'}</p>
                </div>
                {!day.isDoubleOvertime && (
                  <button
                    type="button"
                    onClick={handleQuickMarkHolidayWork}
                    className="shrink-0 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm cursor-pointer transition-colors"
                  >
                    <Zap className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Mark Weekend OT (2x)
                  </button>
                )}
              </div>
            )}

            {/* Location & Biometric Source */}
            {day.type && (
              <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  {day.type === 'Office' && <Building className="w-4 h-4 text-slate-500" />}
                  {day.type === 'Remote' && <Laptop className="w-4 h-4 text-blue-500" />}
                  {day.type === 'Field' && <Briefcase className="w-4 h-4 text-amber-500" />}
                  {day.type === 'On Duty' && <UserCheck className="w-4 h-4 text-emerald-500" />}
                  <span className="font-semibold text-slate-800">Mode: {day.type}</span>
                </div>
                <span className="text-slate-500 text-[11px]">{day.device || 'Office Biometric Gateway'}</span>
              </div>
            )}

            {/* Manual Entry Audit Note if adjusted */}
            {day.isManual && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-amber-800 font-bold uppercase tracking-wider text-[10px]">
                  <FileEdit className="w-3.5 h-3.5" /> Manual Adjustment Record
                </div>
                <p className="text-amber-950 font-medium">{day.manualReason}</p>
                {day.approvedBy && (
                  <p className="text-amber-700 text-[11px] pt-1 border-t border-amber-200/60">
                    Authorized by: <strong className="font-semibold text-amber-900">{day.approvedBy}</strong>
                  </p>
                )}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-blue-200 flex items-center gap-2 cursor-pointer"
              >
                <FileEdit className="w-4 h-4" /> Edit / Adjust Punch
              </button>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        ) : (
          /* EDIT FORM */
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Attendance Status *
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {(['Present', 'Late', 'Half Day', 'Absent', 'On Leave', 'Holiday', 'Weekend'] as const).map(st => (
                  <button
                    type="button"
                    key={st}
                    onClick={() => {
                      setStatus(st);
                      if (st === 'Holiday' || st === 'Weekend') {
                        // Keep double OT if toggled
                      }
                    }}
                    className={cn(
                      "py-2 px-2 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center",
                      status === st
                        ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Double Overtime Marking Option Toggle */}
            <div className={cn(
              "p-3.5 rounded-xl border transition-all",
              isDoubleOvertime 
                ? "bg-purple-50/80 border-purple-300 ring-2 ring-purple-500/20" 
                : "bg-slate-50 border-slate-200 hover:bg-slate-100/60"
            )}>
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isDoubleOvertime}
                  onChange={(e) => setIsDoubleOvertime(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 cursor-pointer"
                />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-purple-600 fill-purple-600" /> Double Overtime (2x OT Rate)
                    </span>
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 bg-purple-200 text-purple-900 rounded">
                      Holiday / Off-Day Work
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Mark if employee worked during gazetted public holidays or weekly rest days. Applies 2x double overtime multiplier.
                  </p>
                </div>
              </label>
            </div>

            {showTimeInputs && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Check-In Time *
                    </label>
                    <input
                      type="text"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      placeholder="e.g. 07:55 AM"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                      Check-Out Time *
                    </label>
                    <input
                      type="text"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      placeholder="e.g. 06:05 PM"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Work Location / Mode *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Office">Office</option>
                    <option value="Remote">Remote / Work From Home</option>
                    <option value="Field">Field / Client Site</option>
                    <option value="On Duty">On Duty (Authorized)</option>
                  </select>
                </div>

                {/* Overtime Multiplier & Company Calculation Rate Input Section */}
                <div className="p-3.5 bg-purple-50/60 border border-purple-200 rounded-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-purple-950 flex items-center gap-1.5 uppercase tracking-wider">
                      <Calculator className="w-3.5 h-3.5 text-purple-600" />
                      Company OT Multiplier Rate *
                    </label>
                    <span className="text-[10px] text-purple-700 font-semibold">
                      Formula: Actual OT × Multiplier
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
                          setOtMultiplier(preset.val);
                          if (preset.val === 2.0 && !isDoubleOvertime) {
                            setIsDoubleOvertime(true);
                          } else if (preset.val !== 2.0 && isDoubleOvertime) {
                            setIsDoubleOvertime(false);
                          }
                        }}
                        className={cn(
                          "py-2 px-3 text-xs font-bold rounded-lg border transition-all cursor-pointer text-center",
                          otMultiplier === preset.val
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
                        value={otMultiplier}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1.0;
                          setOtMultiplier(val);
                          if (val === 2.0) setIsDoubleOvertime(true);
                        }}
                        className="w-full px-3 py-1.5 bg-white border border-purple-200 rounded-lg text-sm font-mono font-bold text-purple-900 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                      <span className="absolute right-3 top-1.5 text-xs font-bold text-purple-500">x Factor</span>
                    </div>
                  </div>

                  {/* Dynamic Math Display (e.g. 1 hour actual * 1.5 = 1.5 hours company calculation) */}
                  <div className="p-2.5 bg-white/90 rounded-lg border border-purple-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-purple-900 font-medium">
                      <span>Actual OT Clocked: <strong className="font-mono">{computedHours.actualOvertimeHours || '0h 00m'}</strong></span>
                      <span>Company Factor: <strong className="font-mono">× {otMultiplier}</strong></span>
                      <span>Total Company OT: <strong className="font-mono text-purple-700">{computedHours.companyOvertimeHours || computedHours.overtimeHours || '0h 00m'}</strong></span>
                    </div>
                    {computedHours.actualOvertimeMinutes > 0 && (
                      <div className="text-[11px] font-mono font-bold text-purple-800 pt-1 border-t border-purple-100 flex items-center justify-between">
                        <span>Calculation Result:</span>
                        <span>{computedHours.otFormulaText || `${(computedHours.actualOvertimeMinutes/60).toFixed(1)}h actual × ${otMultiplier} = ${(computedHours.companyOvertimeMinutes/60).toFixed(1)}h total`}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Computed Work Hours & OT Bonus preview */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Computed Duration:</span>
                    <span className="font-mono font-bold text-slate-900">
                      {computedHours.workHours}
                      {isDoubleOvertime && computedHours.doubleOvertimeHours ? (
                        <span className="text-purple-700 font-bold ml-1.5 bg-purple-100 px-1.5 py-0.5 rounded">
                          ⚡ {computedHours.doubleOvertimeHours}
                        </span>
                      ) : computedHours.overtimeHours ? (
                        <span className="text-purple-600 font-bold ml-1.5">
                          (+{computedHours.overtimeHours} OT)
                        </span>
                      ) : null}
                    </span>
                  </div>

                  {isDoubleOvertime && (
                    <div className="flex items-center justify-between text-purple-900 bg-purple-100/70 border border-purple-300 px-2.5 py-1 rounded-lg">
                      <span className="font-semibold flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-purple-700 fill-purple-700" /> Holiday Double Overtime (2x Multiplier):
                      </span>
                      <span className="font-bold font-mono text-purple-800">
                        {computedHours.doubleOvertimeHours || '2x Double OT'}
                      </span>
                    </div>
                  )}

                  {computedHours.otBonusEligible && (
                    <div className="flex items-center justify-between text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                      <span className="font-semibold flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-600" /> ₹50 OT Bonus Policy Eligible:
                      </span>
                      <span className="font-bold font-mono text-amber-700">+₹50.00</span>
                    </div>
                  )}
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Adjustment Reason / Note *
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Holiday duty deployment, Biometric misread, Manager authorized"
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Authorized / Approved By
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="e.g. HR Operations / Manager"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" /> Save Adjustment
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};


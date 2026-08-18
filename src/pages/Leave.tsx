import React, { useState, useMemo } from 'react';
import { 
  Calendar, CheckCircle2, Clock, XCircle, Search, Filter, Plus, 
  User, Check, X, AlertCircle, FileText, ChevronRight, Eye, 
  Trash2, ShieldCheck, Sparkles, Send, Info, ArrowRight, 
  CalendarRange, HeartPulse, Palmtree, UserCheck, Briefcase, 
  Layers, Download, RefreshCw
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ATTENDANCE_EMPLOYEES } from '../data/attendanceData';
import { format, differenceInCalendarDays, parseISO, isSunday } from 'date-fns';

export interface LeaveRequest {
  id: string;
  empId: string;
  empName: string;
  department: string;
  type: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Comp-Off' | 'Maternity / Paternity' | 'Unpaid Leave';
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  session: 'Full Day' | 'First Half' | 'Second Half';
  days: number;
  reason: string;
  handoverTo?: string;
  emergencyPhone?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  appliedOn: string;
  approvedBy?: string;
  approvalRemarks?: string;
}

export interface EmployeeLeaveBalance {
  empId: string;
  empName: string;
  department: string;
  casual: { total: number; used: number; pending: number };
  sick: { total: number; used: number; pending: number };
  earned: { total: number; used: number; pending: number };
  compOff: { total: number; used: number; pending: number };
}

const LEAVE_TYPES = [
  { 
    name: 'Casual Leave', 
    code: 'CL', 
    quota: 12, 
    color: 'bg-blue-50 text-blue-700 border-blue-200', 
    icon: Calendar,
    desc: 'General personal matters, family events & urgent personal work' 
  },
  { 
    name: 'Sick Leave', 
    code: 'SL', 
    quota: 10, 
    color: 'bg-rose-50 text-rose-700 border-rose-200', 
    icon: HeartPulse,
    desc: 'Medical recovery, illness, consultations & medical emergencies' 
  },
  { 
    name: 'Earned Leave', 
    code: 'EL', 
    quota: 18, 
    color: 'bg-emerald-50 text-emerald-700 border-emerald-200', 
    icon: Palmtree,
    desc: 'Planned annual vacation, personal travel and extended rest' 
  },
  { 
    name: 'Comp-Off', 
    code: 'CO', 
    quota: 4, 
    color: 'bg-purple-50 text-purple-700 border-purple-200', 
    icon: Layers,
    desc: 'Compensatory day off earned for weekend / holiday shift duty' 
  },
  { 
    name: 'Unpaid Leave', 
    code: 'LOP', 
    quota: 0, 
    color: 'bg-slate-100 text-slate-700 border-slate-200', 
    icon: Briefcase,
    desc: 'Loss of pay leave when allotted quotas are exhausted' 
  },
] as const;

const INITIAL_LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: 'LR-101',
    empId: 'EMP-001',
    empName: 'Arjun Sharma',
    department: 'Engineering',
    type: 'Sick Leave',
    startDate: '2026-08-19',
    endDate: '2026-08-20',
    session: 'Full Day',
    days: 2,
    reason: 'Viral fever and prescribed medical rest for 2 days.',
    handoverTo: 'Priya Patel',
    emergencyPhone: '+91 98450 12345',
    status: 'Pending',
    appliedOn: '2026-08-18',
  },
  {
    id: 'LR-102',
    empId: 'EMP-002',
    empName: 'Priya Patel',
    department: 'Human Resources',
    type: 'Earned Leave',
    startDate: '2026-08-24',
    endDate: '2026-08-28',
    session: 'Full Day',
    days: 5,
    reason: 'Annual family holiday trip and travel.',
    handoverTo: 'Ananya Desai',
    emergencyPhone: '+91 98450 23456',
    status: 'Approved',
    appliedOn: '2026-08-10',
    approvedBy: 'Admin (Shafi)',
    approvalRemarks: 'Approved. Enjoy your vacation!',
  },
  {
    id: 'LR-103',
    empId: 'EMP-004',
    empName: 'Ananya Desai',
    department: 'Marketing',
    type: 'Casual Leave',
    startDate: '2026-08-12',
    endDate: '2026-08-12',
    session: 'Full Day',
    days: 1,
    reason: 'Personal legal documentation and bank appointment.',
    handoverTo: 'Vikram Singh',
    status: 'Rejected',
    appliedOn: '2026-08-11',
    approvedBy: 'Admin (Shafi)',
    approvalRemarks: 'Quarterly marketing review scheduled on this date.',
  },
  {
    id: 'LR-104',
    empId: 'EMP-003',
    empName: 'Vikram Singh',
    department: 'Sales',
    type: 'Comp-Off',
    startDate: '2026-08-21',
    endDate: '2026-08-21',
    session: 'Full Day',
    days: 1,
    reason: 'Comp-off for emergency client deployment on Sunday (Aug 16).',
    handoverTo: 'Amit Kumar',
    status: 'Pending',
    appliedOn: '2026-08-17',
  },
  {
    id: 'LR-105',
    empId: 'EMP-005',
    empName: 'Rohan Mehta',
    department: 'Finance',
    type: 'Casual Leave',
    startDate: '2026-08-25',
    endDate: '2026-08-25',
    session: 'Second Half',
    days: 0.5,
    reason: 'Parent-teacher meeting at school in the afternoon.',
    handoverTo: 'Kavita Iyer',
    status: 'Pending',
    appliedOn: '2026-08-18',
  }
];

export function Leave() {
  const [activeTab, setActiveTab] = useState<'requests' | 'balance'>('requests');
  const [requests, setRequests] = useState<LeaveRequest[]>(INITIAL_LEAVE_REQUESTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  
  // Modal states
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRequestDetails, setSelectedRequestDetails] = useState<LeaveRequest | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Apply Leave
  const [applyForm, setApplyForm] = useState({
    empId: 'EMP-001',
    type: 'Casual Leave' as LeaveRequest['type'],
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    session: 'Full Day' as 'Full Day' | 'First Half' | 'Second Half',
    reason: '',
    handoverTo: 'Priya Patel',
    emergencyPhone: '+91 98450 12345',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Helper: calculate working days (excluding Sundays)
  const calculateDaysCount = (startStr: string, endStr: string, session: 'Full Day' | 'First Half' | 'Second Half') => {
    if (!startStr || !endStr) return 0;
    if (session === 'First Half' || session === 'Second Half') return 0.5;

    const start = new Date(startStr);
    const end = new Date(endStr);
    if (end < start) return 0;

    let count = 0;
    const cur = new Date(start);
    while (cur <= end) {
      if (!isSunday(cur)) {
        count += 1;
      }
      cur.setDate(cur.getDate() + 1);
    }
    return count === 0 ? 1 : count;
  };

  const calculatedDays = useMemo(() => {
    return calculateDaysCount(applyForm.startDate, applyForm.endDate, applyForm.session);
  }, [applyForm.startDate, applyForm.endDate, applyForm.session]);

  // Metric stats
  const stats = useMemo(() => {
    const total = requests.length;
    const pending = requests.filter(r => r.status === 'Pending').length;
    const approved = requests.filter(r => r.status === 'Approved').length;
    const rejected = requests.filter(r => r.status === 'Rejected').length;
    const totalDaysTaken = requests
      .filter(r => r.status === 'Approved')
      .reduce((sum, r) => sum + r.days, 0);

    return { total, pending, approved, rejected, totalDaysTaken };
  }, [requests]);

  // Filtered requests
  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      const matchesSearch = 
        r.empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.empId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.reason.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (typeFilter !== 'All' && r.type !== typeFilter) return false;
      return true;
    });
  }, [requests, searchTerm, statusFilter, typeFilter]);

  // Handle open apply modal
  const handleOpenApplyModal = (preselectedType?: LeaveRequest['type'], preselectedEmpId?: string) => {
    setApplyForm({
      empId: preselectedEmpId || 'EMP-001',
      type: preselectedType || 'Casual Leave',
      startDate: format(new Date(), 'yyyy-MM-dd'),
      endDate: format(new Date(), 'yyyy-MM-dd'),
      session: 'Full Day',
      reason: '',
      handoverTo: 'Priya Patel',
      emergencyPhone: '+91 98450 12345',
    });
    setShowApplyModal(true);
  };

  // Submit Apply Leave
  const handleSaveLeaveApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.reason.trim()) {
      showToast('Please provide a brief reason for the leave application.');
      return;
    }

    const emp = ATTENDANCE_EMPLOYEES.find(e => e.id === applyForm.empId) || {
      id: applyForm.empId,
      name: 'Arjun Sharma',
      department: 'Engineering',
    };

    const newReq: LeaveRequest = {
      id: `LR-${Math.floor(100 + Math.random() * 900)}`,
      empId: emp.id,
      empName: emp.name,
      department: emp.department,
      type: applyForm.type,
      startDate: applyForm.startDate,
      endDate: applyForm.endDate,
      session: applyForm.session,
      days: calculatedDays,
      reason: applyForm.reason.trim(),
      handoverTo: applyForm.handoverTo,
      emergencyPhone: applyForm.emergencyPhone,
      status: 'Pending',
      appliedOn: format(new Date(), 'yyyy-MM-dd'),
    };

    setRequests(prev => [newReq, ...prev]);
    setShowApplyModal(false);
    showToast(`Leave application (${calculatedDays} day${calculatedDays > 1 ? 's' : ''}) submitted successfully for ${emp.name}.`);
  };

  // Status changers
  const handleApproveRequest = (id: string, empName: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'Approved',
          approvedBy: 'Admin (Shafi)',
          approvalRemarks: 'Approved via HR management desk.'
        };
      }
      return r;
    }));
    showToast(`Leave request ${id} for ${empName} was Approved.`);
  };

  const handleRejectRequest = (id: string, empName: string) => {
    setRequests(prev => prev.map(r => {
      if (r.id === id) {
        return {
          ...r,
          status: 'Rejected',
          approvedBy: 'Admin (Shafi)',
          approvalRemarks: 'Declined due to operational scheduling conflicts.'
        };
      }
      return r;
    }));
    showToast(`Leave request ${id} for ${empName} was Rejected.`);
  };

  const handleDeleteRequest = (id: string) => {
    setRequests(prev => prev.filter(r => r.id !== id));
    showToast(`Leave request ${id} was removed.`);
  };

  // Quick reason presets
  const quickReasons = [
    'Medical Appointment / Health Recovery',
    'Personal & Family Obligation',
    'Planned Vacation & Travel',
    'Urgent Government / Banking Documentation',
    'Emergency Home Repairs / Moving',
  ];

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
              <CalendarRange className="w-3 h-3 text-blue-600" /> Annual Quota Year 2026
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Leave Management</h1>
          <p className="text-slate-500 text-sm">
            Review, approve, and track employee time off requests, annual allowances, and department balances.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            id="btn-apply-leave"
            onClick={() => handleOpenApplyModal()}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Plus className="w-4 h-4" /> Apply Leave
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-amber-100 bg-amber-50/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-amber-800 font-bold uppercase tracking-widest mb-1">Pending Approvals</p>
            <h3 className="text-2xl font-bold text-slate-900 font-mono">{stats.pending}</h3>
            <span className="text-[10px] text-amber-700 font-medium">Awaiting supervisor sign-off</span>
          </div>
          <div className="w-11 h-11 bg-amber-100/80 rounded-xl flex items-center justify-center text-amber-700 border border-amber-200">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-emerald-100 bg-emerald-50/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-widest mb-1">Approved Requests</p>
            <h3 className="text-2xl font-bold text-slate-900 font-mono">{stats.approved}</h3>
            <span className="text-[10px] text-emerald-700 font-medium">Granted this period</span>
          </div>
          <div className="w-11 h-11 bg-emerald-100/80 rounded-xl flex items-center justify-center text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-blue-100 bg-blue-50/20 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-blue-800 font-bold uppercase tracking-widest mb-1">Approved Days Taken</p>
            <h3 className="text-2xl font-bold text-slate-900 font-mono">{stats.totalDaysTaken} Days</h3>
            <span className="text-[10px] text-blue-700 font-medium">Cumulative company total</span>
          </div>
          <div className="w-11 h-11 bg-blue-100/80 rounded-xl flex items-center justify-center text-blue-700 border border-blue-200">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Submissions</p>
            <h3 className="text-2xl font-bold text-slate-900 font-mono">{stats.total}</h3>
            <span className="text-[10px] text-slate-500 font-medium">{stats.rejected} declined / cancelled</span>
          </div>
          <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 border border-slate-200">
            <Layers className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="bg-slate-100/90 p-1.5 rounded-2xl flex items-center gap-1 border border-slate-200/80 shadow-2xs max-w-md">
        <button
          onClick={() => setActiveTab('requests')}
          className={cn(
            "flex-1 py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeTab === 'requests'
              ? "bg-white text-blue-700 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          )}
        >
          <FileText className="w-4 h-4 text-blue-600" />
          Leave Requests ({requests.length})
        </button>

        <button
          onClick={() => setActiveTab('balance')}
          className={cn(
            "flex-1 py-2 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer",
            activeTab === 'balance'
              ? "bg-white text-purple-700 shadow-sm border border-slate-200"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          )}
        >
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          Leave Balances & Quotas
        </button>
      </div>

      {/* TAB 1: LEAVE REQUESTS TABLE & MANAGEMENT */}
      {activeTab === 'requests' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col space-y-4 p-5">
          {/* Filters and search bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search employee, ID, department, or reason..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 font-medium"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Only</option>
                <option value="Approved">Approved Only</option>
                <option value="Rejected">Rejected Only</option>
              </select>

              {/* Type Filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="All">All Leave Types</option>
                <option value="Casual Leave">Casual Leave (CL)</option>
                <option value="Sick Leave">Sick Leave (SL)</option>
                <option value="Earned Leave">Earned Leave (EL)</option>
                <option value="Comp-Off">Comp-Off (CO)</option>
              </select>

              <button
                onClick={() => handleOpenApplyModal()}
                className="px-3.5 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
              >
                <Plus className="w-3.5 h-3.5" /> New Request
              </button>
            </div>
          </div>

          {/* Requests Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Leave Type</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Date Range</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Duration</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Reason & Handover</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Status</th>
                  <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      <CalendarRange className="w-8 h-8 mx-auto mb-2 text-slate-300 opacity-80" />
                      <p className="font-semibold text-slate-600">No leave requests found</p>
                      <p className="text-xs text-slate-400 mt-0.5">Try adjusting your search or filters.</p>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((leave) => {
                    const typeConfig = LEAVE_TYPES.find(t => t.name === leave.type) || LEAVE_TYPES[0];
                    const TypeIcon = typeConfig.icon;

                    return (
                      <tr key={leave.id} className="hover:bg-slate-50/60 transition-colors group">
                        {/* Employee */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs border border-blue-200 shrink-0">
                              {leave.empName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">{leave.empName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{leave.empId} &bull; {leave.department}</span>
                            </div>
                          </div>
                        </td>

                        {/* Type */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border",
                            typeConfig.color
                          )}>
                            <TypeIcon className="w-3 h-3" />
                            {leave.type}
                          </span>
                        </td>

                        {/* Dates */}
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="font-mono text-xs text-slate-800 font-semibold">
                            {leave.startDate === leave.endDate 
                              ? format(parseISO(leave.startDate), 'dd MMM yyyy')
                              : `${format(parseISO(leave.startDate), 'dd MMM')} – ${format(parseISO(leave.endDate), 'dd MMM yyyy')}`
                            }
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Applied: {format(parseISO(leave.appliedOn), 'dd MMM')}
                          </span>
                        </td>

                        {/* Days */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-xs text-slate-900 border border-slate-200">
                            {leave.days} {leave.days === 1 ? 'day' : 'days'}
                          </span>
                          {leave.session !== 'Full Day' && (
                            <span className="block text-[9px] font-bold text-purple-700 uppercase mt-0.5">
                              {leave.session}
                            </span>
                          )}
                        </td>

                        {/* Reason */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="text-xs text-slate-700 truncate font-medium" title={leave.reason}>
                            {leave.reason}
                          </p>
                          {leave.handoverTo && (
                            <span className="text-[10px] text-slate-400 block truncate">
                              Handover: <strong className="text-slate-600">{leave.handoverTo}</strong>
                            </span>
                          )}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-center">
                          <span className={cn(
                            "inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                            leave.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            leave.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                            leave.status === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-slate-100 text-slate-600 border-slate-200'
                          )}>
                            {leave.status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedRequestDetails(leave)}
                              title="View Application Details"
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            {leave.status === 'Pending' ? (
                              <>
                                <button
                                  onClick={() => handleApproveRequest(leave.id, leave.empName)}
                                  title="Approve Leave"
                                  className="p-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(leave.id, leave.empName)}
                                  title="Reject Leave"
                                  className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleDeleteRequest(leave.id)}
                                title="Remove Record"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: LEAVE BALANCES & QUOTA METERS */}
      {activeTab === 'balance' && (
        <div className="space-y-6">
          {/* Policy Overview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {LEAVE_TYPES.filter(t => t.quota > 0).map(type => {
              const TypeIcon = type.icon;
              return (
                <div key={type.name} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-bold border flex items-center gap-1.5", type.color)}>
                      <TypeIcon className="w-3.5 h-3.5" />
                      {type.code}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                      {type.quota} Days/Yr
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{type.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{type.desc}</p>
                  </div>
                  <button
                    onClick={() => handleOpenApplyModal(type.name as LeaveRequest['type'])}
                    className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Apply {type.code}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Employee Balances Roster */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Employee Leave Entitlement Summary</h3>
                <p className="text-xs text-slate-500">Live quota consumption and available balance tracking per employee.</p>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200">
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Employee</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Casual (12d)</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Sick (10d)</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Earned (18d)</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Comp-Off</th>
                    <th className="py-3 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">Quick Apply</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {ATTENDANCE_EMPLOYEES.map((emp) => {
                    // Calculate used days for this employee from requests
                    const empApproved = requests.filter(r => r.empId === emp.id && r.status === 'Approved');
                    const usedCL = empApproved.filter(r => r.type === 'Casual Leave').reduce((s, r) => s + r.days, 0);
                    const usedSL = empApproved.filter(r => r.type === 'Sick Leave').reduce((s, r) => s + r.days, 0);
                    const usedEL = empApproved.filter(r => r.type === 'Earned Leave').reduce((s, r) => s + r.days, 0);
                    const usedCO = empApproved.filter(r => r.type === 'Comp-Off').reduce((s, r) => s + r.days, 0);

                    const remCL = Math.max(0, 12 - usedCL);
                    const remSL = Math.max(0, 10 - usedSL);
                    const remEL = Math.max(0, 18 - usedEL);
                    const remCO = Math.max(0, 4 - usedCO);

                    return (
                      <tr key={emp.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center">
                              {emp.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 block leading-tight">{emp.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{emp.id} &bull; {emp.department}</span>
                            </div>
                          </div>
                        </td>

                        {/* Casual Leave Meter */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-xs text-blue-700">{remCL} Left</span>
                          <span className="text-[10px] text-slate-400 block">({usedCL} used)</span>
                        </td>

                        {/* Sick Leave Meter */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-xs text-rose-700">{remSL} Left</span>
                          <span className="text-[10px] text-slate-400 block">({usedSL} used)</span>
                        </td>

                        {/* Earned Leave Meter */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-xs text-emerald-700">{remEL} Left</span>
                          <span className="text-[10px] text-slate-400 block">({usedEL} used)</span>
                        </td>

                        {/* Comp-Off Meter */}
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-mono font-bold text-xs text-purple-700">{remCO} Left</span>
                          <span className="text-[10px] text-slate-400 block">({usedCO} used)</span>
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenApplyModal('Casual Leave', emp.id)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-slate-200 cursor-pointer"
                          >
                            Apply
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* APPLY LEAVE MODAL / DRAWER */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-5 my-8">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                  <CalendarRange className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Apply for Time Off / Leave</h2>
                  <p className="text-xs text-slate-500">Submit leave request for manager authorization</p>
                </div>
              </div>
              <button 
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveLeaveApplication} className="space-y-4">
              {/* Employee Selection */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Target Employee *
                </label>
                <select
                  value={applyForm.empId}
                  onChange={(e) => setApplyForm(prev => ({ ...prev, empId: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {ATTENDANCE_EMPLOYEES.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.id}) &bull; {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              {/* Leave Type Selector (Badge Grid) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Leave Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {LEAVE_TYPES.map(t => {
                    const isSelected = applyForm.type === t.name;
                    return (
                      <button
                        type="button"
                        key={t.name}
                        onClick={() => setApplyForm(prev => ({ ...prev, type: t.name as LeaveRequest['type'] }))}
                        className={cn(
                          "p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between",
                          isSelected
                            ? "bg-blue-50/80 border-blue-600 ring-2 ring-blue-500/20 text-blue-900 shadow-xs"
                            : "bg-slate-50/60 border-slate-200 hover:bg-slate-100/60 text-slate-700"
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-xs">{t.name}</span>
                          <span className="text-[10px] font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">
                            {t.code}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 leading-tight block">
                          {t.quota > 0 ? `${t.quota}d Annual Quota` : 'Custom Days'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Session / Day duration */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Full Day', val: 'Full Day' },
                  { label: 'First Half (08:00–13:00)', val: 'First Half' },
                  { label: 'Second Half (13:00–18:00)', val: 'Second Half' },
                ].map(sess => (
                  <button
                    type="button"
                    key={sess.val}
                    onClick={() => setApplyForm(prev => ({ ...prev, session: sess.val as any }))}
                    className={cn(
                      "py-2 px-2 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer",
                      applyForm.session === sess.val
                        ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                        : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                    )}
                  >
                    {sess.label}
                  </button>
                ))}
              </div>

              {/* Date Pickers */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={applyForm.startDate}
                    onChange={(e) => {
                      const newStart = e.target.value;
                      setApplyForm(prev => ({
                        ...prev,
                        startDate: newStart,
                        endDate: prev.endDate < newStart ? newStart : prev.endDate
                      }));
                    }}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    End Date *
                  </label>
                  <input
                    type="date"
                    min={applyForm.startDate}
                    value={applyForm.endDate}
                    onChange={(e) => setApplyForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Calculated Summary Callout */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-950">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    Total Duration: <strong className="font-mono text-sm text-blue-900">{calculatedDays} Working Day{calculatedDays > 1 ? 's' : ''}</strong>
                    <span className="text-[10px] text-blue-600 block">(Sundays excluded automatically)</span>
                  </span>
                </div>
                <span className="px-2 py-1 bg-white text-blue-700 font-bold rounded-lg border border-blue-200 text-[10px] uppercase">
                  {applyForm.type}
                </span>
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Quick Reason Presets
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {quickReasons.map(qr => (
                    <button
                      type="button"
                      key={qr}
                      onClick={() => setApplyForm(prev => ({ ...prev, reason: qr }))}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-medium rounded-lg transition-colors cursor-pointer"
                    >
                      {qr}
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Detailed explanation for leave..."
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 resize-none"
                ></textarea>
              </div>

              {/* Handover & Emergency Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Task Handover To
                  </label>
                  <select
                    value={applyForm.handoverTo}
                    onChange={(e) => setApplyForm(prev => ({ ...prev, handoverTo: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {ATTENDANCE_EMPLOYEES.filter(e => e.id !== applyForm.empId).map(e => (
                      <option key={e.id} value={e.name}>
                        {e.name} ({e.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Emergency Phone
                  </label>
                  <input
                    type="text"
                    value={applyForm.emergencyPhone}
                    onChange={(e) => setApplyForm(prev => ({ ...prev, emergencyPhone: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" /> Submit Leave Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW DETAILS AUDIT MODAL */}
      {selectedRequestDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Leave Application Audit</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Reference: {selectedRequestDetails.id}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedRequestDetails(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Employee</p>
                <p className="font-bold text-slate-900">{selectedRequestDetails.empName} ({selectedRequestDetails.empId})</p>
                <p className="text-xs text-slate-500">{selectedRequestDetails.department}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Leave Category</p>
                  <p className="font-bold text-slate-900 text-xs">{selectedRequestDetails.type}</p>
                  <p className="text-[10px] text-slate-500">{selectedRequestDetails.session}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Duration</p>
                  <p className="font-bold text-slate-900 text-xs">{selectedRequestDetails.days} Working Days</p>
                  <p className="text-[10px] text-slate-500">{selectedRequestDetails.startDate} to {selectedRequestDetails.endDate}</p>
                </div>
              </div>

              <div className="bg-blue-50/50 border border-blue-100 p-3.5 rounded-xl">
                <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">Reason for Leave</p>
                <p className="text-xs text-blue-950 leading-relaxed">{selectedRequestDetails.reason}</p>
              </div>

              {selectedRequestDetails.handoverTo && (
                <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                  <span>Assigned Handover:</span>
                  <span className="font-bold text-slate-900">{selectedRequestDetails.handoverTo}</span>
                </div>
              )}

              {selectedRequestDetails.approvedBy && (
                <div className="bg-emerald-50/50 border border-emerald-200 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-800 font-bold">Decision: {selectedRequestDetails.status}</span>
                    <span className="text-emerald-700 font-medium">By {selectedRequestDetails.approvedBy}</span>
                  </div>
                  {selectedRequestDetails.approvalRemarks && (
                    <p className="text-[11px] text-emerald-950 italic">"{selectedRequestDetails.approvalRemarks}"</p>
                  )}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
              {selectedRequestDetails.status === 'Pending' && (
                <>
                  <button
                    onClick={() => {
                      handleApproveRequest(selectedRequestDetails.id, selectedRequestDetails.empName);
                      setSelectedRequestDetails(null);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      handleRejectRequest(selectedRequestDetails.id, selectedRequestDetails.empName);
                      setSelectedRequestDetails(null);
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Reject
                  </button>
                </>
              )}
              <button
                onClick={() => setSelectedRequestDetails(null)}
                className="px-4 py-2 bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

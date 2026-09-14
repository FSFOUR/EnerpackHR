import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Calendar, CheckSquare, 
  UserPlus, Clock, Receipt, FileText, Plus,
  ChevronRight, ArrowUpRight, Check, X,
  CheckCircle2, AlertCircle, Sparkles, DollarSign, Building,
  FileCheck, Shield, Briefcase
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import { ENERPACK_EMPLOYEE_MASTER } from '../data/enerpackEmployeeMaster';

interface PendingApprovalItem {
  id: string;
  employeeName: string;
  requestType: 'Leave Request' | 'Expense Claim' | 'Attendance Regularization';
  date: string;
  details: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

const INITIAL_APPROVALS: PendingApprovalItem[] = [
  {
    id: 'appr-1',
    employeeName: 'Akash Kurmi',
    requestType: 'Leave Request',
    date: 'Sep 07 - Sep 08',
    details: 'Casual Leave (2 days)',
    status: 'Pending'
  },
  {
    id: 'appr-2',
    employeeName: 'Pranjal Bhumij',
    requestType: 'Expense Claim',
    date: 'Sep 05, 2026',
    details: 'Client travel conveyance - ₹4,500',
    status: 'Pending'
  },
  {
    id: 'appr-3',
    employeeName: 'Rajesh Ec',
    requestType: 'Attendance Regularization',
    date: 'Sep 04, 2026',
    details: 'Biometric device miss at 08:05 AM',
    status: 'Pending'
  }
];

const MONTHLY_TRENDS_DATA = [
  { month: 'Jan', headcount: 135, attendanceRate: 95.2, expenses: 1.10 },
  { month: 'Feb', headcount: 142, attendanceRate: 96.0, expenses: 1.18 },
  { month: 'Mar', headcount: 151, attendanceRate: 96.8, expenses: 1.25 },
  { month: 'Apr', headcount: 156, attendanceRate: 97.2, expenses: 1.30 },
  { month: 'May', headcount: 162, attendanceRate: 97.5, expenses: 1.38 },
  { month: 'Jun', headcount: 169, attendanceRate: 97.8, expenses: 1.45 },
  { month: 'Jul', headcount: 177, attendanceRate: 98.2, expenses: 1.52 },
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>(INITIAL_APPROVALS);
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);
  const [chartTimeframe, setChartTimeframe] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');
  const [activeMetric, setActiveMetric] = useState<'all' | 'headcount' | 'attendanceRate' | 'expenses'>('all');

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const handleApprove = (id: string, name: string, type: string) => {
    setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'Approved' } : item));
    showToast(`Approved ${type} for ${name}`);
  };

  const handleReject = (id: string, name: string, type: string) => {
    setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'Rejected' } : item));
    showToast(`Rejected ${type} for ${name}`);
  };

  return (
    <div className="space-y-6 w-full max-w-full px-2 sm:px-4 pb-12 select-none">
      {feedbackToast && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* Top Welcome Banner Card */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            Good afternoon, <span className="text-blue-600">Shafi Muhammed</span> 👋
          </h2>
          <p className="text-xs font-bold text-slate-500 mt-1">
            Monday, Sep 14, 2026
          </p>
          <div className="flex items-center gap-2 mt-1.5 text-xs font-semibold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            <span>All systems operating normally</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-600">98% attendance logged</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/employees?action=new')}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" /> ADD EMPLOYEE
        </button>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Employees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[11px] font-extrabold rounded-full">
              Active
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Employees</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">172</h3>
            <span className="text-xs font-bold text-emerald-600">+12%</span>
          </div>
        </div>

        {/* Present Today */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-extrabold rounded-full">
              98%
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Present Today</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">168</h3>
            <span className="text-xs font-bold text-slate-500">On Duty</span>
          </div>
        </div>

        {/* On Leave */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[11px] font-extrabold rounded-full">
              Approved
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">On Leave</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">4</h3>
            <span className="text-xs font-bold text-slate-500">Today</span>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs relative">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[11px] font-extrabold rounded-full">
              Action Req.
            </span>
          </div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</p>
          <div className="flex items-baseline justify-between mt-1">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">6</h3>
            <span className="text-xs font-bold text-amber-600">Due</span>
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base uppercase tracking-wider">Quick Actions</h3>
          <span className="text-xs font-bold text-slate-400">Tap to execute</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => navigate('/employees?action=new')}
            className="p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-200 hover:border-blue-300 rounded-xl transition-all flex flex-col items-center text-center gap-2.5 group cursor-pointer"
          >
            <div className="p-3 bg-white text-blue-600 rounded-xl shadow-2xs group-hover:scale-110 transition-transform">
              <UserPlus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600">Add Employee</span>
          </button>

          <button
            onClick={() => navigate('/attendance')}
            className="p-4 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 rounded-xl transition-all flex flex-col items-center text-center gap-2.5 group cursor-pointer"
          >
            <div className="p-3 bg-white text-emerald-600 rounded-xl shadow-2xs group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-emerald-600">Attendance Punch</span>
          </button>

          <button
            onClick={() => navigate('/leave')}
            className="p-4 bg-slate-50 hover:bg-purple-50/50 border border-slate-200 hover:border-purple-300 rounded-xl transition-all flex flex-col items-center text-center gap-2.5 group cursor-pointer"
          >
            <div className="p-3 bg-white text-purple-600 rounded-xl shadow-2xs group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-purple-600">Leave Request</span>
          </button>

          <button
            onClick={() => navigate('/expenses')}
            className="p-4 bg-slate-50 hover:bg-amber-50/50 border border-slate-200 hover:border-amber-300 rounded-xl transition-all flex flex-col items-center text-center gap-2.5 group cursor-pointer"
          >
            <div className="p-3 bg-white text-amber-600 rounded-xl shadow-2xs group-hover:scale-110 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-amber-600">Add Expense</span>
          </button>

          <button
            onClick={() => showToast('New task creation modal opened')}
            className="p-4 bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-300 rounded-xl transition-all flex flex-col items-center text-center gap-2.5 group cursor-pointer"
          >
            <div className="p-3 bg-white text-indigo-600 rounded-xl shadow-2xs group-hover:scale-110 transition-transform">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-indigo-600">Add Task</span>
          </button>

          <button
            onClick={() => navigate('/documents')}
            className="p-4 bg-slate-50 hover:bg-rose-50/50 border border-slate-200 hover:border-rose-300 rounded-xl transition-all flex flex-col items-center text-center gap-2.5 group cursor-pointer"
          >
            <div className="p-3 bg-white text-rose-600 rounded-xl shadow-2xs group-hover:scale-110 transition-transform">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-slate-700 group-hover:text-rose-600">Upload Document</span>
          </button>
        </div>
      </div>

      {/* Two-Column Section: Pending Approvals & Today's Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Pending Approvals */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <h3 className="font-extrabold text-slate-900 text-base">Pending Approvals</h3>
                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-black rounded-full">
                  {approvals.filter(a => a.status === 'Pending').length}
                </span>
              </div>
              <button 
                onClick={() => navigate('/leave')}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                View all
              </button>
            </div>
            <p className="text-xs text-slate-400 font-medium -mt-2 mb-4">Requires management sign off</p>

            <div className="space-y-3.5">
              {approvals.map((item) => (
                <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{item.employeeName}</span>
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-black rounded-md">
                          {item.requestType}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium mt-1">{item.details}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{item.date}</p>
                    </div>

                    <div>
                      {item.status === 'Pending' ? (
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-extrabold rounded-lg">
                          Pending
                        </span>
                      ) : (
                        <span className={cn(
                          "px-2.5 py-1 text-[11px] font-extrabold rounded-lg",
                          item.status === 'Approved' ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                        )}>
                          {item.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.status === 'Pending' && (
                    <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-200/60">
                      <button
                        onClick={() => handleReject(item.id, item.employeeName, item.requestType)}
                        className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                      <button
                        onClick={() => handleApprove(item.id, item.employeeName, item.requestType)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" /> Approve
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Today's Activity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Today's Activity</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">Live operational event feed</p>
              </div>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Event 1 */}
              <div className="relative">
                <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">09:15</span>
                  <span className="font-bold text-slate-900 text-xs">Attendance recorded</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">Standard morning shift check-in recorded for 168 employees.</p>
              </div>

              {/* Event 2 */}
              <div className="relative">
                <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-purple-500 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">10:30</span>
                  <span className="font-bold text-slate-900 text-xs">Leave request submitted</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">Akash Kurmi applied for 2 days Casual Leave.</p>
              </div>

              {/* Event 3 */}
              <div className="relative">
                <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">11:45</span>
                  <span className="font-bold text-slate-900 text-xs">New employee added</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">Profile initialized for Senior Hardware Tech EMP-007.</p>
              </div>

              {/* Event 4 */}
              <div className="relative">
                <span className="absolute -left-6 top-1.5 w-3 h-3 rounded-full bg-amber-500 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-slate-400">02:10</span>
                  <span className="font-bold text-slate-900 text-xs">Vehicle maintenance logged</span>
                </div>
                <p className="text-xs text-slate-600 font-medium mt-0.5">Routine inspection completed for delivery van KL-07-CD-5678.</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              onClick={() => navigate('/attendance')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
            >
              View Full Shift Log →
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Monthly Trends Line Chart (Headcount, Attendance Rate, Expenses) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Monthly Workforce Trends</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Headcount, Attendance Rate (%) & Total Expenses (₹ Lakhs)</p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {(['all', 'headcount', 'attendanceRate', 'expenses'] as const).map((metric) => (
                <button
                  key={metric}
                  onClick={() => setActiveMetric(metric)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize",
                    activeMetric === metric ? "bg-white text-slate-900 shadow-xs" : "text-slate-500 hover:text-slate-900"
                  )}
                >
                  {metric === 'all' ? 'All Metrics' : metric === 'attendanceRate' ? 'Attendance %' : metric}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MONTHLY_TRENDS_DATA} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
              <YAxis yAxisId="left" domain={[130, 190]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
              <YAxis yAxisId="right" orientation="right" domain={[90, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b', fontWeight: 600 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                formatter={(value: any, name: any) => {
                  if (name === 'Headcount') return [`${value} Employees`, name];
                  if (name === 'Attendance Rate') return [`${value}%`, name];
                  if (name === 'Total Expenses') return [`₹${value} Lakhs`, name];
                  return [value, name];
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', fontWeight: 600, paddingTop: '10px' }} />
              
              {(activeMetric === 'all' || activeMetric === 'headcount') && (
                <Line yAxisId="left" type="monotone" dataKey="headcount" name="Headcount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              )}
              {(activeMetric === 'all' || activeMetric === 'attendanceRate') && (
                <Line yAxisId="right" type="monotone" dataKey="attendanceRate" name="Attendance Rate" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              )}
              {(activeMetric === 'all' || activeMetric === 'expenses') && (
                <Line yAxisId="left" type="monotone" dataKey="expenses" name="Total Expenses" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

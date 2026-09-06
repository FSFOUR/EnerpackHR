import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, Calendar, CheckSquare, 
  UserPlus, Clock, Receipt, FileText, Plus,
  ChevronRight, ArrowUpRight, Check, X,
  CheckCircle2, AlertCircle, Sparkles, DollarSign
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

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
    employeeName: 'Ananya Desai',
    requestType: 'Leave Request',
    date: 'Sep 07 - Sep 08',
    details: 'Casual Leave (2 days)',
    status: 'Pending'
  },
  {
    id: 'appr-2',
    employeeName: 'Rahul Verma',
    requestType: 'Expense Claim',
    date: 'Sep 05, 2026',
    details: 'Client travel conveyance - ₹4,500',
    status: 'Pending'
  },
  {
    id: 'appr-3',
    employeeName: 'Vikram Singh',
    requestType: 'Attendance Regularization',
    date: 'Sep 04, 2026',
    details: 'Biometric device miss at 08:05 AM',
    status: 'Pending'
  }
];

const chartData = {
  'Daily': [
    { name: 'Mon', count: 170 }, { name: 'Tue', count: 170 }, { name: 'Wed', count: 171 },
    { name: 'Thu', count: 171 }, { name: 'Fri', count: 172 }
  ],
  'Weekly': [
    { name: 'W1', count: 168 }, { name: 'W2', count: 169 }, { name: 'W3', count: 170 }, { name: 'W4', count: 172 }
  ],
  'Monthly': [
    { name: 'Jan', count: 140 }, { name: 'Feb', count: 145 }, { name: 'Mar', count: 152 },
    { name: 'Apr', count: 155 }, { name: 'May', count: 160 }, { name: 'Jun', count: 165 },
    { name: 'Jul', count: 172 },
  ]
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, userProfile } = useAuth();
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>(INITIAL_APPROVALS);
  const [timeFilter, setTimeFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');
  const [feedbackToast, setFeedbackToast] = useState<string | null>(null);

  // Time-based greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const userName = userProfile?.displayName || user?.displayName?.split(' ')[0] || 'Shafi';

  // Current formatted date
  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date());
  }, []);

  const handleApprove = (id: string, name: string, type: string) => {
    setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'Approved' } : item));
    showToast(`Approved ${type} for ${name}`);
  };

  const handleReject = (id: string, name: string, type: string) => {
    setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'Rejected' } : item));
    showToast(`Rejected ${type} for ${name}`);
  };

  const showToast = (msg: string) => {
    setFeedbackToast(msg);
    setTimeout(() => setFeedbackToast(null), 3000);
  };

  const quickActions = [
    { label: 'Add Employee', icon: UserPlus, path: '/employees?action=new', color: 'bg-blue-50 text-blue-600 border-blue-200' },
    { label: 'Attendance Punch', icon: Clock, path: '/attendance?action=punch', color: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
    { label: 'Leave Request', icon: Calendar, path: '/leave?action=new', color: 'bg-purple-50 text-purple-600 border-purple-200' },
    { label: 'Add Expense', icon: Receipt, path: '/expenses?action=new', color: 'bg-amber-50 text-amber-600 border-amber-200' },
    { label: 'Add Task', icon: CheckSquare, path: '/tasks', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' },
    { label: 'Upload Document', icon: FileText, path: '/documents?action=upload', color: 'bg-rose-50 text-rose-600 border-rose-200' },
  ];

  const pendingCount = approvals.filter(a => a.status === 'Pending').length;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-6 select-none">
      {/* Dynamic Toast Feedback */}
      {feedbackToast && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{feedbackToast}</span>
        </div>
      )}

      {/* 1. Mobile-Optimized Welcome Header */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {greeting}, <span className="text-blue-600">{userName}</span>
            </h1>
            <span className="inline-block animate-pulse">👋</span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">{formattedDate}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <span className="text-[11px] text-slate-600 font-medium">
              All systems operating normally • 98% attendance logged
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-2 shrink-0">
          <button 
            onClick={() => navigate('/employees')}
            className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs shadow-blue-200 flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* 2. Compact 2-Column KPI Cards (strictly Section 5 specifications) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Total Employees: 172 */}
        <div 
          onClick={() => navigate('/employees')}
          className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded-md">
              Active
            </span>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 line-clamp-1">Total Employees</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">172</span>
              <span className="text-[10px] text-emerald-600 font-bold">+12%</span>
            </div>
          </div>
        </div>

        {/* Present Today: 168 */}
        <div 
          onClick={() => navigate('/attendance')}
          className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              98%
            </span>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 line-clamp-1">Present Today</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">168</span>
              <span className="text-[10px] text-emerald-600 font-bold">On Duty</span>
            </div>
          </div>
        </div>

        {/* On Leave: 4 */}
        <div 
          onClick={() => navigate('/leave')}
          className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded-md">
              Approved
            </span>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 line-clamp-1">On Leave</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">4</span>
              <span className="text-[10px] text-slate-400 font-medium">Today</span>
            </div>
          </div>
        </div>

        {/* Pending Tasks: 6 */}
        <div 
          onClick={() => navigate('/tasks')}
          className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 shadow-2xs hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between active:scale-[0.99]"
        >
          <div className="flex justify-between items-start mb-2">
            <div className="p-2 sm:p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <CheckSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
              Action Req.
            </span>
          </div>
          <div>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 line-clamp-1">Pending Tasks</span>
            <div className="flex items-baseline justify-between mt-0.5">
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">6</span>
              <span className="text-[10px] text-amber-600 font-bold">Due</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Quick Actions (Section 5: Compact 3-col or horizontal scroll with >=44px touch targets) */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
            Quick Actions
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Tap to execute</span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/40 active:bg-blue-50 transition-all text-center min-h-[64px] sm:min-h-[72px] cursor-pointer group"
            >
              <div className={cn("w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center mb-1.5 border shrink-0 transition-transform group-hover:scale-105", action.color)}>
                <action.icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 leading-tight line-clamp-2">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 4. Two-Column Layout: Pending Approvals & Today's Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* PENDING APPROVALS (Section 5) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">Pending Approvals</h3>
                {pendingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                    {pendingCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Requires management sign-off</p>
            </div>
            <button 
              onClick={() => navigate('/leave')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer min-h-[36px] flex items-center"
            >
              View all
            </button>
          </div>

          <div className="space-y-2.5 mt-3">
            {approvals.map((item) => (
              <div 
                key={item.id}
                className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {item.employeeName}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                        {item.requestType}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                      {item.details}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                      {item.date}
                    </span>
                  </div>

                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0",
                    item.status === 'Approved' ? "bg-emerald-100 text-emerald-800" :
                    item.status === 'Rejected' ? "bg-rose-100 text-rose-800" :
                    "bg-amber-100 text-amber-800"
                  )}>
                    {item.status}
                  </span>
                </div>

                {item.status === 'Pending' && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 justify-end">
                    <button
                      onClick={() => handleReject(item.id, item.employeeName, item.requestType)}
                      className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-rose-50 hover:border-rose-200 text-rose-700 rounded-lg text-xs font-bold transition-all min-h-[38px] flex items-center gap-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => handleApprove(item.id, item.employeeName, item.requestType)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-all min-h-[38px] flex items-center gap-1 cursor-pointer shadow-2xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* TODAY'S ACTIVITY TIMELINE (Section 5) */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Today's Activity</h3>
              <p className="text-[11px] text-slate-500">Live operational event feed</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
          </div>

          <div className="space-y-3 mt-3 relative pl-4 border-l-2 border-slate-100 ml-2">
            {[
              { time: '09:15', title: 'Attendance recorded', desc: 'Standard morning shift check-in recorded for 168 employees.', color: 'bg-emerald-500' },
              { time: '10:30', title: 'Leave request submitted', desc: 'Ananya Desai applied for 2 days Casual Leave.', color: 'bg-purple-500' },
              { time: '11:45', title: 'New employee added', desc: 'Profile initialized for Senior Hardware Tech EMP-007.', color: 'bg-blue-500' },
              { time: '02:10', title: 'Vehicle maintenance logged', desc: 'Routine inspection completed for delivery van KL-07-CD-5678.', color: 'bg-amber-500' },
            ].map((activity, idx) => (
              <div key={idx} className="relative group">
                <div className={cn("absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2 border-white shadow-xs", activity.color)} />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400">{activity.time}</span>
                    <span className="text-xs font-bold text-slate-800">{activity.title}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
                    {activity.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 mt-3 border-t border-slate-100 text-right">
            <button
              onClick={() => navigate('/attendance')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 cursor-pointer min-h-[36px]"
            >
              View Full Shift Log →
            </button>
          </div>
        </div>
      </div>

      {/* 5. Workforce Trend Area Chart (Fully responsive, no horizontal scroll) */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Workforce Headcount Analytics</h3>
            <p className="text-[11px] text-slate-500">Historical staffing capacity</p>
          </div>

          <div className="flex bg-slate-100 rounded-xl p-1 self-start sm:self-auto">
            {(['Daily', 'Weekly', 'Monthly'] as const).map(period => (
              <button 
                key={period}
                onClick={() => setTimeFilter(period)}
                className={cn(
                  "px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer min-h-[32px]",
                  timeFilter === period 
                    ? "bg-white text-slate-900 shadow-2xs" 
                    : "text-slate-500 hover:text-slate-900"
                )}
              >
                {period}
              </button>
            ))}
          </div>
        </div>

        <div className="h-48 sm:h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData[timeFilter]} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b' }} 
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#64748b' }} 
                domain={['dataMin - 5', 'dataMax + 5']}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  border: '1px solid #e2e8f0', 
                  boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.08)',
                  fontSize: '12px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="count" 
                stroke="#2563eb" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorCount)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

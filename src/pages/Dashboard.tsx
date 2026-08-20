import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, UserPlus, Clock, 
  Calendar, FileSignature, Briefcase, FileText, ShieldCheck,
  ChevronRight, ArrowUpRight
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { cn } from '../lib/utils';

const chartData = {
  'Daily': [
    { name: 'Mon', employees: 170 }, { name: 'Tue', employees: 170 }, { name: 'Wed', employees: 171 },
    { name: 'Thu', employees: 171 }, { name: 'Fri', employees: 172 }
  ],
  'Weekly': [
    { name: 'W1', employees: 168 }, { name: 'W2', employees: 169 }, { name: 'W3', employees: 170 }, { name: 'W4', employees: 172 }
  ],
  'Monthly': [
    { name: 'Jan', employees: 140 }, { name: 'Feb', employees: 145 }, { name: 'Mar', employees: 152 },
    { name: 'Apr', employees: 155 }, { name: 'May', employees: 160 }, { name: 'Jun', employees: 165 },
    { name: 'Jul', employees: 172 },
  ]
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState<'Daily' | 'Weekly' | 'Monthly'>('Monthly');
  
  const data = chartData[timeFilter];

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-slate-500">Welcome to Enerpack HR management console.</p>
        </div>

        <div className="flex flex-col xs:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          {/* Time Filter Tabs */}
          <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-2xs justify-between xs:justify-start">
            {(['Daily', 'Weekly', 'Monthly'] as const).map(period => (
              <button 
                key={period}
                onClick={() => setTimeFilter(period)}
                className={cn(
                  "flex-1 xs:flex-none px-3 sm:px-4 py-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider rounded-lg transition-all text-center min-h-[36px] flex items-center justify-center cursor-pointer",
                  timeFilter === period 
                    ? "bg-slate-900 text-white shadow-xs" 
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {period}
              </button>
            ))}
          </div>

          <button 
            onClick={() => navigate('/employees')}
            className="px-3.5 sm:px-4 py-2 bg-blue-600 active:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-xs shadow-blue-200 cursor-pointer flex items-center justify-center gap-1.5 min-h-[40px]"
          >
            <UserPlus className="w-4 h-4 shrink-0" />
            <span>Add Employee</span>
          </button>
        </div>
      </div>

      {/* Top KPI Cards - 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        <KpiCard 
          title="Total Headcount" 
          value="172" 
          trend="+12%" 
          icon={Users} 
          color="blue" 
          onClick={() => navigate('/employees')} 
        />
        <KpiCard 
          title="Active On Duty" 
          value="168" 
          trend="+10%" 
          icon={UserCheck} 
          color="emerald" 
          onClick={() => navigate('/attendance')} 
        />
        <KpiCard 
          title="New Onboard" 
          value="8" 
          trend="This Mo" 
          icon={UserPlus} 
          color="orange" 
          onClick={() => navigate('/employees')} 
        />
        <KpiCard 
          title="On Leave" 
          value="4" 
          trend="Today" 
          icon={Calendar} 
          color="purple" 
          onClick={() => navigate('/leave')} 
        />
      </div>

      {/* Main Content Grid: Chart & Action Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">Workforce Headcount Trend</h3>
              <p className="text-[11px] sm:text-xs text-slate-500">Real-time capacity tracking for {timeFilter.toLowerCase()} window</p>
            </div>
            <span className="text-[11px] font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100/60 hidden xs:inline-block">
              172 Total
            </span>
          </div>

          <div className="h-56 sm:h-72 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
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
                  dy={6} 
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
                    fontSize: '12px',
                    padding: '8px 12px'
                  }}
                  itemStyle={{ color: '#0f172a', fontWeight: 600 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="employees" 
                  stroke="#2563eb" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#colorEmployees)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HR Action Center */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-slate-100">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">HR Action Center</h3>
              <p className="text-[11px] text-slate-500">6 tasks pending compliance attention</p>
            </div>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          </div>

          <div className="space-y-2 flex-1 overflow-y-auto max-h-[320px] sm:max-h-[380px] pr-1 custom-scrollbar">
            <ActionItem title="5 Contracts Awaiting Signature" icon={FileSignature} color="orange" onClick={() => navigate('/documents')} />
            <ActionItem title="3 Policy Agreements Pending" icon={ShieldCheck} color="blue" onClick={() => navigate('/documents')} />
            <ActionItem title="2 Employees Missing Documents" icon={FileText} color="red" onClick={() => navigate('/documents')} />
            <ActionItem title="4 Leave Requests Awaiting Approval" icon={Calendar} color="emerald" onClick={() => navigate('/leave')} />
            <ActionItem title="2 Probation Reviews Due" icon={Clock} color="purple" onClick={() => navigate('/performance')} />
            <ActionItem title="1 Contract Expiring Soon" icon={Briefcase} color="orange" onClick={() => navigate('/documents')} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper components
interface KpiCardProps {
  title: string;
  value: string;
  trend: string;
  icon: any;
  color: 'blue' | 'emerald' | 'orange' | 'purple';
  onClick?: () => void;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, trend, icon: Icon, color, onClick }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white p-3 sm:p-4.5 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between transition-all group",
        onClick && "cursor-pointer hover:border-blue-300 hover:shadow-xs active:scale-[0.99]"
      )}
    >
      <div className="flex justify-between items-start mb-2 sm:mb-3">
        <div className={cn("p-2 sm:p-2.5 rounded-xl border", colorMap[color])}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <span className="text-[10px] sm:text-xs font-bold text-slate-600 bg-slate-100 px-1.5 sm:px-2 py-0.5 rounded-md leading-tight">
          {trend}
        </span>
      </div>
      <div>
        <h4 className="text-[11px] sm:text-xs font-medium text-slate-500 mb-0.5 line-clamp-1">{title}</h4>
        <div className="flex items-center justify-between">
          <span className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{value}</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-600 transition-colors hidden sm:block" />
        </div>
      </div>
    </div>
  );
};

interface ActionItemProps {
  title: string;
  icon: any;
  color: 'blue' | 'emerald' | 'orange' | 'purple' | 'red';
  onClick?: () => void;
}

const ActionItem: React.FC<ActionItemProps> = ({ title, icon: Icon, color, onClick }) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200/60',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200/60',
    orange: 'bg-orange-50 text-orange-600 border-orange-200/60',
    purple: 'bg-purple-50 text-purple-600 border-purple-200/60',
    red: 'bg-rose-50 text-rose-600 border-rose-200/60',
  };

  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-xl border border-slate-100 bg-slate-50/40 hover:bg-white hover:border-slate-200 cursor-pointer transition-all active:scale-[0.99] min-h-[44px]"
    >
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={cn("p-1.5 sm:p-2 rounded-lg border shrink-0", colorMap[color])}>
          <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
        <span className="text-xs sm:text-sm font-medium text-slate-800 line-clamp-1">{title}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
    </div>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, UserCheck, UserPlus, Clock, 
  Calendar, FileSignature, Briefcase, FileText, ShieldCheck
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Welcome back to Enerpack HR. Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 mr-2 shadow-sm">
            {(['Daily', 'Weekly', 'Monthly'] as const).map(period => (
              <button 
                key={period}
                onClick={() => setTimeFilter(period)}
                className={cn(
                  "px-4 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors",
                  timeFilter === period 
                    ? "bg-slate-100 text-slate-900 shadow-sm" 
                    : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                {period}
              </button>
            ))}
          </div>
          <button 
            onClick={() => navigate('/employees')}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 cursor-pointer"
          >
            + Quick Add Employee
          </button>
        </div>
      </div>

      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard title="Total Employees" value="172" trend="+12%" icon={Users} color="blue" onClick={() => navigate('/employees')} />
        <KpiCard title="Active Employees" value="168" trend="+10%" icon={UserCheck} color="emerald" onClick={() => navigate('/attendance')} />
        <KpiCard title="New Employees" value="8" trend="This Month" icon={UserPlus} color="orange" onClick={() => navigate('/employees')} />
        <KpiCard title="On Leave" value="4" trend="Today" icon={Calendar} color="purple" onClick={() => navigate('/leave')} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900 mb-6">Employee Growth</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorEmployees" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="employees" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorEmployees)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* HR Action Center */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-base font-semibold text-slate-900 mb-4">HR Action Center</h3>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
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
const KpiCard = ({ title, value, trend, icon: Icon, color, onClick }: any) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    orange: 'bg-orange-50 text-orange-600',
    purple: 'bg-purple-50 text-purple-600',
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col transition-all",
        onClick && "cursor-pointer hover:border-blue-300 hover:shadow-md"
      )}
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`p-2.5 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{trend}</span>
      </div>
      <h4 className="text-sm font-medium text-slate-500 mb-1">{title}</h4>
      <span className="text-2xl font-bold text-slate-900">{value}</span>
    </div>
  );
};

const ActionItem = ({ title, icon: Icon, color, onClick }: any) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  return (
    <div 
      onClick={onClick}
      className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
    >
      <div className={`p-2 rounded-lg border ${colorMap[color]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-sm font-medium text-slate-700">{title}</span>
    </div>
  );
};

import React from 'react';
import { 
  CarFront, MapPin, Fuel, Receipt, Wrench, FileText, Activity, AlertOctagon, Plus
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, Legend, LineChart, Line } from 'recharts';

const expenseTrendData = [
  { month: 'Jan', fuel: 45000, maintenance: 12000, other: 5000 },
  { month: 'Feb', fuel: 48000, maintenance: 8000, other: 6000 },
  { month: 'Mar', fuel: 52000, maintenance: 15000, other: 4500 },
  { month: 'Apr', fuel: 49000, maintenance: 5000, other: 7000 },
  { month: 'May', fuel: 55000, maintenance: 22000, other: 8000 },
  { month: 'Jun', fuel: 58000, maintenance: 18000, other: 9500 },
];

const vehicleCostData = [
  { name: 'KL-01-AB-1234', costPerKm: 8.5, totalCost: 45000 },
  { name: 'KL-07-XY-9876', costPerKm: 12.2, totalCost: 65000 },
  { name: 'KL-01-PQ-5555', costPerKm: 7.8, totalCost: 32000 },
  { name: 'KL-32-LM-4444', costPerKm: 15.4, totalCost: 82000 },
];

export const FleetDashboard: React.FC = () => {
  return (
    <div className="space-y-6 pb-8">
      {/* Quick Actions */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
        <h2 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-xs">
            <Fuel className="w-4 h-4" /> Add Fuel
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-xs">
            <Receipt className="w-4 h-4" /> Add Expense
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-xs">
            <MapPin className="w-4 h-4" /> New Trip
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-xs">
            <Wrench className="w-4 h-4" /> Record Service
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors shadow-xs">
            <Activity className="w-4 h-4" /> Inspection
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-sm font-medium">This Month Fuel Cost</span>
            <Fuel className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">₹58,000</div>
          <div className="text-xs font-medium text-emerald-600 mt-2 flex items-center">
            ↑ 5.2% from last month
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-sm font-medium">This Month Maintenance</span>
            <Wrench className="w-5 h-5 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">₹18,000</div>
          <div className="text-xs font-medium text-emerald-600 mt-2 flex items-center">
            ↓ 12.5% from last month
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-sm font-medium">Total Distance (Current)</span>
            <MapPin className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">4,250 KM</div>
          <div className="text-xs font-medium text-emerald-600 mt-2 flex items-center">
            ↑ 8.1% from last month
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-sm font-medium">Average Cost / KM</span>
            <Receipt className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900">₹10.50 / KM</div>
          <div className="text-xs font-medium text-rose-600 mt-2 flex items-center">
            ↑ 2.3% from last month
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Trend Chart */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900 mb-6">Total Vehicle Expenses Trend</h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={expenseTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMaintenance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(value) => `₹${value/1000}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Area type="monotone" name="Fuel" dataKey="fuel" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorFuel)" />
                <Area type="monotone" name="Maintenance" dataKey="maintenance" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorMaintenance)" />
                <Area type="monotone" name="Other Expenses" dataKey="other" stroke="#10b981" strokeWidth={2} fillOpacity={0.1} fill="#10b981" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & Reminders */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Maintenance & Documents</h2>
          </div>
          <div className="p-2 flex-1 overflow-y-auto custom-scrollbar space-y-2">
            <div className="p-3 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <AlertOctagon className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-900">Insurance Expired</h3>
                <p className="text-xs text-red-700 mt-0.5">KL-01-AB-1234 (Honda City)</p>
                <p className="text-xs text-red-600 font-medium mt-1">Expired 2 days ago</p>
              </div>
            </div>
            
            <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-900">Service Due Soon</h3>
                <p className="text-xs text-orange-700 mt-0.5">KL-07-XY-9876 (Mahindra Bolero)</p>
                <p className="text-xs text-orange-600 font-medium mt-1">Due in 250 KM</p>
              </div>
            </div>

            <div className="p-3 bg-orange-50 border border-orange-100 rounded-lg flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-orange-900">PUC Expires Soon</h3>
                <p className="text-xs text-orange-700 mt-0.5">KL-01-PQ-5555 (Tata Ace)</p>
                <p className="text-xs text-orange-600 font-medium mt-1">Expires in 12 days</p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg flex items-start gap-3 opacity-70">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <CarFront className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-emerald-900">All Other Vehicles</h3>
                <p className="text-xs text-emerald-700 mt-0.5">Documents & Maintenance Up to Date</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vehicle Status Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Vehicle Status</h2>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Driver</th>
                <th className="px-4 py-3 text-right">Odometer</th>
                <th className="px-4 py-3 text-right">Fuel Avg (KM/L)</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Cost / KM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">KL-01-AB-1234</div>
                  <div className="text-xs text-slate-500">Honda City (Sedan)</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">John Doe</div>
                  <div className="text-xs text-slate-500">Sales Dept</div>
                </td>
                <td className="px-4 py-3 text-right font-medium">45,230 KM</td>
                <td className="px-4 py-3 text-right font-medium">14.2</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700">Active</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">₹8.50</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">KL-07-XY-9876</div>
                  <div className="text-xs text-slate-500">Mahindra Bolero</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">Jane Smith</div>
                  <div className="text-xs text-slate-500">Operations</div>
                </td>
                <td className="px-4 py-3 text-right font-medium">112,450 KM</td>
                <td className="px-4 py-3 text-right font-medium">10.8</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">In Trip</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">₹12.20</td>
              </tr>
              <tr className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">KL-32-LM-4444</div>
                  <div className="text-xs text-slate-500">Ashok Leyland Truck</div>
                </td>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-900">Mike Johnson</div>
                  <div className="text-xs text-slate-500">Logistics</div>
                </td>
                <td className="px-4 py-3 text-right font-medium">85,900 KM</td>
                <td className="px-4 py-3 text-right font-medium">5.4</td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-700">Maintenance</span>
                </td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900">₹15.40</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

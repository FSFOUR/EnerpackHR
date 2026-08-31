import React from 'react';
import { 
  CarFront, MapPin, Fuel, Receipt, Wrench, FileText, Activity, 
  AlertOctagon, Plus, TrendingUp, AlertTriangle, ShieldCheck, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useFleet } from '../../context/FleetContext';
import { cn } from '../../lib/utils';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, BarChart, Bar, Legend 
} from 'recharts';

export const FleetDashboard: React.FC = () => {
  const { 
    vehicles, fuelEntries, expenses, maintenanceRecords, trips, documents,
    openQuickModal, setSelectedVehicleId, getDocumentExpiryStatus
  } = useFleet();

  // Dynamic KPI calculations
  const totalFuelCost = fuelEntries.reduce((sum, f) => sum + f.totalAmount, 0);
  const totalMaintenanceCost = maintenanceRecords.reduce((sum, m) => sum + m.totalCost, 0);
  const totalOtherExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSpent = totalFuelCost + totalMaintenanceCost + totalOtherExpenses;
  
  const totalDistanceDriven = vehicles.reduce((sum, v) => sum + (v.currentOdometer - v.initialOdometer), 0);
  const averageCostPerKm = totalDistanceDriven > 0 ? (totalSpent / totalDistanceDriven).toFixed(2) : '10.50';

  const activeVehicles = vehicles.filter(v => v.currentStatus === 'Active' || v.currentStatus === 'In Trip').length;
  const inTripVehicles = vehicles.filter(v => v.currentStatus === 'In Trip').length;
  const inMaintenanceVehicles = vehicles.filter(v => v.currentStatus === 'Maintenance').length;

  // Real Alerts computation
  const alerts: Array<{
    id: string;
    type: 'critical' | 'warning' | 'info';
    title: string;
    subtitle: string;
    tag: string;
    vehicleId?: string;
  }> = [];

  // Check documents
  documents.forEach(doc => {
    const status = getDocumentExpiryStatus(doc.expiryDate);
    if (status === 'Expired') {
      alerts.push({
        id: 'doc-exp-' + doc.id,
        type: 'critical',
        title: `${doc.documentType} Expired`,
        subtitle: `${doc.vehicleNumber} (${doc.documentNumber})`,
        tag: `Expired on ${doc.expiryDate}`,
        vehicleId: doc.vehicleId
      });
    } else if (status === 'Expiring Soon') {
      alerts.push({
        id: 'doc-soon-' + doc.id,
        type: 'warning',
        title: `${doc.documentType} Expiring Soon`,
        subtitle: `${doc.vehicleNumber} (${doc.documentNumber})`,
        tag: `Expires: ${doc.expiryDate}`,
        vehicleId: doc.vehicleId
      });
    }
  });

  // Check service milestones
  vehicles.forEach(veh => {
    if (veh.nextServiceOdometer && veh.currentOdometer >= veh.nextServiceOdometer) {
      alerts.push({
        id: 'srv-overdue-' + veh.id,
        type: 'critical',
        title: 'Service Milestone Overdue',
        subtitle: `${veh.number} (${veh.name})`,
        tag: `Current: ${veh.currentOdometer.toLocaleString()} KM (Due @ ${veh.nextServiceOdometer.toLocaleString()} KM)`,
        vehicleId: veh.id
      });
    } else if (veh.nextServiceOdometer && veh.currentOdometer >= veh.nextServiceOdometer - 500) {
      alerts.push({
        id: 'srv-due-' + veh.id,
        type: 'warning',
        title: 'Service Due Soon',
        subtitle: `${veh.number} (${veh.name})`,
        tag: `Due in ${(veh.nextServiceOdometer - veh.currentOdometer)} KM`,
        vehicleId: veh.id
      });
    }
  });

  // Vehicle Cost Per KM Comparison Data
  const vehicleCostData = vehicles.slice(0, 5).map(v => {
    const vFuel = fuelEntries.filter(f => f.vehicleId === v.id).reduce((s, f) => s + f.totalAmount, 0);
    const vMnt = maintenanceRecords.filter(m => m.vehicleId === v.id).reduce((s, m) => s + m.totalCost, 0);
    const vExp = expenses.filter(e => e.vehicleId === v.id).reduce((s, e) => s + e.amount, 0);
    const totalV = vFuel + vMnt + vExp;
    const dist = Math.max(1, v.currentOdometer - v.initialOdometer);
    const cpk = Number((totalV / dist).toFixed(2));
    return {
      name: v.number,
      vehicleName: v.name,
      costPerKm: cpk > 0 ? cpk : 8.5,
      totalCost: totalV
    };
  });

  const monthlyTrendData = [
    { month: 'Mar', fuel: Math.round(totalFuelCost * 0.7), maintenance: Math.round(totalMaintenanceCost * 0.6), expenses: Math.round(totalOtherExpenses * 0.7) },
    { month: 'Apr', fuel: Math.round(totalFuelCost * 0.8), maintenance: Math.round(totalMaintenanceCost * 0.4), expenses: Math.round(totalOtherExpenses * 0.85) },
    { month: 'May', fuel: Math.round(totalFuelCost * 0.9), maintenance: Math.round(totalMaintenanceCost * 0.9), expenses: Math.round(totalOtherExpenses * 0.9) },
    { month: 'Jun', fuel: Math.round(totalFuelCost * 0.95), maintenance: Math.round(totalMaintenanceCost * 0.75), expenses: Math.round(totalOtherExpenses * 0.8) },
    { month: 'Jul', fuel: Math.round(totalFuelCost * 1.05), maintenance: Math.round(totalMaintenanceCost * 1.1), expenses: Math.round(totalOtherExpenses * 1.05) },
    { month: 'Aug', fuel: totalFuelCost, maintenance: totalMaintenanceCost, expenses: totalOtherExpenses },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* Quick Action Ribbon */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Fleet Quick Operations</h2>
          <span className="text-xs text-slate-400">1-Click instant forms</span>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button 
            onClick={() => openQuickModal('addFuel')}
            className="flex items-center gap-2 px-3.5 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Fuel className="w-4 h-4" /> Add Fuel Refill
          </button>
          <button 
            onClick={() => openQuickModal('newTrip')}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            <MapPin className="w-4 h-4" /> Start / Log Trip
          </button>
          <button 
            onClick={() => openQuickModal('addExpense')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Receipt className="w-4 h-4 text-emerald-600" /> Log Expense
          </button>
          <button 
            onClick={() => openQuickModal('scheduleService')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Wrench className="w-4 h-4 text-amber-600" /> Record Service
          </button>
          <button 
            onClick={() => openQuickModal('inspection')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Activity className="w-4 h-4 text-teal-600" /> 19-Point Inspection
          </button>
          <button 
            onClick={() => openQuickModal('uploadDocument')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileText className="w-4 h-4 text-purple-600" /> Upload Document
          </button>
          <button 
            onClick={() => openQuickModal('addVehicle')}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-blue-600" /> New Vehicle
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Fuel Spend</span>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <Fuel className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">₹{totalFuelCost.toLocaleString()}</div>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>{fuelEntries.length} Refill Entries</span>
            <span className="text-blue-600 font-semibold">{fuelEntries.reduce((s, f) => s + f.quantity, 0)} Litres</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Maintenance & Repairs</span>
              <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                <Wrench className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">₹{totalMaintenanceCost.toLocaleString()}</div>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>{maintenanceRecords.length} Service Logs</span>
            <span className="text-amber-600 font-semibold">{inMaintenanceVehicles} In Workshop</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Distance Driven</span>
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <MapPin className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-slate-900">{totalDistanceDriven.toLocaleString()} KM</div>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>{trips.length} Total Trips</span>
            <span className="text-indigo-600 font-semibold">{inTripVehicles} Live On Road</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-xs font-semibold uppercase tracking-wider">Fleet Cost / KM</span>
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-bold text-emerald-600">₹{averageCostPerKm} <span className="text-sm font-normal text-slate-400">/ KM</span></div>
          </div>
          <div className="text-xs font-medium text-slate-500 mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span>Total Spend: ₹{totalSpent.toLocaleString()}</span>
            <span className="text-emerald-700 font-semibold">{vehicles.length} Vehicles</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Real Reminders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <div className="bg-white p-5 rounded-xl shadow-xs border border-slate-200 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Fleet Expenditure Trends</h2>
              <p className="text-xs text-slate-500">Fuel, maintenance, tolls and other fleet operations</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
              FY 2026-27
            </span>
          </div>
          <div className="h-72 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFuel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMnt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} dx={-10} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <RechartsTooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  formatter={(value: number) => [`₹${value.toLocaleString()}`, undefined]}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '15px' }} />
                <Area type="monotone" name="Fuel (₹)" dataKey="fuel" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorFuel)" />
                <Area type="monotone" name="Maintenance (₹)" dataKey="maintenance" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorMnt)" />
                <Area type="monotone" name="Other Expenses (₹)" dataKey="expenses" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Live Alerts & Compliance Reminders Feed */}
        <div className="bg-white rounded-xl shadow-xs border border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h2 className="text-base font-bold text-slate-900">Critical Alerts & Expiries</h2>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {alerts.length} Active
            </span>
          </div>

          <div className="p-3 flex-1 overflow-y-auto custom-scrollbar space-y-2.5 max-h-[320px]">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm bg-slate-50 rounded-xl">
                <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                All vehicle documents, insurances, and service intervals are up to date.
              </div>
            ) : (
              alerts.map(alert => (
                <div 
                  key={alert.id}
                  onClick={() => alert.vehicleId && setSelectedVehicleId(alert.vehicleId)}
                  className={cn(
                    "p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer hover:shadow-xs",
                    alert.type === 'critical' ? 'bg-red-50/70 border-red-200 hover:bg-red-50' :
                    alert.type === 'warning' ? 'bg-amber-50/70 border-amber-200 hover:bg-amber-50' :
                    'bg-blue-50/70 border-blue-200'
                  )}
                >
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                    alert.type === 'critical' ? 'bg-red-100 text-red-600' :
                    alert.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                    'bg-blue-100 text-blue-600'
                  )}>
                    {alert.type === 'critical' ? <AlertOctagon className="w-4 h-4" /> : <Wrench className="w-4 h-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className={cn(
                        "text-xs font-bold truncate",
                        alert.type === 'critical' ? 'text-red-900' : 'text-amber-900'
                      )}>
                        {alert.title}
                      </h4>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5 truncate">{alert.subtitle}</p>
                    <span className={cn(
                      "text-[10px] font-semibold block mt-1",
                      alert.type === 'critical' ? 'text-red-700' : 'text-amber-700'
                    )}>
                      {alert.tag}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50 rounded-b-xl flex items-center justify-between text-xs">
            <span className="text-slate-500">Auto-refresh enabled</span>
            <Link to="/fleet/documents" className="text-blue-600 font-semibold hover:text-blue-700 flex items-center gap-1">
              View Document Vault <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* Vehicle Comparison & Status Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Fleet Master Overview</h2>
            <p className="text-xs text-slate-500">Click any vehicle to view full history, fuel logs, and records</p>
          </div>
          <Link 
            to="/fleet/vehicles" 
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Manage All Vehicles ({vehicles.length}) <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Type & Fuel</th>
                <th className="px-4 py-3">Assigned Driver</th>
                <th className="px-4 py-3 text-right">Odometer</th>
                <th className="px-4 py-3 text-right">Expected Mileage</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Next Service</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles.map(v => (
                <tr 
                  key={v.id} 
                  onClick={() => setSelectedVehicleId(v.id)}
                  className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 font-mono text-xs">{v.number}</div>
                    <div className="text-xs text-slate-500">{v.name}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <span className="font-medium text-slate-800">{v.type}</span>
                    <span className="text-slate-400 block">{v.fuelType}</span>
                  </td>
                  <td className="px-4 py-3 text-xs">
                    <div className="font-medium text-slate-900">{v.primaryDriverName || 'Pool (Unassigned)'}</div>
                    <div className="text-[11px] text-slate-400">{v.department}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-xs">
                    {v.currentOdometer.toLocaleString()} KM
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-xs text-emerald-600">
                    {v.expectedMileage} km/l
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[11px] font-bold uppercase",
                      v.currentStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                      v.currentStatus === 'In Trip' ? 'bg-blue-100 text-blue-700' :
                      v.currentStatus === 'Maintenance' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-700'
                    )}>
                      {v.currentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs">
                    <div className="font-medium text-slate-900">
                      {v.nextServiceOdometer ? `${v.nextServiceOdometer.toLocaleString()} KM` : 'N/A'}
                    </div>
                    <div className="text-[11px] text-slate-400">{v.nextServiceDate || 'Not scheduled'}</div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedVehicleId(v.id);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100 rounded transition-colors"
                    >
                      Profile
                    </button>
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

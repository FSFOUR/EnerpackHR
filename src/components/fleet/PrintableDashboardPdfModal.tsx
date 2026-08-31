import React, { useRef } from 'react';
import { 
  X, Printer, Download, CarFront, Fuel, TrendingUp, 
  Wrench, CheckCircle2, ShieldCheck, MapPin, Calendar, DollarSign
} from 'lucide-react';
import { Vehicle, Trip, FuelEntry, FleetExpense, MaintenanceRecord, FleetDocument, InspectionChecklist } from '../../types/fleet';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell 
} from 'recharts';

interface PrintableDashboardPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  timeframe: 'Daily' | 'Monthly' | 'Yearly';
  selectedDate: string;
  trips: Trip[];
  fuelEntries: FuelEntry[];
  expenses: FleetExpense[];
  maintenanceRecords: MaintenanceRecord[];
  documents: FleetDocument[];
  inspections: InspectionChecklist[];
  kpis: {
    totalKm: number;
    totalCost: number;
    fuelCost: number;
    maintenanceCost: number;
    otherExpenses: number;
    fuelLitres: number;
    avgMileage: number;
    costPerKm: number;
    tripsCount: number;
  };
  chartData: any[];
  expensePieData: { name: string; value: number; color: string }[];
  onDownloadDirectPdf: () => void;
}

export const PrintableDashboardPdfModal: React.FC<PrintableDashboardPdfModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  timeframe,
  selectedDate,
  trips,
  fuelEntries,
  expenses,
  maintenanceRecords,
  documents,
  inspections,
  kpis,
  chartData,
  expensePieData,
  onDownloadDirectPdf
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      {/* Modal Container */}
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Action Bar (hidden on print) */}
        <div className="no-print bg-slate-900 text-white px-6 py-3.5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-1.5 bg-blue-600 rounded-lg text-white">
              <Printer className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold tracking-tight">Executive Dashboard PDF Preview</h3>
              <p className="text-[11px] text-slate-400">
                {vehicle.number} • {timeframe} Report ({selectedDate})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onDownloadDirectPdf}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-lg transition-colors border border-slate-700"
            >
              <Download className="w-3.5 h-3.5" /> Download .PDF File
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save as PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Dashboard Area */}
        <div className="overflow-y-auto p-6 sm:p-8 bg-slate-100/60 print-full-width" ref={printAreaRef}>
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-xs max-w-4xl mx-auto print:border-none print:shadow-none print:p-0 print:max-w-none text-slate-800">
            
            {/* 1. PDF Header Banner */}
            <div className="border-b-2 border-blue-600 pb-5 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-widest text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                      ENERPACK FLEET OS
                    </span>
                    <span className="text-xs font-bold text-slate-400">|</span>
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                      {timeframe} Operational Dashboard
                    </span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5 tracking-tight">
                    Vehicle Analytics & Operational Audit
                  </h1>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enerpack Energy & Logistics • Comprehensive Fleet Performance Ledger
                  </p>
                </div>

                {/* Badge */}
                <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-3 sm:p-0 rounded-lg border sm:border-none border-slate-100">
                  <div className="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-mono font-bold rounded-md">
                    {vehicle.number}
                  </div>
                  <div className="text-xs font-medium text-slate-600 mt-1">
                    Period: <strong className="text-slate-900">{selectedDate}</strong>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Generated: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Vehicle Info Bar */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Vehicle Make & Model</span>
                <strong className="text-slate-900 text-sm block mt-0.5">{vehicle.make} {vehicle.model}</strong>
                <span className="text-slate-500 text-[11px]">{vehicle.variant || vehicle.type}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Primary Driver</span>
                <strong className="text-slate-900 text-sm block mt-0.5">{vehicle.primaryDriverName || 'Unassigned'}</strong>
                <span className="text-slate-500 text-[11px]">Dept: {vehicle.department}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Current Odometer</span>
                <strong className="text-slate-900 text-sm font-mono block mt-0.5">{vehicle.currentOdometer.toLocaleString()} KM</strong>
                <span className="text-slate-500 text-[11px]">Status: {vehicle.currentStatus}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Fuel & Efficiency</span>
                <strong className="text-slate-900 text-sm block mt-0.5">{vehicle.fuelType}</strong>
                <span className="text-slate-500 text-[11px]">Target: {vehicle.expectedMileage} km/l</span>
              </div>
            </div>

            {/* 3. Executive KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3.5">
                <span className="text-[10px] font-bold tracking-wider text-blue-700 uppercase block">Total Distance</span>
                <span className="text-xl font-bold font-mono text-blue-900 block mt-1">
                  {kpis.totalKm.toLocaleString()} <span className="text-xs font-normal">KM</span>
                </span>
                <span className="text-[10px] text-blue-600 mt-0.5 block">{kpis.tripsCount} Completed Trips</span>
              </div>

              <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3.5">
                <span className="text-[10px] font-bold tracking-wider text-rose-700 uppercase block">Total Operating Spend</span>
                <span className="text-xl font-bold font-mono text-rose-900 block mt-1">
                  ₹{kpis.totalCost.toLocaleString()}
                </span>
                <span className="text-[10px] text-rose-600 mt-0.5 block">Fuel + Maint + Tolls</span>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-3.5">
                <span className="text-[10px] font-bold tracking-wider text-emerald-700 uppercase block">Fuel Consumed</span>
                <span className="text-xl font-bold font-mono text-emerald-900 block mt-1">
                  {kpis.fuelLitres.toFixed(1)} <span className="text-xs font-normal">L</span>
                </span>
                <span className="text-[10px] text-emerald-600 mt-0.5 block">
                  Avg {kpis.avgMileage > 0 ? kpis.avgMileage.toFixed(1) : vehicle.expectedMileage} KM/L
                </span>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5">
                <span className="text-[10px] font-bold tracking-wider text-amber-700 uppercase block">Cost Per KM</span>
                <span className="text-xl font-bold font-mono text-amber-900 block mt-1">
                  ₹{kpis.costPerKm.toFixed(2)}
                </span>
                <span className="text-[10px] text-amber-600 mt-0.5 block">Target: ₹9.50/KM</span>
              </div>
            </div>

            {/* 4. Visual Dashboard Charts (Rendered for Screen & Print) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8 avoid-break-inside">
              {/* Bar Chart */}
              <div className="md:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">
                  {timeframe === 'Daily' ? "Day's Timeline Progression" :
                   timeframe === 'Monthly' ? "Daily Distance vs Expense Trend" :
                   "Monthly Operating Cost vs Distance (12 Months)"}
                </h4>
                <p className="text-[11px] text-slate-500 mb-3">Kilometers logged vs operational expense incurred</p>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '11px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '6px' }} />
                      <Bar dataKey="distance" name="Distance (KM)" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="cost" name="Expense (₹)" fill="#f43f5e" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-1">Expense Distribution</h4>
                <p className="text-[11px] text-slate-500 mb-2">Category-wise spend share</p>
                <div className="h-40 w-full flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expensePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={36}
                        outerRadius={58}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {expensePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val: number) => `₹${val.toLocaleString()}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-1 pt-2 border-t border-slate-200 text-[11px]">
                  {expensePieData.map(item => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-slate-600">{item.name}</span>
                      </div>
                      <span className="font-bold text-slate-900">₹{item.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 5. Financial Breakdown Ledger */}
            <div className="mb-6 avoid-break-inside">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                1. Operational Financial Ledger
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2">Category</th>
                      <th className="px-3.5 py-2">Details / Units</th>
                      <th className="px-3.5 py-2 text-right">Amount (INR)</th>
                      <th className="px-3.5 py-2 text-right">% Share</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-3.5 py-2 font-medium text-slate-900">Fuel Refills & Diesel</td>
                      <td className="px-3.5 py-2 text-slate-500">{kpis.fuelLitres.toFixed(1)} Litres @ Avg ₹94.8/L</td>
                      <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">₹{kpis.fuelCost.toLocaleString()}</td>
                      <td className="px-3.5 py-2 text-right text-slate-500">{kpis.totalCost > 0 ? ((kpis.fuelCost / kpis.totalCost) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 font-medium text-slate-900">Maintenance & Spares</td>
                      <td className="px-3.5 py-2 text-slate-500">{maintenanceRecords.length} Service Invoices</td>
                      <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">₹{kpis.maintenanceCost.toLocaleString()}</td>
                      <td className="px-3.5 py-2 text-right text-slate-500">{kpis.totalCost > 0 ? ((kpis.maintenanceCost / kpis.totalCost) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr>
                      <td className="px-3.5 py-2 font-medium text-slate-900">Tolls, FASTag, Washing & Misc</td>
                      <td className="px-3.5 py-2 text-slate-500">{expenses.length} Expense Vouchers</td>
                      <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">₹{kpis.otherExpenses.toLocaleString()}</td>
                      <td className="px-3.5 py-2 text-right text-slate-500">{kpis.totalCost > 0 ? ((kpis.otherExpenses / kpis.totalCost) * 100).toFixed(1) : 0}%</td>
                    </tr>
                    <tr className="bg-slate-50 font-bold">
                      <td className="px-3.5 py-2.5 text-slate-900 uppercase">Total Operating Expenditure</td>
                      <td className="px-3.5 py-2.5 text-slate-700">{kpis.totalKm.toLocaleString()} KM Clocked</td>
                      <td className="px-3.5 py-2.5 text-right font-mono text-blue-600 text-sm">₹{kpis.totalCost.toLocaleString()}</td>
                      <td className="px-3.5 py-2.5 text-right text-slate-900">100.0%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* 6. Itemized Trips Table */}
            <div className="mb-6 avoid-break-inside">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                2. Logged Dispatch Trips ({trips.length})
              </h4>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3.5 py-2">Trip #</th>
                      <th className="px-3.5 py-2">Date</th>
                      <th className="px-3.5 py-2">Route</th>
                      <th className="px-3.5 py-2">Purpose / Department</th>
                      <th className="px-3.5 py-2 text-right">Distance</th>
                      <th className="px-3.5 py-2 text-right">Tolls</th>
                      <th className="px-3.5 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trips.length > 0 ? (
                      trips.map(t => (
                        <tr key={t.id}>
                          <td className="px-3.5 py-2 font-mono font-bold text-slate-900">{t.tripNumber}</td>
                          <td className="px-3.5 py-2 text-slate-600">{t.tripDate}</td>
                          <td className="px-3.5 py-2 font-medium text-slate-900">{t.startLocation} → {t.destination}</td>
                          <td className="px-3.5 py-2 text-slate-500">{t.tripPurpose}</td>
                          <td className="px-3.5 py-2 text-right font-mono font-bold text-slate-900">{t.distance} KM</td>
                          <td className="px-3.5 py-2 text-right font-mono text-slate-700">₹{(t.tollExpense || 0) + (t.parkingExpense || 0)}</td>
                          <td className="px-3.5 py-2">
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                              {t.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-3.5 py-3 text-center text-slate-400">
                          No trip records logged for this selected timeframe
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 7. Fuel & Incidental Expense Tables */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6 avoid-break-inside">
              {/* Fuel Refills */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-blue-600" />
                  3. Fuel Refills ({fuelEntries.length})
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-1.5">Date</th>
                        <th className="px-3 py-1.5">Station</th>
                        <th className="px-3 py-1.5 text-right">Litres</th>
                        <th className="px-3 py-1.5 text-right">Cost</th>
                        <th className="px-3 py-1.5 text-right">Mileage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {fuelEntries.length > 0 ? (
                        fuelEntries.map(f => (
                          <tr key={f.id}>
                            <td className="px-3 py-1.5 text-slate-600">{f.date}</td>
                            <td className="px-3 py-1.5 text-slate-900 truncate max-w-[120px]">{f.fuelStation}</td>
                            <td className="px-3 py-1.5 text-right font-mono">{f.quantity} L</td>
                            <td className="px-3 py-1.5 text-right font-mono font-bold text-slate-900">₹{f.totalAmount.toLocaleString()}</td>
                            <td className="px-3 py-1.5 text-right text-emerald-600 font-bold">{f.calculatedMileage ? `${f.calculatedMileage} km/l` : '—'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-3 py-2 text-center text-slate-400">No fuel records in period</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Incidental Expenses */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  4. Incidental Expenses ({expenses.length})
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200">
                      <tr>
                        <th className="px-3 py-1.5">Date</th>
                        <th className="px-3 py-1.5">Category</th>
                        <th className="px-3 py-1.5">Vendor / Payee</th>
                        <th className="px-3 py-1.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {expenses.length > 0 ? (
                        expenses.map(e => (
                          <tr key={e.id}>
                            <td className="px-3 py-1.5 text-slate-600">{e.date}</td>
                            <td className="px-3 py-1.5 font-medium text-slate-900">{e.category}</td>
                            <td className="px-3 py-1.5 text-slate-500 truncate max-w-[120px]">{e.vendor || e.paidBy}</td>
                            <td className="px-3 py-1.5 text-right font-mono font-bold text-slate-900">₹{e.amount.toLocaleString()}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="px-3 py-2 text-center text-slate-400">No incidental expenses</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 8. Digital Sign-off Block */}
            <div className="mt-10 pt-8 border-t border-slate-200 avoid-break-inside">
              <div className="grid grid-cols-3 gap-6 text-center text-xs">
                <div>
                  <div className="border-b border-slate-300 pb-8 mb-2 font-mono text-slate-400">
                    [ Suresh Kumar ]
                  </div>
                  <strong className="text-slate-900 block">Driver / Fleet In-Charge</strong>
                  <span className="text-[11px] text-slate-500">Prepared & Submitted</span>
                </div>
                <div>
                  <div className="border-b border-slate-300 pb-8 mb-2 font-mono text-slate-400">
                    [ Rajiv Singh ]
                  </div>
                  <strong className="text-slate-900 block">Operations Manager</strong>
                  <span className="text-[11px] text-slate-500">Verified & Approved</span>
                </div>
                <div>
                  <div className="border-b border-slate-300 pb-8 mb-2 font-mono text-slate-400">
                    [ Enerpack Audit ]
                  </div>
                  <strong className="text-slate-900 block">Finance & Internal Audit</strong>
                  <span className="text-[11px] text-slate-500">Certified Compliance</span>
                </div>
              </div>

              <div className="text-center text-[11px] text-slate-400 mt-8">
                Enerpack Fleet Management Operating System • Auto-generated digital audit record
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

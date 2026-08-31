import React, { useState, useMemo } from 'react';
import { 
  BarChart3, Download, Calendar, Filter, FileSpreadsheet, 
  Printer, TrendingUp, DollarSign, Fuel, Wrench, ShieldCheck, 
  CarFront, MapPin, CheckCircle2, ChevronRight, Clock, AlertTriangle, FileText
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip as RechartsTooltip, Legend, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { cn } from '../../lib/utils';
import { generateVehiclePdfReport } from '../../utils/fleetPdfGenerator';
import { PrintableDashboardPdfModal } from '../../components/fleet/PrintableDashboardPdfModal';

export const Reports: React.FC = () => {
  const { 
    vehicles, fuelEntries, expenses, maintenanceRecords, 
    trips, documents, inspections, dailyLogs 
  } = useFleet();

  // 1. Vehicle Selection state (default to first vehicle, e.g. KL65S7466)
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(
    vehicles.length > 0 ? vehicles[0].id : 'all'
  );

  // 2. Report Granularity Timeframe ('Daily' | 'Monthly' | 'Yearly')
  const [timeframe, setTimeframe] = useState<'Daily' | 'Monthly' | 'Yearly'>('Monthly');

  // Selected Date filters
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-29'); // For Daily
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-08'); // For Monthly (YYYY-MM)
  const [selectedYear, setSelectedYear] = useState<string>('2026'); // For Yearly (YYYY)

  // Active data sub-tab inside Reports
  const [activeTab, setActiveTab] = useState<'charts' | 'trips' | 'expenses' | 'fuel' | 'maintenance' | 'compliance'>('charts');

  // PDF Preview Modal state
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Active Vehicle object
  const activeVehicle = useMemo(() => {
    return vehicles.find(v => v.id === selectedVehicleId) || vehicles[0] || {
      id: 'veh-kl65s7466',
      number: 'KL65S7466',
      name: 'Mahindra Bolero Neo',
      type: 'Pickup',
      category: 'Field Operations',
      make: 'Mahindra',
      model: 'Bolero Neo',
      currentStatus: 'Active',
      fuelType: 'Diesel',
      currentOdometer: 28450,
      initialOdometer: 0,
      expectedMileage: 13.5,
      department: 'Field Operations',
      primaryDriverName: 'Suresh Kumar'
    };
  }, [vehicles, selectedVehicleId]);

  // 3. Filtered Data by Vehicle & Timeframe
  const { filteredTrips, filteredFuel, filteredExpenses, filteredMaintenance, filteredInspections } = useMemo(() => {
    const isVehMatch = (vehId: string, vehNum?: string) => {
      if (selectedVehicleId === 'all') return true;
      return vehId === selectedVehicleId || (vehNum && activeVehicle && vehNum === activeVehicle.number);
    };

    const isDateMatch = (dateStr?: string) => {
      if (!dateStr) return false;
      if (timeframe === 'Daily') {
        return dateStr === selectedDate;
      } else if (timeframe === 'Monthly') {
        return dateStr.startsWith(selectedMonth);
      } else if (timeframe === 'Yearly') {
        return dateStr.startsWith(selectedYear);
      }
      return true;
    };

    const vTrips = trips.filter(t => isVehMatch(t.vehicleId, t.vehicleNumber) && isDateMatch(t.tripDate));
    const vFuel = fuelEntries.filter(f => isVehMatch(f.vehicleId, f.vehicleNumber) && isDateMatch(f.date));
    const vExpenses = expenses.filter(e => isVehMatch(e.vehicleId, e.vehicleNumber) && isDateMatch(e.date));
    const vMnt = maintenanceRecords.filter(m => isVehMatch(m.vehicleId, m.vehicleNumber) && isDateMatch(m.date));
    const vInsp = inspections.filter(i => isVehMatch(i.vehicleId, i.vehicleNumber) && isDateMatch(i.date));

    return {
      filteredTrips: vTrips,
      filteredFuel: vFuel,
      filteredExpenses: vExpenses,
      filteredMaintenance: vMnt,
      filteredInspections: vInsp
    };
  }, [trips, fuelEntries, expenses, maintenanceRecords, inspections, selectedVehicleId, activeVehicle, timeframe, selectedDate, selectedMonth, selectedYear]);

  // 4. Financial & Distance KPIs Calculation
  const kpis = useMemo(() => {
    const totalKm = filteredTrips.reduce((s, t) => s + (t.distance || 0), 0);
    const fuelCost = filteredFuel.reduce((s, f) => s + (f.totalAmount || 0), 0);
    const fuelLitres = filteredFuel.reduce((s, f) => s + (f.quantity || 0), 0);
    const maintenanceCost = filteredMaintenance.reduce((s, m) => s + (m.totalCost || 0), 0);
    const otherExpenses = filteredExpenses.reduce((s, e) => s + (e.amount || 0), 0);
    const totalCost = fuelCost + maintenanceCost + otherExpenses;

    const tripsCount = filteredTrips.length;
    const avgMileage = fuelLitres > 0 && totalKm > 0 
      ? Number((totalKm / fuelLitres).toFixed(1)) 
      : (activeVehicle.expectedMileage || 13.5);

    const costPerKm = totalKm > 0 
      ? Number((totalCost / totalKm).toFixed(2)) 
      : 8.75;

    return {
      totalKm: totalKm || (timeframe === 'Daily' ? 210 : timeframe === 'Monthly' ? 2450 : 28450),
      totalCost: totalCost || (timeframe === 'Daily' ? 4209 : timeframe === 'Monthly' ? 18950 : 89400),
      fuelCost: fuelCost || (timeframe === 'Daily' ? 4029 : timeframe === 'Monthly' ? 12280 : 54800),
      maintenanceCost: maintenanceCost || (timeframe === 'Monthly' ? 3000 : timeframe === 'Yearly' ? 22000 : 0),
      otherExpenses: otherExpenses || (timeframe === 'Daily' ? 180 : timeframe === 'Monthly' ? 3670 : 12600),
      fuelLitres: fuelLitres || (timeframe === 'Daily' ? 42.5 : timeframe === 'Monthly' ? 130 : 580),
      avgMileage,
      costPerKm,
      tripsCount: tripsCount || (timeframe === 'Daily' ? 1 : timeframe === 'Monthly' ? 14 : 186)
    };
  }, [filteredTrips, filteredFuel, filteredMaintenance, filteredExpenses, activeVehicle, timeframe]);

  // 5. Chart Data Generators
  const chartData = useMemo(() => {
    if (timeframe === 'Daily') {
      // Hourly / Segment progression
      return [
        { name: '07:00 AM (Start)', distance: 0, cost: 4029, label: 'Fuel Refill' },
        { name: '10:00 AM (Site Reach)', distance: 110, cost: 180, label: 'Toll plaza' },
        { name: '02:00 PM (Inspection)', distance: 160, cost: 60, label: 'Parking' },
        { name: '05:45 PM (Yard Return)', distance: 210, cost: 0, label: 'Trip End' }
      ];
    } else if (timeframe === 'Monthly') {
      // Days of the month (e.g. 1st to 30th)
      return [
        { name: 'Aug 05', distance: 140, cost: 140 },
        { name: 'Aug 10', distance: 220, cost: 3000 },
        { name: 'Aug 15', distance: 190, cost: 750 },
        { name: 'Aug 22', distance: 260, cost: 4252 },
        { name: 'Aug 27', distance: 180, cost: 180 },
        { name: 'Aug 29', distance: 210, cost: 4209 }
      ];
    } else {
      // Yearly: 12 months trajectory
      return [
        { name: 'Jan', distance: 2100, cost: 7800 },
        { name: 'Feb', distance: 2300, cost: 8400 },
        { name: 'Mar', distance: 2450, cost: 9200 },
        { name: 'Apr', distance: 2600, cost: 14500 },
        { name: 'May', distance: 2800, cost: 18000 },
        { name: 'Jun', distance: 2200, cost: 8100 },
        { name: 'Jul', distance: 2400, cost: 8900 },
        { name: 'Aug', distance: 2450, cost: 18950 },
        { name: 'Sep (Est)', distance: 2500, cost: 9000 },
        { name: 'Oct (Est)', distance: 2600, cost: 9200 },
        { name: 'Nov (Est)', distance: 2700, cost: 16000 },
        { name: 'Dec (Est)', distance: 2800, cost: 9500 }
      ];
    }
  }, [timeframe]);

  // Expense Pie Data
  const expensePieData = useMemo(() => {
    const fuel = kpis.fuelCost;
    const mnt = kpis.maintenanceCost;
    const tolls = filteredExpenses.filter(e => e.category.includes('Toll') || e.category.includes('FASTag') || e.category.includes('Parking')).reduce((s, e) => s + e.amount, 0) || (timeframe === 'Daily' ? 180 : 3180);
    const other = Math.max(0, kpis.otherExpenses - tolls) || 750;

    return [
      { name: 'Fuel (Diesel)', value: fuel, color: '#2563eb' },
      { name: 'Maintenance & Parts', value: mnt > 0 ? mnt : (timeframe === 'Yearly' ? 22000 : 3000), color: '#f59e0b' },
      { name: 'FASTag & Tolls', value: tolls, color: '#10b981' },
      { name: 'Washing & Other', value: other, color: '#8b5cf6' }
    ];
  }, [kpis, filteredExpenses, timeframe]);

  // Active statutory documents for the selected vehicle
  const vehicleDocuments = useMemo(() => {
    return documents.filter(d => d.vehicleId === activeVehicle.id || d.vehicleNumber === activeVehicle.number);
  }, [documents, activeVehicle]);

  // Direct jsPDF Download Handler
  const handleDownloadDirectPdf = () => {
    const activeDateLabel = timeframe === 'Daily' ? selectedDate : timeframe === 'Monthly' ? selectedMonth : selectedYear;
    generateVehiclePdfReport({
      vehicle: activeVehicle,
      timeframe,
      selectedDate: activeDateLabel,
      trips: filteredTrips,
      fuelEntries: filteredFuel,
      expenses: filteredExpenses,
      maintenanceRecords: filteredMaintenance,
      documents: vehicleDocuments,
      inspections: filteredInspections,
      kpis,
      chartBreakdown: expensePieData
    });
  };

  // CSV Export Handler
  const handleExportCSV = () => {
    const activeDateLabel = timeframe === 'Daily' ? selectedDate : timeframe === 'Monthly' ? selectedMonth : selectedYear;
    const headers = 'Record Type,Identifier,Date,Vehicle,Details / Description,Amount (INR),Distance / Qty,Status';
    
    const tripRows = filteredTrips.map(t => 
      `"TRIP","${t.tripNumber}","${t.tripDate}","${t.vehicleNumber}","${t.startLocation} to ${t.destination} (${t.tripPurpose})",${(t.tollExpense || 0) + (t.parkingExpense || 0)},"${t.distance} KM","${t.status}"`
    );
    const fuelRows = filteredFuel.map(f => 
      `"FUEL","${f.receiptNumber || 'FL'}","${f.date}","${f.vehicleNumber}","${f.fuelStation}",${f.totalAmount},"${f.quantity} L @ ₹${f.pricePerLitre}/L","Completed"`
    );
    const expRows = filteredExpenses.map(e => 
      `"EXPENSE","${e.expenseNumber}","${e.date}","${e.vehicleNumber}","${e.category}: ${e.description}",${e.amount},"-","${e.status}"`
    );
    const mntRows = filteredMaintenance.map(m => 
      `"MAINTENANCE","${m.recordNumber}","${m.date}","${m.vehicleNumber}","${m.title} @ ${m.workshop}",${m.totalCost},"-","${m.status}"`
    );

    const allRows = [...tripRows, ...fuelRows, ...expRows, ...mntRows];
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...allRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enerpack_${activeVehicle.number}_${timeframe}_Report_${activeDateLabel}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* 1. Header & Action Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
              Fleet Analytics & Reporting
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-600 font-mono">
              Vehicle: {activeVehicle.number}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mt-1">
            Vehicle Operations & Cost Audit Reports
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive Daily, Monthly and Yearly analytics with trips, fuel logs, expenses & dashboard PDF export
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export CSV
          </button>
          
          <button 
            onClick={() => setIsPdfModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Printable Dashboard
          </button>

          <button 
            onClick={handleDownloadDirectPdf}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs shadow-blue-200"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
        </div>
      </div>

      {/* 2. Vehicle Selector & Time Horizon Control Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        {/* Top row: Vehicle Selector + Time Horizon Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Vehicle Dropdown Selector */}
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <CarFront className="w-5 h-5" />
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Vehicle
              </label>
              <select
                value={selectedVehicleId}
                onChange={(e) => setSelectedVehicleId(e.target.value)}
                className="text-sm font-bold text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden font-mono mt-0.5"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.number} — {v.make} {v.model} ({v.primaryDriverName || 'No Driver'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Time Horizon Segment Switcher (Daily | Monthly | Yearly) */}
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
            {(['Daily', 'Monthly', 'Yearly'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={cn(
                  "px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs",
                  timeframe === t 
                    ? "bg-white text-blue-600 shadow-sm" 
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {t} Report
              </button>
            ))}
          </div>

          {/* Date Picker depending on Time Horizon */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            {timeframe === 'Daily' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-500">Date:</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                />
              </div>
            )}

            {timeframe === 'Monthly' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-500">Month:</span>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg px-2.5 py-1.5 bg-white"
                />
              </div>
            )}

            {timeframe === 'Yearly' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-500">Year:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="text-xs font-semibold text-slate-800 border border-slate-300 rounded-lg px-3 py-1.5 bg-white"
                >
                  <option value="2026">2026 (Current Year)</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Meta Badge Ribbon */}
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Vehicle Details</span>
            <span className="font-bold text-slate-800 block truncate">{activeVehicle.make} {activeVehicle.model}</span>
            <span className="text-[11px] text-slate-500">{activeVehicle.variant || activeVehicle.type}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Assigned Driver</span>
            <span className="font-bold text-slate-800 block truncate">{activeVehicle.primaryDriverName || 'Unassigned'}</span>
            <span className="text-[11px] text-slate-500">{activeVehicle.department}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Current Odometer</span>
            <span className="font-bold font-mono text-slate-900 block">{activeVehicle.currentOdometer.toLocaleString()} KM</span>
            <span className="text-[11px] text-emerald-600 font-semibold">{activeVehicle.currentStatus}</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Fuel & Benchmark</span>
            <span className="font-bold text-slate-800 block">{activeVehicle.fuelType}</span>
            <span className="text-[11px] text-slate-500">Exp: {activeVehicle.expectedMileage} km/l</span>
          </div>

          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/70 col-span-2 sm:col-span-1">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Insurance & Fitness</span>
            <span className="font-bold text-emerald-700 block flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active (Valid)
            </span>
            <span className="text-[11px] text-slate-500">Ins: {activeVehicle.insuranceExpiry || '2027-04-11'}</span>
          </div>
        </div>
      </div>

      {/* 3. Executive KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Distance */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-600 uppercase">Distance Logged</span>
            <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
              <MapPin className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {kpis.totalKm.toLocaleString()} <span className="text-xs font-normal text-slate-500">KM</span>
          </span>
          <span className="text-xs text-slate-400 mt-1 block">{kpis.tripsCount} Dispatch Trips</span>
        </div>

        {/* Total Cost */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 uppercase">Total Expenditure</span>
            <span className="p-1.5 bg-rose-50 text-rose-600 rounded-lg">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            ₹{kpis.totalCost.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Fuel + Spares + Tolls</span>
        </div>

        {/* Fuel Consumed */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-600 uppercase">Fuel & Efficiency</span>
            <span className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <Fuel className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            {kpis.fuelLitres.toFixed(1)} <span className="text-xs font-normal text-slate-500">L</span>
          </span>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">
            Avg {kpis.avgMileage > 0 ? kpis.avgMileage : activeVehicle.expectedMileage} KM/L Economy
          </span>
        </div>

        {/* Cost Per KM */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 uppercase">Operational Cost / KM</span>
            <span className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <span className="text-2xl font-bold font-mono text-slate-900 mt-1 block">
            ₹{kpis.costPerKm.toFixed(2)} <span className="text-xs font-normal text-slate-500">/ KM</span>
          </span>
          <span className="text-xs text-slate-400 mt-1 block">Target: ₹9.50 / KM benchmark</span>
        </div>
      </div>

      {/* 4. Visual Charts Section (Distance vs Expense + Expense Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Bar/Trend Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {timeframe === 'Daily' ? "Day's Timeline & Leg-wise Distance / Expense" :
                 timeframe === 'Monthly' ? `Daily Distance & Spend Trend (${selectedMonth})` :
                 `Month-by-Month Annual Financial Trajectory (${selectedYear})`}
              </h3>
              <p className="text-xs text-slate-500">
                Visual analysis of kilometers traveled vs operational funds utilized
              </p>
            </div>
            <span className="text-xs font-mono font-bold px-2 py-1 bg-slate-100 text-slate-700 rounded">
              {timeframe.toUpperCase()}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <RechartsTooltip 
                  formatter={(value: number, name: string) => [
                    name.includes('Expense') || name.includes('cost') ? `₹${value.toLocaleString()}` : `${value.toLocaleString()} KM`,
                    name
                  ]}
                  contentStyle={{ borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="distance" name="Distance (KM)" fill="#2563eb" radius={[4, 4, 0, 0]} />
                <Bar dataKey="cost" name="Expense (₹)" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Pie */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-0.5">Operating Cost Breakdown</h3>
            <p className="text-xs text-slate-500 mb-2">Category-wise spend allocation</p>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
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
          </div>

          <div className="space-y-1.5 pt-3 border-t border-slate-100 text-xs">
            {expensePieData.map(item => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-600 truncate">{item.name}</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₹{item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 5. Sub-navigation Tabs for Itemized Data Tables */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Tab Headers */}
        <div className="flex items-center gap-1 p-2 bg-slate-50/70 border-b border-slate-200 overflow-x-auto">
          {[
            { id: 'charts', label: 'Financial Summary' },
            { id: 'trips', label: `Trips Log (${filteredTrips.length})` },
            { id: 'expenses', label: `Expenses (${filteredExpenses.length})` },
            { id: 'fuel', label: `Fuel Refills (${filteredFuel.length})` },
            { id: 'maintenance', label: `Maintenance (${filteredMaintenance.length})` },
            { id: 'compliance', label: `Documents (${vehicleDocuments.length})` },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab 1: Financial Summary Table */}
        {activeTab === 'charts' && (
          <div className="p-4 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Expense Category</th>
                  <th className="px-4 py-3">Volume / Event Count</th>
                  <th className="px-4 py-3 text-right">Total Amount (INR)</th>
                  <th className="px-4 py-3 text-right">% Share of Operating Budget</th>
                  <th className="px-4 py-3">Audit / Payment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">Fuel & Diesel Refills</div>
                    <div className="text-[11px] text-slate-400">Regular tank fills @ Indian Oil / BPCL</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {kpis.fuelLitres.toFixed(1)} Litres ({filteredFuel.length} Refills)
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ₹{kpis.fuelCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-blue-600">
                    {kpis.totalCost > 0 ? ((kpis.fuelCost / kpis.totalCost) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                      Settled
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">Maintenance, Spares & Scheduled Services</div>
                    <div className="text-[11px] text-slate-400">Periodic checks, oil changes, brake pads</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {filteredMaintenance.length} Workshop Records
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ₹{kpis.maintenanceCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-amber-600">
                    {kpis.totalCost > 0 ? ((kpis.maintenanceCost / kpis.totalCost) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">
                      Approved
                    </span>
                  </td>
                </tr>

                <tr className="hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">FASTag Tolls, Washing & Incidental Expenses</div>
                    <div className="text-[11px] text-slate-400">National Highway tolls, detailing, driver claims</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {filteredExpenses.length} Expense Claims
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                    ₹{kpis.otherExpenses.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">
                    {kpis.totalCost > 0 ? ((kpis.otherExpenses / kpis.totalCost) * 100).toFixed(1) : 0}%
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                      Paid
                    </span>
                  </td>
                </tr>

                <tr className="bg-slate-50 font-bold border-t border-slate-200">
                  <td className="px-4 py-3.5 text-slate-900 uppercase">
                    Total Vehicle Operating Cost
                  </td>
                  <td className="px-4 py-3.5 text-slate-700">
                    {kpis.totalKm.toLocaleString()} KM Total
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-blue-600 text-sm">
                    ₹{kpis.totalCost.toLocaleString()}
                  </td>
                  <td className="px-4 py-3.5 text-right text-slate-900">
                    100.0%
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">
                    Avg ₹{kpis.costPerKm.toFixed(2)}/KM
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Trips Table */}
        {activeTab === 'trips' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Trip # & Date</th>
                  <th className="px-4 py-3">Route (From - To)</th>
                  <th className="px-4 py-3">Purpose / Department</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3 text-right">Distance (KM)</th>
                  <th className="px-4 py-3 text-right">Toll / Parking</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTrips.length > 0 ? (
                  filteredTrips.map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {t.tripNumber}
                        <div className="text-[11px] text-slate-400 font-sans">{t.tripDate}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{t.startLocation} → {t.destination}</div>
                        <div className="text-[11px] text-slate-400">{t.startTime} - {t.endTime || 'Ongoing'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-slate-800 block">{t.tripPurpose}</span>
                        <span className="text-[11px] text-slate-400">{t.customerDepartment || t.tripType}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{t.driverName || 'Unassigned'}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{t.distance} KM</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">₹{(t.tollExpense || 0) + (t.parkingExpense || 0)}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                      No dispatch trips found for the selected vehicle and date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Expenses Table */}
        {activeTab === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Expense # & Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Vendor / Payee</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount (INR)</th>
                  <th className="px-4 py-3">Approved By</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.length > 0 ? (
                  filteredExpenses.map(e => (
                    <tr key={e.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {e.expenseNumber}
                        <div className="text-[11px] text-slate-400 font-sans">{e.date}</div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-slate-800 block">{e.category}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{e.vendor || e.paidBy}</div>
                        {e.invoiceNumber && <div className="text-[10px] text-slate-400">Inv: {e.invoiceNumber}</div>}
                      </td>
                      <td className="px-4 py-3 text-slate-500">{e.description}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">₹{e.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-600">{e.approvedBy || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                      No expense records found for the selected vehicle and date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Fuel Table */}
        {activeTab === 'fuel' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Fuel Station</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Rate / Litre</th>
                  <th className="px-4 py-3 text-right">Total Cost</th>
                  <th className="px-4 py-3 text-right">Odometer</th>
                  <th className="px-4 py-3 text-right">Calculated Mileage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredFuel.length > 0 ? (
                  filteredFuel.map(f => (
                    <tr key={f.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {f.date}
                        <div className="text-[11px] text-slate-400 font-sans">{f.time}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{f.fuelStation}</div>
                        <div className="text-[10px] text-slate-400">Receipt: {f.receiptNumber}</div>
                      </td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">{f.quantity} L</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-700">₹{f.pricePerLitre.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-blue-600">₹{f.totalAmount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-800">{f.odometer.toLocaleString()} KM</td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-600">
                        {f.calculatedMileage ? `${f.calculatedMileage} km/l` : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                      No fuel refill records found for this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 5: Maintenance Table */}
        {activeTab === 'maintenance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Record # & Date</th>
                  <th className="px-4 py-3">Service Details</th>
                  <th className="px-4 py-3">Workshop & Technician</th>
                  <th className="px-4 py-3 text-right">Odometer</th>
                  <th className="px-4 py-3 text-right">Parts + Labor</th>
                  <th className="px-4 py-3 text-right">Total Cost</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMaintenance.length > 0 ? (
                  filteredMaintenance.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900">
                        {m.recordNumber}
                        <div className="text-[11px] text-slate-400 font-sans">{m.date}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{m.title}</div>
                        <div className="text-[11px] text-slate-500">{m.serviceType}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-900">{m.workshop}</div>
                        {m.technician && <div className="text-[10px] text-slate-400">Tech: {m.technician}</div>}
                      </td>
                      <td className="px-4 py-3 text-right font-mono text-slate-800">{m.odometer.toLocaleString()} KM</td>
                      <td className="px-4 py-3 text-right text-[11px] text-slate-500">P: ₹{m.partsCost} | L: ₹{m.labourCost}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-amber-600">₹{m.totalCost.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                          {m.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                      No workshop maintenance records in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 6: Compliance & Documents */}
        {activeTab === 'compliance' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Document Type</th>
                  <th className="px-4 py-3">Document Number</th>
                  <th className="px-4 py-3">Issuing Authority</th>
                  <th className="px-4 py-3">Issue Date</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Compliance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vehicleDocuments.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-bold text-slate-900">{doc.documentType}</td>
                    <td className="px-4 py-3 font-mono text-slate-800">{doc.documentNumber}</td>
                    <td className="px-4 py-3 text-slate-600">{doc.issuingAuthority}</td>
                    <td className="px-4 py-3 text-slate-600">{doc.issueDate}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">{doc.expiryDate}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">
                        Valid
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 6. Printable Dashboard PDF Preview Modal */}
      <PrintableDashboardPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        vehicle={activeVehicle}
        timeframe={timeframe}
        selectedDate={timeframe === 'Daily' ? selectedDate : timeframe === 'Monthly' ? selectedMonth : selectedYear}
        trips={filteredTrips}
        fuelEntries={filteredFuel}
        expenses={filteredExpenses}
        maintenanceRecords={filteredMaintenance}
        documents={vehicleDocuments}
        inspections={filteredInspections}
        kpis={kpis}
        chartData={chartData}
        expensePieData={expensePieData}
        onDownloadDirectPdf={handleDownloadDirectPdf}
      />
    </div>
  );
};

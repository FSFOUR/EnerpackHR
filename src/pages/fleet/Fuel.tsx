import React, { useState } from 'react';
import { 
  Plus, Search, Filter, Fuel as FuelIcon, TrendingDown, 
  Download, AlertTriangle, Trash2, Edit2, CarFront, Check
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { cn } from '../../lib/utils';

export const Fuel: React.FC = () => {
  const { 
    fuelEntries, vehicles, openQuickModal, 
    deleteFuelEntry, setSelectedVehicleId 
  } = useFleet();

  const [search, setSearch] = useState('');
  const [selectedFuelType, setSelectedFuelType] = useState<string>('All');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('All');

  const filteredFuel = fuelEntries.filter(f => {
    const matchesSearch = 
      f.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      f.fuelStation.toLowerCase().includes(search.toLowerCase()) ||
      (f.driverName && f.driverName.toLowerCase().includes(search.toLowerCase())) ||
      (f.receiptNumber && f.receiptNumber.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedFuelType === 'All' || f.fuelType === selectedFuelType;
    const matchesVeh = selectedVehicle === 'All' || f.vehicleId === selectedVehicle || f.vehicleNumber === selectedVehicle;

    return matchesSearch && matchesType && matchesVeh;
  });

  const totalLitres = fuelEntries.reduce((s, f) => s + f.quantity, 0);
  const totalFuelCost = fuelEntries.reduce((s, f) => s + f.totalAmount, 0);
  const validMileageEntries = fuelEntries.filter(f => f.calculatedMileage && f.calculatedMileage > 0);
  const avgFleetMileage = validMileageEntries.length > 0
    ? (validMileageEntries.reduce((s, f) => s + (f.calculatedMileage || 0), 0) / validMileageEntries.length).toFixed(1)
    : '11.8';

  const exportCSV = () => {
    const headers = ['Date,Vehicle,Station,Fuel Type,Qty (L),Price/L,Total (INR),Odometer (KM),Mileage (KM/L),Cost/KM,Receipt,Driver'];
    const rows = filteredFuel.map(f => 
      `"${f.date}","${f.vehicleNumber}","${f.fuelStation}","${f.fuelType}",${f.quantity},${f.pricePerLitre},${f.totalAmount},${f.odometer},${f.calculatedMileage || ''},${f.costPerKm || ''},"${f.receiptNumber || ''}","${f.driverName || ''}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enerpack_Fuel_Register_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fuel & Refill Intelligence</h2>
          <p className="text-xs text-slate-500 mt-0.5">Track litres pumped, fuel cards, station rates, mileage algorithms & anomaly detection</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Register
          </button>
          <button 
            onClick={() => openQuickModal('addFuel')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Fuel Entry
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase">Total Fuel Pumped</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{totalLitres.toLocaleString()} L</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 block uppercase">Total Fuel Expenditure</span>
          <span className="text-2xl font-bold text-blue-700 mt-1 block">₹{totalFuelCost.toLocaleString()}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 block uppercase">Fleet Avg Mileage</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{avgFleetMileage} km/l</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 block uppercase">Fuel Anomaly Alerts</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">
            {fuelEntries.filter(f => f.isAnomaly).length}
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search fuel entries by vehicle, station, receipt, driver..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedFuelType}
              onChange={(e) => setSelectedFuelType(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
            >
              {['All', 'Petrol', 'Diesel', 'CNG', 'EV'].map(f => (
                <option key={f} value={f}>Fuel: {f}</option>
              ))}
            </select>

            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
            >
              <option value="All">All Vehicles</option>
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.number}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Fuel Records Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Fuel Station</th>
                <th className="px-4 py-3 text-right">Odometer</th>
                <th className="px-4 py-3 text-right">Qty (L)</th>
                <th className="px-4 py-3 text-right">Price / L</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
                <th className="px-4 py-3 text-right">Calculated Mileage</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredFuel.map(f => (
                <tr key={f.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900">{f.date}</div>
                    <div className="text-[11px] text-slate-400">{f.time || '10:00 AM'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setSelectedVehicleId(f.vehicleId)}
                      className="font-bold text-blue-600 hover:underline block font-mono"
                    >
                      {f.vehicleNumber}
                    </button>
                    <div className="text-slate-500 text-[11px]">{f.fuelType}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900">{f.fuelStation}</div>
                    <div className="text-[11px] text-slate-400">Rcpt: {f.receiptNumber || 'N/A'}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-medium text-slate-900">
                    {f.odometer.toLocaleString()} KM
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-800">
                    {f.quantity} L
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    ₹{f.pricePerLitre.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                    ₹{f.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {f.isAnomaly && (
                        <div className="group relative">
                          <TrendingDown className="w-4 h-4 text-rose-500" />
                          <div className="absolute right-0 bottom-full mb-1 w-52 p-2 bg-slate-900 text-white text-[11px] rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                            {f.anomalyReason || 'Mileage dropped significantly below expected.'}
                          </div>
                        </div>
                      )}
                      <span className={cn(
                        "font-bold font-mono",
                        f.isAnomaly ? "text-rose-600" : "text-emerald-600"
                      )}>
                        {f.calculatedMileage ? `${f.calculatedMileage} km/l` : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button 
                      onClick={() => {
                        if (confirm(`Delete fuel entry for ${f.vehicleNumber}?`)) deleteFuelEntry(f.id);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 rounded"
                      title="Delete Entry"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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

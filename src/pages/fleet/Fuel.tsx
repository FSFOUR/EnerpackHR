import React from 'react';
import { Plus, Search, Filter, Fuel as FuelIcon, TrendingDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const mockFuel = [
  { id: '1', date: 'Oct 23, 2024', vehicle: 'KL-01-AB-1234', type: 'Petrol', qty: '35 L', cost: '₹3,675', odometer: '45,150', mileage: '14.2 km/l', station: 'Indian Oil, Edappally' },
  { id: '2', date: 'Oct 22, 2024', vehicle: 'KL-07-XY-9876', type: 'Diesel', qty: '42 L', cost: '₹3,990', odometer: '112,010', mileage: '10.8 km/l', station: 'Bharat Petroleum, Vyttila' },
  { id: '3', date: 'Oct 20, 2024', vehicle: 'KL-32-LM-4444', type: 'Diesel', qty: '85 L', cost: '₹8,075', odometer: '85,420', mileage: '5.2 km/l', station: 'Reliance, Kalamassery', anomaly: true },
];

export const Fuel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900">Fuel Register</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-xs self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Fuel Entry
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-1">Total Fuel (This Month)</div>
          <div className="text-2xl font-bold text-slate-900">1,245 L</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-1">Fuel Cost (This Month)</div>
          <div className="text-2xl font-bold text-slate-900">₹1,18,500</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-1">Fleet Avg Mileage</div>
          <div className="text-2xl font-bold text-slate-900">11.4 km/l</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200">
          <div className="text-sm font-medium text-slate-500 mb-1">Avg Fuel Cost / KM</div>
          <div className="text-2xl font-bold text-slate-900">₹8.35</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search fuel entries..." 
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors text-sm shrink-0">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Station</th>
                <th className="px-4 py-3 text-right">Odometer</th>
                <th className="px-4 py-3 text-right">Qty & Cost</th>
                <th className="px-4 py-3 text-right">Calculated Mileage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockFuel.map(f => (
                <tr key={f.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{f.date}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{f.vehicle}</div>
                    <div className="text-xs text-slate-500">{f.type}</div>
                  </td>
                  <td className="px-4 py-3 text-xs">{f.station}</td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">{f.odometer}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-bold text-slate-900">{f.cost}</div>
                    <div className="text-xs text-slate-500">{f.qty}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {f.anomaly && (
                        <div className="group relative">
                          <TrendingDown className="w-4 h-4 text-red-500" />
                          <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-white text-[10px] rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            Mileage dropped significantly compared to average.
                          </div>
                        </div>
                      )}
                      <span className={cn(
                        "font-semibold",
                        f.anomaly ? "text-red-600" : "text-emerald-600"
                      )}>{f.mileage}</span>
                    </div>
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

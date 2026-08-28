import React from 'react';
import { Plus, Search, Filter, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

const mockTrips = [
  { id: '1', date: 'Oct 24, 2024', vehicle: 'KL-01-AB-1234', driver: 'John Doe', start: 'Kochi HQ', end: 'Trivandrum Branch', distance: '210 KM', status: 'Completed', type: 'Official Travel' },
  { id: '2', date: 'Oct 24, 2024', vehicle: 'KL-07-XY-9876', driver: 'Jane Smith', start: 'Warehouse A', end: 'Ernakulam Port', distance: '45 KM', status: 'In Progress', type: 'Delivery' },
  { id: '3', date: 'Oct 25, 2024', vehicle: 'KL-32-LM-4444', driver: 'Mike Johnson', start: 'Kochi HQ', end: 'Kozhikode', distance: '180 KM', status: 'Planned', type: 'Material Collection' },
];

export const Trips: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900">Trip Management</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-xs self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Trip
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search trips by vehicle, driver or location..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-medium text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Vehicle & Driver</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3 text-right">Distance</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockTrips.map(trip => (
                <tr key={trip.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                  <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">{trip.date}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{trip.vehicle}</div>
                    <div className="text-xs text-slate-500">{trip.driver}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        {trip.start}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-700">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0 ml-[-3px]" />
                        {trip.end}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900">{trip.distance}</td>
                  <td className="px-4 py-3 text-xs">{trip.type}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider",
                      trip.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      trip.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    )}>{trip.status}</span>
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

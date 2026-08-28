import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, CarFront, Fuel, MapPin, Wrench } from 'lucide-react';
import { cn } from '../../lib/utils';

const mockVehicles = [
  { id: '1', number: 'KL-01-AB-1234', name: 'Honda City', type: 'Car', driver: 'John Doe', status: 'Active', odometer: '45,230', fuelType: 'Petrol', mileage: '14.2 km/l' },
  { id: '2', number: 'KL-07-XY-9876', name: 'Mahindra Bolero', type: 'SUV', driver: 'Jane Smith', status: 'In Trip', odometer: '112,450', fuelType: 'Diesel', mileage: '10.8 km/l' },
  { id: '3', number: 'KL-32-LM-4444', name: 'Ashok Leyland Truck', type: 'Truck', driver: 'Mike Johnson', status: 'Maintenance', odometer: '85,900', fuelType: 'Diesel', mileage: '5.4 km/l' },
  { id: '4', number: 'KL-01-PQ-5555', name: 'Tata Ace', type: 'Pickup', driver: 'Unassigned', status: 'Available', odometer: '12,300', fuelType: 'Diesel', mileage: '16.5 km/l' },
];

export const Vehicles: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-slate-900">Vehicle Master</h2>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-xs self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Vehicle
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search vehicles by number, name or driver..." 
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-xl font-medium hover:bg-slate-50 transition-colors">
          <Filter className="w-4 h-4" /> Filters
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {mockVehicles.map(v => (
          <div key={v.id} className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 transition-colors overflow-hidden group cursor-pointer">
            <div className="p-4 border-b border-slate-100 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <CarFront className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">{v.number}</h3>
                  <p className="text-sm text-slate-500 font-medium">{v.name}</p>
                </div>
              </div>
              <button className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Assigned Driver</p>
                <p className="text-sm font-medium text-slate-900 truncate">{v.driver}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Status</p>
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
                  v.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                  v.status === 'In Trip' ? 'bg-blue-100 text-blue-700' :
                  v.status === 'Available' ? 'bg-slate-100 text-slate-700' :
                  'bg-orange-100 text-orange-700'
                )}>{v.status}</span>
              </div>
            </div>
            
            <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100 grid grid-cols-3 gap-2">
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Odometer</span>
                </div>
                <span className="text-xs font-semibold text-slate-700">{v.odometer}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                  <Fuel className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Type</span>
                </div>
                <span className="text-xs font-semibold text-slate-700">{v.fuelType}</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                  <Wrench className="w-3.5 h-3.5" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Avg</span>
                </div>
                <span className="text-xs font-semibold text-slate-700">{v.mileage}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

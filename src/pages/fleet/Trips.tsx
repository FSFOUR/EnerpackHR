import React, { useState } from 'react';
import { 
  Plus, Search, Filter, MapPin, Play, CheckCircle2, 
  Trash2, Download, CarFront, User, ArrowRight
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { TripStatus } from '../../types/fleet';
import { cn } from '../../lib/utils';

export const Trips: React.FC = () => {
  const { 
    trips, vehicles, drivers, openQuickModal, 
    startTrip, completeTrip, deleteTrip, setSelectedVehicleId, setSelectedDriverId 
  } = useFleet();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('All');
  const [completingTripId, setCompletingTripId] = useState<string | null>(null);
  const [finalOdoInput, setFinalOdoInput] = useState<number>(0);

  const filteredTrips = trips.filter(t => {
    const matchesSearch = 
      t.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      t.driverName.toLowerCase().includes(search.toLowerCase()) ||
      t.startLocation.toLowerCase().includes(search.toLowerCase()) ||
      t.destination.toLowerCase().includes(search.toLowerCase()) ||
      t.tripPurpose.toLowerCase().includes(search.toLowerCase()) ||
      t.tripNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || t.status === selectedStatus;
    const matchesVeh = selectedVehicle === 'All' || t.vehicleId === selectedVehicle || t.vehicleNumber === selectedVehicle;

    return matchesSearch && matchesStatus && matchesVeh;
  });

  const totalDistance = trips.reduce((s, t) => s + t.distance, 0);
  const inProgressCount = trips.filter(t => t.status === 'In Progress').length;
  const completedCount = trips.filter(t => t.status === 'Completed').length;

  const exportCSV = () => {
    const headers = ['Trip No,Date,Vehicle,Driver,Purpose,Start Location,Destination,Start Odo,End Odo,Distance (KM),Type,Status'];
    const rows = filteredTrips.map(t => 
      `"${t.tripNumber}","${t.tripDate}","${t.vehicleNumber}","${t.driverName}","${t.tripPurpose}","${t.startLocation}","${t.destination}",${t.startOdometer},${t.endOdometer},${t.distance},"${t.tripType}","${t.status}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enerpack_Trip_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCompleteSubmit = (tripId: string) => {
    if (finalOdoInput > 0) {
      completeTrip(tripId, finalOdoInput);
      setCompletingTripId(null);
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Trip Logs & Journey Tracking</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time journey management, destination tracking, and odometer validation</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Trips
          </button>
          <button 
            onClick={() => openQuickModal('newTrip')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> New Trip
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase">Total Trips</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{trips.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-blue-600 block uppercase">Live on Road</span>
          <span className="text-2xl font-bold text-blue-700 mt-1 block">{inProgressCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 block uppercase">Completed</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{completedCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-indigo-600 block uppercase">Total Distance Logged</span>
          <span className="text-2xl font-bold text-indigo-700 mt-1 block">{totalDistance.toLocaleString()} KM</span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by vehicle, driver, start, destination, or purpose..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Status:</span>
          {['All', 'In Progress', 'Completed', 'Planned', 'Cancelled'].map(st => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={cn(
                "px-2.5 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap",
                selectedStatus === st 
                  ? "bg-slate-900 text-white" 
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Trip # & Date</th>
                <th className="px-4 py-3">Vehicle & Driver</th>
                <th className="px-4 py-3">Route (Start ➔ End)</th>
                <th className="px-4 py-3">Purpose & Type</th>
                <th className="px-4 py-3 text-right">Odometer Log</th>
                <th className="px-4 py-3 text-right">Distance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTrips.map(trip => (
                <tr key={trip.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="font-bold text-slate-900 font-mono">{trip.tripNumber}</div>
                    <div className="text-slate-500 text-[11px]">{trip.tripDate}</div>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setSelectedVehicleId(trip.vehicleId)}
                      className="font-bold text-blue-600 hover:underline block font-mono"
                    >
                      {trip.vehicleNumber}
                    </button>
                    <div className="text-slate-500">{trip.driverName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        {trip.startLocation}
                      </span>
                      <span className="text-slate-600 flex items-center gap-1.5 pl-0.5">
                        <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                        {trip.destination}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 max-w-xs truncate">{trip.tripPurpose}</div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">{trip.tripType}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <div className="text-slate-900 font-medium">{trip.startOdometer.toLocaleString()} ➔ {trip.endOdometer.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                    {trip.distance} KM
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                      trip.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                      trip.status === 'In Progress' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                      'bg-slate-100 text-slate-700'
                    )}>
                      {trip.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {trip.status === 'Planned' && (
                        <button 
                          onClick={() => startTrip(trip.id)}
                          className="px-2 py-1 bg-blue-600 text-white rounded text-[11px] font-semibold hover:bg-blue-700 flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" /> Start
                        </button>
                      )}
                      {trip.status === 'In Progress' && (
                        completingTripId === trip.id ? (
                          <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                            <input 
                              type="number"
                              placeholder="End Odo"
                              className="w-20 px-1.5 py-0.5 border border-slate-300 rounded text-xs"
                              value={finalOdoInput || ''}
                              onChange={e => setFinalOdoInput(Number(e.target.value))}
                            />
                            <button
                              onClick={() => handleCompleteSubmit(trip.id)}
                              className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-xs font-bold"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setCompletingTripId(null)}
                              className="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => {
                              setCompletingTripId(trip.id);
                              setFinalOdoInput(trip.startOdometer + 50);
                            }}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-semibold hover:bg-emerald-700 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3 h-3" /> Complete
                          </button>
                        )
                      )}
                      <button 
                        onClick={() => {
                          if (confirm('Delete this trip record?')) deleteTrip(trip.id);
                        }}
                        className="p-1 text-slate-400 hover:text-red-600 rounded"
                        title="Delete Trip"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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

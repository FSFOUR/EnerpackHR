import React, { useState } from 'react';
import { 
  Plus, Search, Filter, MapPin, Play, CheckCircle2, 
  Trash2, Download, CarFront, User, ArrowRight, Gauge,
  AlertTriangle, Clock, Calendar, RefreshCw, UserCheck, Check, X
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { Trip, TripStatus } from '../../types/fleet';
import { cn } from '../../lib/utils';
import { DriverNextTripCard } from '../../components/fleet/DriverNextTripCard';

export const Trips: React.FC = () => {
  const { 
    trips, vehicles, drivers, openQuickModal, 
    startTrip, completeTrip, acceptTrip, declineTrip, 
    reassignTrip, deleteTrip, setSelectedVehicleId, setSelectedDriverId 
  } = useFleet();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('All');
  
  // Start Trip Confirmation Modal state
  const [startingTrip, setStartingTrip] = useState<Trip | null>(null);
  const [startOdoInput, setStartOdoInput] = useState<number>(0);
  const [startOdoError, setStartOdoError] = useState<string | null>(null);

  // Complete Trip Modal state
  const [completingTrip, setCompletingTrip] = useState<Trip | null>(null);
  const [finalOdoInput, setFinalOdoInput] = useState<number>(0);
  const [completeError, setCompleteError] = useState<string | null>(null);

  // Reassign Modal state
  const [reassigningTrip, setReassigningTrip] = useState<Trip | null>(null);
  const [newDriverId, setNewDriverId] = useState<string>('');
  const [newVehicleId, setNewVehicleId] = useState<string>('');

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

  const totalDistance = trips.reduce((s, t) => s + (t.distance || 0), 0);
  const inProgressCount = trips.filter(t => t.status === 'In Progress' || (t.status as string) === 'IN_PROGRESS').length;
  const assignedCount = trips.filter(t => t.status === 'Assigned' || t.status === 'Accepted').length;
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

  const handleOpenStartTrip = (trip: Trip) => {
    const veh = vehicles.find(v => v.id === trip.vehicleId);
    setStartingTrip(trip);
    setStartOdoInput(veh?.currentOdometer || trip.startOdometer || 0);
    setStartOdoError(null);
  };

  const handleConfirmStartTrip = () => {
    if (!startingTrip) return;
    if (startOdoInput < 0) {
      setStartOdoError('Odometer reading must be a non-negative number.');
      return;
    }
    startTrip(startingTrip.id, startOdoInput);
    setStartingTrip(null);
  };

  const handleOpenCompleteTrip = (trip: Trip) => {
    setCompletingTrip(trip);
    setFinalOdoInput(trip.endOdometer > trip.startOdometer ? trip.endOdometer : trip.startOdometer + 45);
    setCompleteError(null);
  };

  const handleConfirmCompleteTrip = () => {
    if (!completingTrip) return;
    if (finalOdoInput < completingTrip.startOdometer) {
      setCompleteError(`Final odometer cannot be less than start odometer (${completingTrip.startOdometer.toLocaleString()} KM).`);
      return;
    }
    completeTrip(completingTrip.id, finalOdoInput);
    setCompletingTrip(null);
  };

  const handleOpenReassign = (trip: Trip) => {
    setReassigningTrip(trip);
    setNewDriverId(trip.driverId);
    setNewVehicleId(trip.vehicleId);
  };

  const handleConfirmReassign = () => {
    if (!reassigningTrip || !newDriverId) return;
    reassignTrip(reassigningTrip.id, newDriverId, newVehicleId);
    setReassigningTrip(null);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Trip Logs & Journey Dispatch</h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated conflict checking, driver assignment confirmation & live mission tracking</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Trips
          </button>
          <button 
            onClick={() => openQuickModal('newTrip', { status: 'Assigned' })}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-colors shadow-xs"
            title="Plan new trip and assign to driver and vehicle"
          >
            <MapPin className="w-4 h-4" /> New Trip
          </button>
        </div>
      </div>

      {/* DRIVER'S "NEXT TRIP" COMPONENT INTEGRATION */}
      <DriverNextTripCard allowDriverSwitch={true} />

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
          <span className="text-xs font-semibold text-amber-600 block uppercase">Pending / Assigned</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{assignedCount}</span>
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
              placeholder="Search by vehicle, driver, start, destination, or trip number..." 
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
                <option key={v.id} value={v.id}>{v.number} ({v.name})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Status Filter:</span>
          {['All', 'In Progress', 'Assigned', 'Accepted', 'Planned', 'Completed', 'Declined', 'Cancelled'].map(st => (
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
                <th className="px-4 py-3">Route (Origin ➔ Destination)</th>
                <th className="px-4 py-3">Purpose & Load</th>
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
                    <div className="text-slate-500 text-[11px] flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {trip.tripDate} {trip.startTime ? `• ${trip.startTime}` : ''}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button 
                      onClick={() => setSelectedVehicleId(trip.vehicleId)}
                      className="font-bold text-blue-600 hover:underline block font-mono text-xs"
                    >
                      {trip.vehicleNumber}
                    </button>
                    <div className="text-slate-700 font-medium flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3 text-slate-400" />
                      {trip.driverName}
                    </div>
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
                    <div className="text-[10px] text-slate-400 font-semibold uppercase flex items-center gap-1.5">
                      <span>{trip.tripType}</span>
                      {trip.customerDepartment && <span>• {trip.customerDepartment}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    <div className="text-slate-900 font-medium">
                      {trip.startOdometer.toLocaleString()} ➔ {trip.endOdometer > trip.startOdometer ? trip.endOdometer.toLocaleString() : '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 text-sm">
                    {trip.distance > 0 ? `${trip.distance} KM` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase inline-flex items-center gap-1",
                        trip.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                        trip.status === 'In Progress' ? 'bg-blue-100 text-blue-700 animate-pulse' :
                        trip.status === 'Accepted' ? 'bg-indigo-100 text-indigo-700' :
                        trip.status === 'Assigned' ? 'bg-amber-100 text-amber-800' :
                        trip.status === 'Declined' ? 'bg-rose-100 text-rose-700' :
                        'bg-slate-100 text-slate-700'
                      )}>
                        {trip.status === 'In Progress' && <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />}
                        {trip.status}
                      </span>
                      {trip.declineReason && (
                        <p className="text-[10px] text-rose-600 font-medium max-w-[150px] truncate" title={trip.declineReason}>
                          Reason: {trip.declineReason}
                        </p>
                      )}
                      {trip.supervisorOverride && (
                        <span className="block text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200">
                          Override Approved
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Action for Assigned or Planned: Prompt Odometer and Start */}
                      {(trip.status === 'Assigned' || trip.status === 'Accepted' || trip.status === 'Planned') && (
                        <button 
                          onClick={() => handleOpenStartTrip(trip)}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-semibold hover:bg-blue-700 flex items-center gap-1 shadow-xs transition-colors"
                          title="Start Trip (Confirm Odometer)"
                        >
                          <Play className="w-3 h-3 fill-white" /> Start
                        </button>
                      )}

                      {/* Action for In Progress: Complete with final odometer */}
                      {trip.status === 'In Progress' && (
                        <button 
                          onClick={() => handleOpenCompleteTrip(trip)}
                          className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold hover:bg-emerald-700 flex items-center gap-1 shadow-xs transition-colors"
                          title="Complete Trip (Log Final Odometer)"
                        >
                          <CheckCircle2 className="w-3 h-3" /> Complete
                        </button>
                      )}

                      {/* Reassign action if declined or planned */}
                      {(trip.status === 'Declined' || trip.status === 'Planned' || trip.status === 'Assigned') && (
                        <button
                          onClick={() => handleOpenReassign(trip)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] font-medium flex items-center gap-1"
                          title="Reassign Driver / Vehicle"
                        >
                          <UserCheck className="w-3 h-3 text-blue-600" /> Reassign
                        </button>
                      )}

                      <button 
                        onClick={() => {
                          if (confirm(`Delete trip record ${trip.tripNumber}?`)) deleteTrip(trip.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-rose-50 rounded transition-colors"
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

      {/* START TRIP CONFIRMATION MODAL */}
      {startingTrip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Play className="w-5 h-5 fill-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Start Trip Dispatch</h3>
                  <p className="text-[11px] text-slate-500">{startingTrip.tripNumber} ({startingTrip.vehicleNumber})</p>
                </div>
              </div>
              <button 
                onClick={() => setStartingTrip(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-900">
                <div className="font-bold mb-0.5">Route: {startingTrip.startLocation} ➔ {startingTrip.destination}</div>
                <div>Assigned Driver: <strong>{startingTrip.driverName}</strong></div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Confirm Starting Odometer (KM) *
                </label>
                <div className="relative">
                  <Gauge className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={startOdoInput || ''}
                    onChange={(e) => {
                      setStartOdoInput(Number(e.target.value));
                      setStartOdoError(null);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 text-base font-bold font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Enter dashboard KM"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Changes status from <strong>{startingTrip.status.toUpperCase()}</strong> to <strong>IN_PROGRESS</strong>.
                </p>
              </div>

              {startOdoError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{startOdoError}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setStartingTrip(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStartTrip}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Confirm & Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE TRIP MODAL */}
      {completingTrip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Complete Journey</h3>
                  <p className="text-[11px] text-slate-500">{completingTrip.tripNumber} ({completingTrip.destination})</p>
                </div>
              </div>
              <button 
                onClick={() => setCompletingTrip(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block">Start Odometer:</span>
                  <span className="font-bold text-slate-900 font-mono text-sm">
                    {completingTrip.startOdometer.toLocaleString()} KM
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Calculated Distance:</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">
                    {Math.max(0, finalOdoInput - completingTrip.startOdometer)} KM
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Final Dashboard Odometer (KM) *
                </label>
                <input
                  type="number"
                  value={finalOdoInput || ''}
                  onChange={(e) => {
                    setFinalOdoInput(Number(e.target.value));
                    setCompleteError(null);
                  }}
                  className="w-full px-3 py-2.5 text-base font-bold font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Enter final KM reading"
                />
              </div>

              {completeError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{completeError}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setCompletingTrip(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompleteTrip}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Save & Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REASSIGN DRIVER / VEHICLE MODAL */}
      {reassigningTrip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Reassign Trip Dispatch</h3>
                  <p className="text-[11px] text-slate-500">{reassigningTrip.tripNumber} ➔ {reassigningTrip.destination}</p>
                </div>
              </div>
              <button 
                onClick={() => setReassigningTrip(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {reassigningTrip.declineReason && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                  <strong>Previous Driver Decline Reason:</strong> {reassigningTrip.declineReason}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Assign New Driver *
                </label>
                <select
                  value={newDriverId}
                  onChange={(e) => setNewDriverId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium"
                >
                  {drivers.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.status}) • {d.licenceType}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Vehicle *
                </label>
                <select
                  value={newVehicleId}
                  onChange={(e) => setNewVehicleId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white font-medium"
                >
                  {vehicles.map(v => (
                    <option key={v.id} value={v.id}>
                      {v.number} — {v.make} {v.model} ({v.currentStatus})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setReassigningTrip(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReassign}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs"
              >
                Confirm Reassignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

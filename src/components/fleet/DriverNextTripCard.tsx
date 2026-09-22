import React, { useState } from 'react';
import { 
  MapPin, Clock, Gauge, CarFront, CheckCircle2, Play, 
  XCircle, AlertTriangle, ArrowRight, ShieldCheck, 
  Sparkles, RefreshCw, UserCheck, Calendar, PhoneCall, Info
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { useAuth } from '../../context/AuthContext';
import { Trip, Vehicle, Driver } from '../../types/fleet';
import { cn } from '../../lib/utils';

interface DriverNextTripCardProps {
  /** Optional specific driverId to view. Defaults to matching logged-in user or active selected driver */
  driverId?: string;
  /** Whether to allow switching the driver in manager view */
  allowDriverSwitch?: boolean;
}

export const DriverNextTripCard: React.FC<DriverNextTripCardProps> = ({ 
  driverId: explicitDriverId,
  allowDriverSwitch = true 
}) => {
  const { userProfile, user } = useAuth();
  const { 
    trips, 
    vehicles, 
    drivers, 
    role,
    startTrip, 
    completeTrip, 
    acceptTrip, 
    declineTrip,
    setSelectedVehicleId,
    openQuickModal
  } = useFleet();

  // Resolve matching driver:
  // 1. Explicit prop
  // 2. Matching employeeId or email or displayName in drivers collection
  // 3. Fallback to first active driver
  const defaultDriverId = React.useMemo(() => {
    if (explicitDriverId) return explicitDriverId;
    
    // Attempt match with auth profile
    if (userProfile?.employeeId) {
      const match = drivers.find(d => d.employeeId === userProfile.employeeId);
      if (match) return match.id;
    }
    if (user?.email) {
      const match = drivers.find(d => d.email?.toLowerCase() === user.email?.toLowerCase());
      if (match) return match.id;
    }
    if (userProfile?.displayName) {
      const match = drivers.find(d => d.name.toLowerCase() === userProfile.displayName.toLowerCase());
      if (match) return match.id;
    }
    return drivers[0]?.id || '';
  }, [explicitDriverId, userProfile, user, drivers]);

  const [activeDriverId, setActiveDriverId] = useState<string>(defaultDriverId);

  React.useEffect(() => {
    if (defaultDriverId && !activeDriverId) {
      setActiveDriverId(defaultDriverId);
    }
  }, [defaultDriverId]);

  const activeDriver = drivers.find(d => d.id === activeDriverId) || drivers[0];

  // Modals / Confirmation State
  const [showStartConfirm, setShowStartConfirm] = useState(false);
  const [odometerInput, setOdometerInput] = useState<number>(0);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [finalOdometerInput, setFinalOdometerInput] = useState<number>(0);
  const [actionError, setActionError] = useState<string | null>(null);

  // Find the driver's current or next assigned trip
  // 1. Any trip currently "In Progress"
  // 2. Next trip "Accepted" or "Assigned" or "Planned"
  const currentActiveTrip = trips.find(
    t => t.driverId === activeDriver?.id && 
         (t.status === 'In Progress' || (t.status as string) === 'IN_PROGRESS')
  );

  const nextAssignedTrip = trips.find(
    t => t.driverId === activeDriver?.id && 
         ['Assigned', 'Accepted', 'Planned'].includes(t.status)
  );

  // Target trip to display: Active trip takes priority, otherwise next assigned
  const displayedTrip: Trip | undefined = currentActiveTrip || nextAssignedTrip;
  const assignedVehicle: Vehicle | undefined = displayedTrip 
    ? vehicles.find(v => v.id === displayedTrip.vehicleId) 
    : (activeDriver?.assignedVehicleId ? vehicles.find(v => v.id === activeDriver.assignedVehicleId) : undefined);

  // Odometer confirmation handler
  const handleOpenStartModal = (trip: Trip) => {
    const veh = vehicles.find(v => v.id === trip.vehicleId);
    const baseline = veh?.currentOdometer || trip.startOdometer || 0;
    setOdometerInput(baseline);
    setActionError(null);
    setShowStartConfirm(true);
  };

  const handleConfirmStart = () => {
    if (!displayedTrip) return;
    if (odometerInput < 0) {
      setActionError('Please enter a valid non-negative starting odometer reading.');
      return;
    }
    startTrip(displayedTrip.id, odometerInput);
    setShowStartConfirm(false);
  };

  const handleOpenCompleteModal = (trip: Trip) => {
    const veh = vehicles.find(v => v.id === trip.vehicleId);
    const baseline = Math.max(veh?.currentOdometer || 0, trip.startOdometer) + 20;
    setFinalOdometerInput(baseline);
    setActionError(null);
    setShowCompleteModal(true);
  };

  const handleConfirmComplete = () => {
    if (!displayedTrip) return;
    if (finalOdometerInput < displayedTrip.startOdometer) {
      setActionError(`Final odometer cannot be less than starting odometer (${displayedTrip.startOdometer.toLocaleString()} KM).`);
      return;
    }
    completeTrip(displayedTrip.id, finalOdometerInput);
    setShowCompleteModal(false);
  };

  const handleConfirmDecline = () => {
    if (!displayedTrip) return;
    if (!declineReason.trim()) {
      setActionError('Please provide a brief reason for declining this trip.');
      return;
    }
    declineTrip(displayedTrip.id, declineReason.trim());
    setShowDeclineModal(false);
    setDeclineReason('');
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all">
      {/* Header bar */}
      <div className="bg-slate-900 text-white px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <CarFront className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Driver Portal</span>
              <span className="text-slate-500">•</span>
              <h3 className="text-sm font-bold text-white">NEXT TRIP</h3>
            </div>
            <p className="text-[11px] text-slate-300">Driver cockpit & live mission assignment dispatch</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Plan for next trip and assign button */}
          <button
            onClick={() => openQuickModal('newTrip', { driverId: activeDriver?.id, vehicleId: activeDriver?.assignedVehicleId, status: 'Assigned' })}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-2xs transition-colors shrink-0"
            title="Plan new trip and assign to driver and vehicle"
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>New Trip</span>
          </button>

          {/* Driver Selector for Manager testing / Multiple drivers */}
          {allowDriverSwitch && drivers.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-800/90 border border-slate-700/80 rounded-lg px-2.5 py-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="text-[11px] text-slate-400 hidden md:inline">Viewing as:</span>
              <select
                value={activeDriverId}
                onChange={(e) => setActiveDriverId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-hidden cursor-pointer"
              >
                {drivers.map(d => (
                  <option key={d.id} value={d.id} className="bg-slate-900 text-white">
                    {d.name} ({d.department})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5">
        {displayedTrip ? (
          <div className="space-y-5">
            {/* Status & Timing Banner */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                  {displayedTrip.tripNumber}
                </span>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5",
                  displayedTrip.status === 'In Progress' 
                    ? "bg-blue-100 text-blue-700 border border-blue-200 animate-pulse" 
                    : displayedTrip.status === 'Accepted'
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : displayedTrip.status === 'Assigned'
                    ? "bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-slate-100 text-slate-700"
                )}>
                  {displayedTrip.status === 'In Progress' && <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />}
                  {displayedTrip.status}
                </span>
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">
                  {displayedTrip.tripType}
                </span>
              </div>

              {/* Scheduled Date & Departure Time */}
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{displayedTrip.tripDate}</span>
                </div>
                <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>{displayedTrip.startTime || '08:30 AM'}</span>
                </div>
              </div>
            </div>

            {/* Route & Destination Highlight Card */}
            <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 border border-blue-100/80 rounded-xl p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Route visualization */}
                <div className="flex-1 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block">
                    Assigned Route & Destination
                  </span>
                  
                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                    {/* Origin */}
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-100 shrink-0" />
                      <div>
                        <span className="text-[11px] text-slate-400 font-medium block">Starting Point</span>
                        <span className="text-sm font-bold text-slate-900">{displayedTrip.startLocation}</span>
                      </div>
                    </div>

                    <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-1 hidden sm:inline" />

                    {/* Destination */}
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                        <MapPin className="w-3.5 h-3.5 text-rose-600" />
                      </div>
                      <div>
                        <span className="text-[11px] text-rose-600 font-bold block uppercase tracking-wider">Target Destination</span>
                        <span className="text-base font-extrabold text-slate-900">{displayedTrip.destination}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Purpose and Load Pill */}
                <div className="md:text-right border-t md:border-t-0 md:border-l border-slate-200/80 pt-3 md:pt-0 md:pl-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Purpose
                  </span>
                  <p className="text-xs font-semibold text-slate-900 mt-0.5 max-w-xs">
                    {displayedTrip.tripPurpose}
                  </p>
                  {displayedTrip.customerDepartment && (
                    <span className="inline-block mt-1 text-[11px] font-medium text-slate-500 bg-white/80 px-2 py-0.5 rounded border border-slate-200">
                      Dept: {displayedTrip.customerDepartment}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Vehicle & Odometer Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle Assigned Card */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <CarFront className="w-3.5 h-3.5 text-blue-600" />
                    Vehicle Assigned
                  </span>
                  {assignedVehicle && (
                    <button
                      onClick={() => setSelectedVehicleId(assignedVehicle.id)}
                      className="text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      View Specs
                    </button>
                  )}
                </div>

                {assignedVehicle ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-extrabold text-slate-900 font-mono tracking-tight">
                        {assignedVehicle.number}
                      </span>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        assignedVehicle.currentStatus === 'In Trip' ? 'bg-blue-100 text-blue-700' :
                        assignedVehicle.currentStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-slate-100 text-slate-700'
                      )}>
                        {assignedVehicle.currentStatus}
                      </span>
                    </div>
                    <div className="text-xs text-slate-700 font-medium">
                      {assignedVehicle.make} {assignedVehicle.model} {assignedVehicle.variant ? `(${assignedVehicle.variant})` : ''} • {assignedVehicle.type}
                    </div>
                    <div className="flex items-center gap-2 pt-1 text-[11px] text-slate-500">
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                        Fuel: {assignedVehicle.fuelType}
                      </span>
                      <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-medium">
                        Mileage: {assignedVehicle.expectedMileage} km/l
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-600 font-medium py-2">
                    <div className="font-bold text-slate-900 font-mono">{displayedTrip.vehicleNumber}</div>
                    <div className="text-slate-400 text-[11px]">Vehicle record linked</div>
                  </div>
                )}
              </div>

              {/* Start Odometer & Distance Card */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Gauge className="w-3.5 h-3.5 text-indigo-600" />
                      Start Odometer Reading
                    </span>
                    <span className="text-[11px] text-slate-400">Physical Dashboard Log</span>
                  </div>

                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-2xl font-black font-mono text-slate-900 tracking-tight">
                      {(displayedTrip.startOdometer || assignedVehicle?.currentOdometer || 0).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-500 uppercase">KM</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">Estimated Journey:</span>
                  <span className="font-bold text-slate-900">
                    {displayedTrip.distance > 0 ? `${displayedTrip.distance} KM` : 'Calculated on completion'}
                  </span>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS & WORKFLOW CONTROLS */}
            <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-500 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-blue-500 shrink-0" />
                <span>
                  {displayedTrip.status === 'In Progress' 
                    ? 'Trip is currently active. Record final odometer to complete.' 
                    : displayedTrip.status === 'Assigned'
                    ? 'Review assignment details, confirm odometer, and start trip.'
                    : 'Ready to depart. Click START TRIP to begin logging.'}
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                {/* Secondary: Decline trip if assigned and not yet in progress */}
                {displayedTrip.status === 'Assigned' && (
                  <button
                    onClick={() => {
                      setActionError(null);
                      setShowDeclineModal(true);
                    }}
                    className="px-3.5 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-200"
                  >
                    Decline Assignment
                  </button>
                )}

                {/* Primary Button: START TRIP */}
                {(displayedTrip.status === 'Assigned' || displayedTrip.status === 'Accepted' || displayedTrip.status === 'Planned') && (
                  <button
                    onClick={() => handleOpenStartModal(displayedTrip)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>START TRIP</span>
                  </button>
                )}

                {/* In Progress Action: COMPLETE TRIP */}
                {displayedTrip.status === 'In Progress' && (
                  <button
                    onClick={() => handleOpenCompleteModal(displayedTrip)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:shadow-md"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>COMPLETE TRIP</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* EDGE CASE: NO UPCOMING TRIPS ASSIGNED */
          <div className="py-10 px-4 text-center max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">No Assigned Journeys</h4>
              {/* EXACT PROMPT MANDATED COPY */}
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed font-medium">
                No upcoming trips assigned. Check back later or contact your fleet manager.
              </p>
            </div>

            {/* Quick Helper Badge & Plan Trip Button */}
            <div className="pt-3 flex flex-col items-center gap-3">
              <button
                onClick={() => openQuickModal('newTrip', { driverId: activeDriver?.id, vehicleId: activeDriver?.assignedVehicleId, status: 'Assigned' })}
                className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                title="Plan new trip and assign to driver and vehicle"
              >
                <MapPin className="w-4 h-4" />
                <span>New Trip</span>
              </button>

              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Driver Status: <strong>{activeDriver?.status || 'Active'}</strong></span>
                {activeDriver?.assignedVehicleNumber && (
                  <>
                    <span className="text-slate-300">•</span>
                    <span>Assigned Vehicle: <strong>{activeDriver.assignedVehicleNumber}</strong></span>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* START TRIP CONFIRMATION MODAL */}
      {showStartConfirm && displayedTrip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Play className="w-5 h-5 fill-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Confirm Departure & Odometer</h3>
                  <p className="text-[11px] text-slate-500">{displayedTrip.tripNumber} ➔ {displayedTrip.destination}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowStartConfirm(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Please verify the vehicle's actual dashboard odometer before starting your journey. This ensures accurate distance tracking and fuel mileage calculations.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Confirm Starting Odometer (KM) *
                </label>
                <div className="relative">
                  <Gauge className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    value={odometerInput || ''}
                    onChange={(e) => {
                      setOdometerInput(Number(e.target.value));
                      setActionError(null);
                    }}
                    className="w-full pl-9 pr-4 py-2.5 text-base font-bold font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    placeholder="Enter current KM reading"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Vehicle base odometer: {(assignedVehicle?.currentOdometer || displayedTrip.startOdometer || 0).toLocaleString()} KM
                </p>
              </div>

              {actionError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  Starting this trip will set the trip status to <strong>IN_PROGRESS</strong> and update the vehicle status to <strong>In Trip</strong> across the live fleet system.
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowStartConfirm(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmStart}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-white" /> Confirm & Start Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETE TRIP MODAL */}
      {showCompleteModal && displayedTrip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Complete Journey Log</h3>
                  <p className="text-[11px] text-slate-500">Destination: {displayedTrip.destination}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCompleteModal(false)}
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
                    {displayedTrip.startOdometer.toLocaleString()} KM
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Net Distance:</span>
                  <span className="font-bold text-emerald-600 font-mono text-sm">
                    {Math.max(0, finalOdometerInput - displayedTrip.startOdometer)} KM
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Final Dashboard Odometer (KM) *
                </label>
                <input
                  type="number"
                  value={finalOdometerInput || ''}
                  onChange={(e) => {
                    setFinalOdometerInput(Number(e.target.value));
                    setActionError(null);
                  }}
                  className="w-full px-3 py-2.5 text-base font-bold font-mono border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  placeholder="Enter final KM reading"
                />
              </div>

              {actionError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowCompleteModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmComplete}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Submit & Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DECLINE ASSIGNMENT MODAL */}
      {showDeclineModal && displayedTrip && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Decline Trip Assignment</h3>
                  <p className="text-[11px] text-slate-500">{displayedTrip.tripNumber} ({displayedTrip.destination})</p>
                </div>
              </div>
              <button 
                onClick={() => setShowDeclineModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-600">
                Declining this assignment will alert the fleet dispatcher so the journey can be reassigned to another driver.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1.5">
                  Reason for Declining *
                </label>
                <textarea
                  rows={3}
                  value={declineReason}
                  onChange={(e) => {
                    setDeclineReason(e.target.value);
                    setActionError(null);
                  }}
                  placeholder="e.g. Schedule collision, vehicle maintenance issue, personal leave, or uncertified license class..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>

              {actionError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs font-medium text-rose-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>{actionError}</span>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Keep Assignment
              </button>
              <button
                onClick={handleConfirmDecline}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors shadow-xs"
              >
                Decline & Request Reassignment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

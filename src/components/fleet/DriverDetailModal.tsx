import React from 'react';
import { X, User, CarFront, MapPin, Fuel, ShieldCheck, AlertTriangle, Phone, Mail, Award } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { cn } from '../../lib/utils';

export const DriverDetailModal: React.FC = () => {
  const { 
    drivers, vehicles, trips, selectedDriverId, 
    setSelectedDriverId, setSelectedVehicleId, openQuickModal 
  } = useFleet();

  if (!selectedDriverId) return null;
  const driver = drivers.find(d => d.id === selectedDriverId);
  if (!driver) return null;

  const assignedVehicle = vehicles.find(v => v.id === driver.assignedVehicleId || v.number === driver.assignedVehicleNumber);
  const driverTrips = trips.filter(t => t.driverId === driver.id || t.driverName === driver.name);

  // License expiry check
  const isLicenseExpiring = () => {
    if (!driver.licenceExpiry) return false;
    const now = new Date('2026-08-30');
    const expiry = new Date(driver.licenceExpiry);
    const diff = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff < 60;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 bg-slate-900 text-white flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 text-xl font-bold">
              {driver.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">{driver.name}</h2>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase",
                  driver.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  driver.status === 'On Leave' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-slate-700 text-slate-300'
                )}>
                  {driver.status}
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-0.5">
                {driver.employeeId ? `Employee ${driver.employeeId} • ` : ''}{driver.department}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setSelectedDriverId(null)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Trips</span>
              <span className="text-xl font-bold text-slate-900">{driver.totalTrips || driverTrips.length}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Total Distance</span>
              <span className="text-xl font-bold text-slate-900">{(driver.totalKm || 0).toLocaleString()} KM</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Licence Type</span>
              <span className="text-xl font-bold text-blue-600">{driver.licenceType}</span>
            </div>
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <span className="text-xs text-slate-500 block">Safety Score</span>
              <span className="text-xl font-bold text-emerald-600">98 / 100</span>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Licence & Compliance</h3>
              <div className="space-y-2.5 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Licence Number</span>
                  <span className="font-mono font-semibold text-slate-900">{driver.licenceNumber}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Licence Expiry</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">{driver.licenceExpiry}</span>
                    {isLicenseExpiring() ? (
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-700 text-xs font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Expiring Soon
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Join Date</span>
                  <span className="font-medium text-slate-900">{driver.joinDate}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Contact & Assigned Vehicle</h3>
              <div className="space-y-2.5 text-sm">
                <div>
                  <span className="text-xs text-slate-500 block">Mobile Phone</span>
                  <span className="font-medium text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {driver.mobile}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Emergency Contact</span>
                  <span className="font-medium text-slate-900">{driver.emergencyContact}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Assigned Vehicle</span>
                  {assignedVehicle ? (
                    <button 
                      onClick={() => {
                        setSelectedDriverId(null);
                        setSelectedVehicleId(assignedVehicle.id);
                      }}
                      className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 mt-0.5"
                    >
                      <CarFront className="w-4 h-4" /> {assignedVehicle.number} ({assignedVehicle.name})
                    </button>
                  ) : (
                    <span className="text-slate-400">Pool Driver (Unassigned)</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Trips */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Driver Trip History</h3>
            {driverTrips.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs">
                No recent trips recorded for this driver.
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Vehicle</th>
                      <th className="px-3 py-2">Route</th>
                      <th className="px-3 py-2 text-right">Distance</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {driverTrips.map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2 font-medium text-slate-900">{t.tripDate}</td>
                        <td className="px-3 py-2 font-semibold text-slate-900">{t.vehicleNumber}</td>
                        <td className="px-3 py-2">{t.startLocation} ➔ {t.destination}</td>
                        <td className="px-3 py-2 text-right font-bold">{t.distance} KM</td>
                        <td className="px-3 py-2">
                          <span className={cn(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                            t.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                            t.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-slate-100 text-slate-700'
                          )}>{t.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

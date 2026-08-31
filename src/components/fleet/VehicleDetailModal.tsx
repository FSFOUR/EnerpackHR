import React, { useState } from 'react';
import { 
  X, CarFront, Fuel, MapPin, Wrench, Receipt, FileText, 
  Activity, AlertOctagon, Calendar, CheckCircle2, AlertTriangle, 
  Clock, ShieldAlert, Plus, Edit2, Download, UserCheck
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { cn } from '../../lib/utils';

export const VehicleDetailModal: React.FC = () => {
  const { 
    vehicles, drivers, trips, fuelEntries, expenses, 
    maintenanceRecords, documents, activities, incidents,
    selectedVehicleId, setSelectedVehicleId, openQuickModal,
    getDocumentExpiryStatus
  } = useFleet();

  const [activeTab, setActiveTab] = useState<'overview' | 'fuel' | 'expenses' | 'trips' | 'maintenance' | 'documents' | 'activities' | 'incidents' | 'timeline'>('overview');

  if (!selectedVehicleId) return null;
  const vehicle = vehicles.find(v => v.id === selectedVehicleId);
  if (!vehicle) return null;

  // Filter records for this vehicle
  const vehicleFuel = fuelEntries.filter(f => f.vehicleId === vehicle.id);
  const vehicleExpenses = expenses.filter(e => e.vehicleId === vehicle.id);
  const vehicleTrips = trips.filter(t => t.vehicleId === vehicle.id);
  const vehicleMaintenance = maintenanceRecords.filter(m => m.vehicleId === vehicle.id);
  const vehicleDocs = documents.filter(d => d.vehicleId === vehicle.id);
  const vehicleActivities = activities.filter(a => a.vehicleId === vehicle.id);
  const vehicleIncidents = incidents.filter(i => i.vehicleId === vehicle.id);

  // Computed totals
  const totalFuelCost = vehicleFuel.reduce((sum, f) => sum + f.totalAmount, 0);
  const totalFuelLitres = vehicleFuel.reduce((sum, f) => sum + f.quantity, 0);
  const totalExpenseCost = vehicleExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalMaintenanceCost = vehicleMaintenance.reduce((sum, m) => sum + m.totalCost, 0);
  const totalDistance = vehicle.currentOdometer - vehicle.initialOdometer;
  const grandTotalCost = totalFuelCost + totalExpenseCost + totalMaintenanceCost;
  const overallCostPerKm = totalDistance > 0 ? (grandTotalCost / totalDistance).toFixed(2) : '0.00';

  const insuranceStatus = getDocumentExpiryStatus(vehicle.insuranceExpiry);
  const pucStatus = getDocumentExpiryStatus(vehicle.pucExpiry);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <CarFront className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold tracking-tight">{vehicle.number}</h2>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider",
                  vehicle.currentStatus === 'Active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                  vehicle.currentStatus === 'In Trip' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                  vehicle.currentStatus === 'Maintenance' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                  'bg-slate-700 text-slate-300'
                )}>
                  {vehicle.currentStatus}
                </span>
              </div>
              <p className="text-slate-300 text-sm mt-0.5">{vehicle.name} • {vehicle.category} • {vehicle.fuelType}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => openQuickModal('editVehicle', vehicle)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Edit Vehicle Details"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setSelectedVehicleId(null)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick KPI Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-px bg-slate-200 border-b border-slate-200 shrink-0">
          <div className="bg-slate-50 p-3 flex flex-col">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Odometer</span>
            <span className="text-base font-bold text-slate-900">{vehicle.currentOdometer.toLocaleString()} KM</span>
          </div>
          <div className="bg-slate-50 p-3 flex flex-col">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Primary Driver</span>
            <span className="text-base font-bold text-slate-900 truncate">{vehicle.primaryDriverName || 'Unassigned'}</span>
          </div>
          <div className="bg-slate-50 p-3 flex flex-col">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Expected Mileage</span>
            <span className="text-base font-bold text-slate-900">{vehicle.expectedMileage} KM/L</span>
          </div>
          <div className="bg-slate-50 p-3 flex flex-col">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Fuel</span>
            <span className="text-base font-bold text-slate-900">₹{totalFuelCost.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 p-3 flex flex-col">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Spend</span>
            <span className="text-base font-bold text-slate-900">₹{grandTotalCost.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 p-3 flex flex-col">
            <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Cost / KM</span>
            <span className="text-base font-bold text-blue-600">₹{overallCostPerKm}</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-slate-200 px-6 overflow-x-auto shrink-0">
          <div className="flex gap-6 min-w-max">
            {[
              { id: 'overview', label: 'Overview', icon: CarFront },
              { id: 'fuel', label: `Fuel (${vehicleFuel.length})`, icon: Fuel },
              { id: 'expenses', label: `Expenses (${vehicleExpenses.length})`, icon: Receipt },
              { id: 'trips', label: `Trips (${vehicleTrips.length})`, icon: MapPin },
              { id: 'maintenance', label: `Maintenance (${vehicleMaintenance.length})`, icon: Wrench },
              { id: 'documents', label: `Documents (${vehicleDocs.length})`, icon: FileText },
              { id: 'activities', label: 'Activities', icon: Activity },
              { id: 'incidents', label: `Incidents (${vehicleIncidents.length})`, icon: AlertOctagon },
              { id: 'timeline', label: 'Timeline', icon: Clock }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "py-3 text-sm font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap",
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
                )}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Alert Ribbons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={cn(
                  "p-4 rounded-xl border flex items-start gap-3",
                  insuranceStatus === 'Expired' ? "bg-red-50 border-red-200 text-red-900" :
                  insuranceStatus === 'Expiring Soon' ? "bg-amber-50 border-amber-200 text-amber-900" :
                  "bg-emerald-50 border-emerald-200 text-emerald-900"
                )}>
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Insurance Status</h4>
                    <p className="text-xs mt-0.5">
                      Expiry Date: <span className="font-semibold">{vehicle.insuranceExpiry || 'Not Registered'}</span>
                      {insuranceStatus === 'Expired' && ' ⚠️ Policy Expired! Action required immediately.'}
                      {insuranceStatus === 'Expiring Soon' && ' ⚠️ Expiring soon. Initiate renewal process.'}
                      {insuranceStatus === 'Valid' && ' ✓ Valid and active.'}
                    </p>
                  </div>
                </div>

                <div className={cn(
                  "p-4 rounded-xl border flex items-start gap-3",
                  vehicle.nextServiceOdometer && vehicle.currentOdometer >= vehicle.nextServiceOdometer ? "bg-red-50 border-red-200 text-red-900" :
                  "bg-blue-50 border-blue-200 text-blue-900"
                )}>
                  <Wrench className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Service Milestone</h4>
                    <p className="text-xs mt-0.5">
                      Next Service: <span className="font-semibold">{vehicle.nextServiceOdometer ? `${vehicle.nextServiceOdometer.toLocaleString()} KM` : 'N/A'}</span>
                      {vehicle.nextServiceDate && ` (${vehicle.nextServiceDate})`}
                    </p>
                  </div>
                </div>
              </div>

              {/* Specs and Ownership Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Vehicle Specifications</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 block">Make & Model</span>
                      <span className="font-medium text-slate-900">{vehicle.make} {vehicle.model}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Variant</span>
                      <span className="font-medium text-slate-900">{vehicle.variant || 'Standard'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Year of Mfg</span>
                      <span className="font-medium text-slate-900">{vehicle.manufacturingYear}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Tank Capacity</span>
                      <span className="font-medium text-slate-900">{vehicle.tankCapacity} Litres</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Purchase Date</span>
                      <span className="font-medium text-slate-900">{vehicle.purchaseDate}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Purchase Price</span>
                      <span className="font-medium text-slate-900">₹{vehicle.purchasePrice.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">Assignment & Ownership</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 block">Ownership</span>
                      <span className="font-medium text-slate-900">{vehicle.ownership}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Assigned Driver</span>
                      <span className="font-medium text-slate-900">{vehicle.primaryDriverName || 'None'}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Department</span>
                      <span className="font-medium text-slate-900">{vehicle.department}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Manager</span>
                      <span className="font-medium text-slate-900">{vehicle.responsibleManager}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-slate-500 block">Parking / Base Location</span>
                      <span className="font-medium text-slate-900">{vehicle.location}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-2">
                <button 
                  onClick={() => openQuickModal('addFuel', { vehicleId: vehicle.id, vehicleNumber: vehicle.number })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Fuel className="w-4 h-4" /> Add Fuel
                </button>
                <button 
                  onClick={() => openQuickModal('newTrip', { vehicleId: vehicle.id, vehicleNumber: vehicle.number, startOdometer: vehicle.currentOdometer })}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-xs"
                >
                  <MapPin className="w-4 h-4" /> New Trip
                </button>
                <button 
                  onClick={() => openQuickModal('scheduleService', { vehicleId: vehicle.id, vehicleNumber: vehicle.number, odometer: vehicle.currentOdometer })}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Wrench className="w-4 h-4" /> Record Service
                </button>
                <button 
                  onClick={() => openQuickModal('addExpense', { vehicleId: vehicle.id, vehicleNumber: vehicle.number })}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs"
                >
                  <Receipt className="w-4 h-4" /> Add Expense
                </button>
                <button 
                  onClick={() => openQuickModal('uploadDocument', { vehicleId: vehicle.id, vehicleNumber: vehicle.number })}
                  className="px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-xs"
                >
                  <FileText className="w-4 h-4" /> Upload Document
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: FUEL */}
          {activeTab === 'fuel' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Fuel Refill History</h3>
                <button 
                  onClick={() => openQuickModal('addFuel', { vehicleId: vehicle.id, vehicleNumber: vehicle.number })}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Fuel Entry
                </button>
              </div>
              {vehicleFuel.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
                  No fuel entries recorded for this vehicle yet.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Date & Time</th>
                        <th className="px-4 py-2.5">Fuel Station</th>
                        <th className="px-4 py-2.5 text-right">Odometer</th>
                        <th className="px-4 py-2.5 text-right">Quantity</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                        <th className="px-4 py-2.5 text-right">Mileage</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vehicleFuel.map(f => (
                        <tr key={f.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-medium text-slate-900">{f.date} <span className="text-xs text-slate-400">{f.time}</span></td>
                          <td className="px-4 py-2.5 text-xs">{f.fuelStation}</td>
                          <td className="px-4 py-2.5 text-right font-medium">{f.odometer.toLocaleString()} KM</td>
                          <td className="px-4 py-2.5 text-right">{f.quantity} L</td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">₹{f.totalAmount.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right font-semibold text-emerald-600">
                            {f.calculatedMileage ? `${f.calculatedMileage} km/l` : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: EXPENSES */}
          {activeTab === 'expenses' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Expense Log</h3>
                <button 
                  onClick={() => openQuickModal('addExpense', { vehicleId: vehicle.id, vehicleNumber: vehicle.number })}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Expense
                </button>
              </div>
              {vehicleExpenses.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
                  No expenses recorded for this vehicle yet.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5">Category</th>
                        <th className="px-4 py-2.5">Description & Vendor</th>
                        <th className="px-4 py-2.5 text-right">Amount</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vehicleExpenses.map(e => (
                        <tr key={e.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-medium text-slate-900">{e.date}</td>
                          <td className="px-4 py-2.5 font-medium text-blue-700 text-xs">{e.category}</td>
                          <td className="px-4 py-2.5">
                            <div className="text-slate-900 text-xs font-medium">{e.description}</div>
                            <div className="text-[11px] text-slate-400">{e.vendor}</div>
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">₹{e.amount.toLocaleString()}</td>
                          <td className="px-4 py-2.5">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[11px] font-bold uppercase",
                              e.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                              e.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                              e.status === 'Pending Approval' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-700'
                            )}>{e.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: TRIPS */}
          {activeTab === 'trips' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Trip Logs</h3>
                <button 
                  onClick={() => openQuickModal('newTrip', { vehicleId: vehicle.id, vehicleNumber: vehicle.number, startOdometer: vehicle.currentOdometer })}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> New Trip
                </button>
              </div>
              {vehicleTrips.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
                  No trips logged for this vehicle yet.
                </div>
              ) : (
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-500 font-semibold text-xs border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Date</th>
                        <th className="px-4 py-2.5">Driver & Purpose</th>
                        <th className="px-4 py-2.5">Route</th>
                        <th className="px-4 py-2.5 text-right">Distance</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {vehicleTrips.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50">
                          <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">{t.tripDate}</td>
                          <td className="px-4 py-2.5">
                            <div className="font-medium text-slate-900 text-xs">{t.driverName}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-xs">{t.tripPurpose}</div>
                          </td>
                          <td className="px-4 py-2.5 text-xs text-slate-700">
                            {t.startLocation} ➔ {t.destination}
                          </td>
                          <td className="px-4 py-2.5 text-right font-bold text-slate-900">{t.distance} KM</td>
                          <td className="px-4 py-2.5">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[11px] font-bold uppercase",
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
          )}

          {/* TAB 5: MAINTENANCE */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Service & Repair History</h3>
                <button 
                  onClick={() => openQuickModal('scheduleService', { vehicleId: vehicle.id, vehicleNumber: vehicle.number, odometer: vehicle.currentOdometer })}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Record Service
                </button>
              </div>
              {vehicleMaintenance.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
                  No service records logged yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicleMaintenance.map(m => (
                    <div key={m.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">{m.title}</span>
                          <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold">{m.serviceType}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Date: {m.date} | Odometer: {m.odometer.toLocaleString()} KM | Workshop: {m.workshop}
                        </p>
                        {m.notes && <p className="text-xs text-slate-600 mt-1 bg-white p-2 rounded border border-slate-200">{m.notes}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-base font-bold text-slate-900">₹{m.totalCost.toLocaleString()}</div>
                        <span className={cn(
                          "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase mt-1",
                          m.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                          m.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        )}>{m.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Vehicle Compliance Documents</h3>
                <button 
                  onClick={() => openQuickModal('uploadDocument', { vehicleId: vehicle.id, vehicleNumber: vehicle.number })}
                  className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Upload Document
                </button>
              </div>
              {vehicleDocs.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-sm">
                  No documents uploaded for this vehicle.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {vehicleDocs.map(d => {
                    const st = getDocumentExpiryStatus(d.expiryDate);
                    return (
                      <div key={d.id} className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold text-slate-900 text-sm">{d.documentType}</span>
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              st === 'Expired' ? 'bg-red-100 text-red-700' :
                              st === 'Expiring Soon' ? 'bg-amber-100 text-amber-700' :
                              'bg-emerald-100 text-emerald-700'
                            )}>{st}</span>
                          </div>
                          <p className="text-xs text-slate-600 font-mono mt-1">Doc #: {d.documentNumber}</p>
                          <p className="text-xs text-slate-500 mt-1">Issuing Authority: {d.issuingAuthority}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Expires: <span className="font-semibold text-slate-800">{d.expiryDate}</span></p>
                        </div>
                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                          <span className="text-[11px] text-slate-400">{d.fileName || 'document.pdf'}</span>
                          <button 
                            onClick={() => alert(`Downloading verified copy of ${d.documentType} (${d.documentNumber})`)}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: ACTIVITIES */}
          {activeTab === 'activities' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Vehicle Log Activity Stream</h3>
              <div className="border-l-2 border-slate-200 pl-4 space-y-4 ml-2">
                {vehicleActivities.map(a => (
                  <div key={a.id} className="relative">
                    <div className="absolute -left-[23px] top-1 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-slate-100"></div>
                    <div className="text-xs text-slate-400 font-medium">{a.date} • {a.time}</div>
                    <h4 className="font-bold text-slate-900 text-sm mt-0.5">{a.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5">{a.description}</p>
                    <span className="text-[11px] text-slate-400 mt-1 block">Logged by: {a.user}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: INCIDENTS */}
          {activeTab === 'incidents' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 text-base">Accidents & Breakdowns</h3>
                <button 
                  onClick={() => openQuickModal('reportIncident', { vehicleId: vehicle.id, vehicleNumber: vehicle.number })}
                  className="px-3 py-1.5 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Report Incident
                </button>
              </div>
              {vehicleIncidents.length === 0 ? (
                <div className="p-8 text-center bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-medium">
                  ✓ Clean record! No accidents or incidents reported for this vehicle.
                </div>
              ) : (
                <div className="space-y-3">
                  {vehicleIncidents.map(inc => (
                    <div key={inc.id} className="p-4 bg-red-50/50 border border-red-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-900 text-sm">{inc.incidentType} — {inc.date}</span>
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-bold uppercase">{inc.status}</span>
                      </div>
                      <p className="text-xs text-slate-700">{inc.description}</p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs text-slate-600 pt-2 border-t border-red-100">
                        <div><span className="text-slate-400">Location:</span> {inc.location}</div>
                        <div><span className="text-slate-400">Damage:</span> {inc.propertyDamage}</div>
                        <div><span className="text-slate-400">Claim:</span> {inc.insuranceClaimStatus}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 9: TIMELINE */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 text-base">Chronological Vehicle Timeline</h3>
              <p className="text-xs text-slate-500">Every fuel refill, service, trip, inspection, and expense in order.</p>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">2026</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Current Active Fleet Service</div>
                    <div className="text-[11px] text-slate-500">Odometer: {vehicle.currentOdometer.toLocaleString()} KM | Driver: {vehicle.primaryDriverName}</div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">MNT</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Last Major Service Logged</div>
                    <div className="text-[11px] text-slate-500">{vehicle.lastServiceDate || 'N/A'} at {vehicle.lastServiceOdometer?.toLocaleString() || 0} KM</div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold">BUY</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Vehicle Purchased & Commissioned</div>
                    <div className="text-[11px] text-slate-500">{vehicle.purchaseDate} for ₹{vehicle.purchasePrice.toLocaleString()} | Initial Odo: {vehicle.initialOdometer} KM</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  Plus, Search, Filter, MoreVertical, CarFront, Fuel, 
  MapPin, Wrench, LayoutGrid, List, Download, Edit2, 
  Trash2, Receipt, FileText, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { VehicleStatus, VehicleType } from '../../types/fleet';
import { cn } from '../../lib/utils';

export const Vehicles: React.FC = () => {
  const { 
    vehicles, setSelectedVehicleId, openQuickModal, 
    deleteVehicle, getDocumentExpiryStatus 
  } = useFleet();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    const matchesSearch = 
      v.number.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      (v.primaryDriverName && v.primaryDriverName.toLowerCase().includes(search.toLowerCase())) ||
      v.department.toLowerCase().includes(search.toLowerCase()) ||
      v.category.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || v.currentStatus === selectedStatus;
    const matchesType = selectedType === 'All' || v.type === selectedType;

    return matchesSearch && matchesStatus && matchesType;
  });

  const exportCSV = () => {
    const headers = ['Vehicle Number,Name,Type,Category,Make,Model,Fuel Type,Odometer (KM),Status,Assigned Driver,Department,Location'];
    const rows = filteredVehicles.map(v => 
      `"${v.number}","${v.name}","${v.type}","${v.category}","${v.make}","${v.model}","${v.fuelType}",${v.currentOdometer},"${v.currentStatus}","${v.primaryDriverName || 'Unassigned'}","${v.department}","${v.location}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enerpack_Fleet_Vehicles_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statusList = ['All', 'Active', 'In Trip', 'Available', 'Maintenance', 'Inactive'];
  const typeList = ['All', 'Car', 'Van', 'Pickup', 'Truck', 'Lorry', 'Tempo', 'Bus', 'Motorcycle'];

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fleet Vehicle Master</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive profiles, technical specs, and live assignments for all {vehicles.length} fleet units</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button 
            onClick={() => openQuickModal('addVehicle')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Add Vehicle
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by registration number, model, category, driver, or dept..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
            >
              {typeList.map(t => (
                <option key={t} value={t}>Type: {t}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-slate-50">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === 'grid' ? "bg-white shadow-xs text-blue-600" : "text-slate-400 hover:text-slate-700"
                )}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === 'table' ? "bg-white shadow-xs text-blue-600" : "text-slate-400 hover:text-slate-700"
                )}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Status:</span>
          {statusList.map(st => (
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
              {st !== 'All' && (
                <span className="ml-1 text-[10px] opacity-70">
                  ({vehicles.filter(v => v.currentStatus === st).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Vehicles Display */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-white p-12 rounded-xl border border-slate-200 text-center space-y-3">
          <CarFront className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No vehicles match your search criteria</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or add a new vehicle to the fleet.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVehicles.map(v => {
            const insStatus = getDocumentExpiryStatus(v.insuranceExpiry);
            const isMenuOpen = menuOpenId === v.id;

            return (
              <div 
                key={v.id} 
                onClick={() => setSelectedVehicleId(v.id)}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer group relative"
              >
                <div>
                  {/* Card Header */}
                  <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <CarFront className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-sm font-mono">{v.number}</h3>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            v.currentStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                            v.currentStatus === 'In Trip' ? 'bg-blue-100 text-blue-700' :
                            v.currentStatus === 'Maintenance' ? 'bg-amber-100 text-amber-700' :
                            'bg-slate-100 text-slate-700'
                          )}>
                            {v.currentStatus}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">{v.name}</p>
                      </div>
                    </div>

                    {/* Options Menu */}
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => setMenuOpenId(isMenuOpen ? null : v.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-xs">
                          <button 
                            onClick={() => { setMenuOpenId(null); setSelectedVehicleId(v.id); }}
                            className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 font-medium"
                          >
                            <CarFront className="w-3.5 h-3.5" /> View Profile
                          </button>
                          <button 
                            onClick={() => { setMenuOpenId(null); openQuickModal('editVehicle', v); }}
                            className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 font-medium"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> Edit Details
                          </button>
                          <button 
                            onClick={() => { setMenuOpenId(null); openQuickModal('addFuel', { vehicleId: v.id, vehicleNumber: v.number }); }}
                            className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 font-medium"
                          >
                            <Fuel className="w-3.5 h-3.5" /> Add Fuel
                          </button>
                          <button 
                            onClick={() => { setMenuOpenId(null); openQuickModal('newTrip', { vehicleId: v.id, vehicleNumber: v.number, startOdometer: v.currentOdometer }); }}
                            className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 font-medium"
                          >
                            <MapPin className="w-3.5 h-3.5" /> New Trip
                          </button>
                          <div className="border-t border-slate-100 my-1"></div>
                          <button 
                            onClick={() => {
                              setMenuOpenId(null);
                              if (confirm(`Are you sure you want to delete vehicle ${v.number}?`)) {
                                deleteVehicle(v.id);
                              }
                            }}
                            className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete Vehicle
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body Specs */}
                  <div className="p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-slate-400 block font-medium">Assigned Driver</span>
                        <span className="font-semibold text-slate-800 truncate block mt-0.5">
                          {v.primaryDriverName || 'Pool (Unassigned)'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium">Department</span>
                        <span className="font-semibold text-slate-800 truncate block mt-0.5">
                          {v.department}
                        </span>
                      </div>
                    </div>

                    {/* Insurance Tag */}
                    <div className={cn(
                      "p-2 rounded-lg text-[11px] font-medium flex items-center justify-between",
                      insStatus === 'Expired' ? 'bg-red-50 text-red-800 border border-red-200' :
                      insStatus === 'Expiring Soon' ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                      'bg-slate-50 text-slate-600'
                    )}>
                      <span>Insurance Expiry:</span>
                      <span className="font-bold">{v.insuranceExpiry || 'Not Registered'}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Metrics */}
                <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Odometer</span>
                    <span className="font-bold text-slate-800 font-mono">{v.currentOdometer.toLocaleString()} KM</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Fuel Type</span>
                    <span className="font-bold text-slate-800">{v.fuelType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Expected</span>
                    <span className="font-bold text-emerald-600">{v.expectedMileage} km/l</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View */
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">Vehicle</th>
                  <th className="px-4 py-3">Type & Fuel</th>
                  <th className="px-4 py-3">Driver</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3 text-right">Odometer</th>
                  <th className="px-4 py-3 text-right">Mileage</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredVehicles.map(v => (
                  <tr 
                    key={v.id} 
                    onClick={() => setSelectedVehicleId(v.id)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900 font-mono">{v.number}</div>
                      <div className="text-slate-500">{v.name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-800">{v.type}</div>
                      <div className="text-slate-400">{v.fuelType}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {v.primaryDriverName || 'Pool (Unassigned)'}
                    </td>
                    <td className="px-4 py-3">{v.department}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900">
                      {v.currentOdometer.toLocaleString()} KM
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-emerald-600">
                      {v.expectedMileage} km/l
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        v.currentStatus === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                        v.currentStatus === 'In Trip' ? 'bg-blue-100 text-blue-700' :
                        v.currentStatus === 'Maintenance' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      )}>
                        {v.currentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => setSelectedVehicleId(v.id)}
                          className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-medium"
                        >
                          View
                        </button>
                        <button 
                          onClick={() => openQuickModal('editVehicle', v)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

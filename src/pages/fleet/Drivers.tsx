import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Filter, Phone, Mail, 
  CarFront, ShieldCheck, AlertTriangle, Download, 
  MoreVertical, Edit2, Trash2, Award
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { DriverStatus, LicenceType } from '../../types/fleet';
import { cn } from '../../lib/utils';

export const Drivers: React.FC = () => {
  const { 
    drivers, vehicles, trips, setSelectedDriverId, 
    setSelectedVehicleId, openQuickModal, deleteDriver 
  } = useFleet();

  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedLicence, setSelectedLicence] = useState<string>('All');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Check licence expiry (<60 days)
  const isLicenceExpiring = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const now = new Date('2026-08-30');
    const exp = new Date(expiryDate);
    const diff = (exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff < 60;
  };

  const expiringCount = drivers.filter(d => isLicenceExpiring(d.licenceExpiry)).length;

  const filteredDrivers = drivers.filter(d => {
    const matchesSearch = 
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.licenceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (d.employeeId && d.employeeId.toLowerCase().includes(search.toLowerCase())) ||
      d.department.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = selectedStatus === 'All' || d.status === selectedStatus;
    const matchesLicence = selectedLicence === 'All' || d.licenceType === selectedLicence;

    return matchesSearch && matchesStatus && matchesLicence;
  });

  const exportCSV = () => {
    const headers = ['Name,Employee ID,Mobile,Department,Licence No,Licence Type,Licence Expiry,Status,Assigned Vehicle,Total Trips,Total KM'];
    const rows = filteredDrivers.map(d => 
      `"${d.name}","${d.employeeId || ''}","${d.mobile}","${d.department}","${d.licenceNumber}","${d.licenceType}","${d.licenceExpiry}","${d.status}","${d.assignedVehicleNumber || 'Unassigned'}",${d.totalTrips || 0},${d.totalKm || 0}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enerpack_Drivers_Roster_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Fleet Drivers Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage certified drivers, compliance licenses, and vehicle allocations</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Roster
          </button>
          <button 
            onClick={() => openQuickModal('addDriver')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" /> Add Driver
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase">Total Drivers</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{drivers.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 block uppercase">Active on Duty</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">
            {drivers.filter(d => d.status === 'Active').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 block uppercase">On Leave</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">
            {drivers.filter(d => d.status === 'On Leave').length}
          </span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 block uppercase">Licence Expiries</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">{expiringCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search driver by name, licence number, emp ID, or dept..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedLicence}
              onChange={(e) => setSelectedLicence(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700"
            >
              {['All', 'LMV', 'HMV', 'Commercial', '2-Wheeler', 'Hazardous'].map(l => (
                <option key={l} value={l}>Licence: {l}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">Status:</span>
          {['All', 'Active', 'On Leave', 'Suspended', 'Inactive'].map(st => (
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

      {/* Driver Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map(d => {
          const assignedVeh = vehicles.find(v => v.id === d.assignedVehicleId || v.number === d.assignedVehicleNumber);
          const isExpiring = isLicenceExpiring(d.licenceExpiry);
          const isMenuOpen = menuOpenId === d.id;

          return (
            <div 
              key={d.id} 
              onClick={() => setSelectedDriverId(d.id)}
              className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-md transition-all overflow-hidden flex flex-col justify-between cursor-pointer group"
            >
              <div>
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-600/10 text-blue-700 flex items-center justify-center font-bold text-base border border-blue-200 shrink-0">
                      {d.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-slate-900 text-sm">{d.name}</h3>
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          d.status === 'Active' ? 'bg-emerald-100 text-emerald-700' :
                          d.status === 'On Leave' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        )}>
                          {d.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{d.employeeId || 'External'} • {d.department}</p>
                    </div>
                  </div>

                  <div className="relative" onClick={e => e.stopPropagation()}>
                    <button 
                      onClick={() => setMenuOpenId(isMenuOpen ? null : d.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {isMenuOpen && (
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 rounded-xl shadow-xl z-30 py-1 text-xs">
                        <button 
                          onClick={() => { setMenuOpenId(null); setSelectedDriverId(d.id); }}
                          className="w-full px-3 py-1.5 text-left text-slate-700 hover:bg-blue-50 hover:text-blue-600 font-medium"
                        >
                          View Profile
                        </button>
                        <button 
                          onClick={() => {
                            setMenuOpenId(null);
                            if (confirm(`Remove driver ${d.name}?`)) deleteDriver(d.id);
                          }}
                          className="w-full px-3 py-1.5 text-left text-red-600 hover:bg-red-50 font-medium"
                        >
                          Delete Driver
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-slate-400 block font-medium">Licence</span>
                      <span className="font-mono font-bold text-slate-800">{d.licenceNumber}</span>
                      <span className="text-[10px] text-blue-600 font-semibold block">{d.licenceType}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-medium">Licence Expiry</span>
                      <span className={cn(
                        "font-semibold block",
                        isExpiring ? "text-amber-700 font-bold" : "text-slate-800"
                      )}>
                        {d.licenceExpiry}
                      </span>
                      {isExpiring && <span className="text-[10px] text-amber-600 font-bold">⚠️ Expiring soon</span>}
                    </div>
                  </div>

                  {/* Assigned vehicle */}
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500 font-medium">Assigned Vehicle:</span>
                    {assignedVeh ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedVehicleId(assignedVeh.id);
                        }}
                        className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 font-mono"
                      >
                        <CarFront className="w-3.5 h-3.5" /> {assignedVeh.number}
                      </button>
                    ) : (
                      <span className="text-slate-400">Pool Driver</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Phone: <strong className="text-slate-800">{d.mobile}</strong></span>
                <span className="text-blue-600 font-bold">{(d.totalKm || 0).toLocaleString()} KM Logged</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

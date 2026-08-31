import React, { useState } from 'react';
import { 
  FileText, Plus, Search, Filter, AlertOctagon, AlertTriangle, 
  CheckCircle2, Download, Trash2, Calendar, CarFront, ShieldCheck, ExternalLink
} from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { DocumentType } from '../../types/fleet';
import { cn } from '../../lib/utils';

export const Documents: React.FC = () => {
  const { 
    documents, vehicles, openQuickModal, 
    deleteDocument, setSelectedVehicleId, getDocumentExpiryStatus 
  } = useFleet();

  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('All');

  const filteredDocs = documents.filter(d => {
    const status = getDocumentExpiryStatus(d.expiryDate);
    const matchesSearch = 
      d.vehicleNumber.toLowerCase().includes(search.toLowerCase()) ||
      d.documentType.toLowerCase().includes(search.toLowerCase()) ||
      d.documentNumber.toLowerCase().includes(search.toLowerCase()) ||
      (d.issuingAuthority && d.issuingAuthority.toLowerCase().includes(search.toLowerCase()));

    const matchesType = selectedType === 'All' || d.documentType === selectedType;
    const matchesStatus = selectedStatus === 'All' || status === selectedStatus;
    const matchesVeh = selectedVehicle === 'All' || d.vehicleId === selectedVehicle || d.vehicleNumber === selectedVehicle;

    return matchesSearch && matchesType && matchesStatus && matchesVeh;
  });

  const expiredCount = documents.filter(d => getDocumentExpiryStatus(d.expiryDate) === 'Expired').length;
  const expiringSoonCount = documents.filter(d => getDocumentExpiryStatus(d.expiryDate) === 'Expiring Soon').length;
  const validCount = documents.filter(d => getDocumentExpiryStatus(d.expiryDate) === 'Valid').length;

  const docTypes: DocumentType[] = [
    'Registration Certificate',
    'Insurance',
    'PUC',
    'Fitness Certificate',
    'Permit',
    'Road Tax',
    'National Permit',
    'Pollution Certificate',
    'Driving Licence',
    'Lease Agreement',
    'Purchase Invoice',
    'Other'
  ];

  const exportCSV = () => {
    const headers = ['Vehicle,Document Type,Document Number,Issue Date,Expiry Date,Issuing Authority,Status'];
    const rows = filteredDocs.map(d => 
      `"${d.vehicleNumber}","${d.documentType}","${d.documentNumber}","${d.issueDate || ''}","${d.expiryDate || ''}","${d.issuingAuthority || ''}","${getDocumentExpiryStatus(d.expiryDate)}"`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Enerpack_Fleet_Documents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Compliance & Document Vault</h2>
          <p className="text-xs text-slate-500 mt-0.5">Automated expiry alerts for RC, Insurance, PUC, Fitness, Permits & Tax Certificates</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" /> Export Register
          </button>
          <button 
            onClick={() => openQuickModal('uploadDocument')}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 block uppercase">Total Documents</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{documents.length}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-rose-600 block uppercase">Expired (Action Required)</span>
          <span className="text-2xl font-bold text-rose-700 mt-1 block">{expiredCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-amber-600 block uppercase">Expiring &lt;30 Days</span>
          <span className="text-2xl font-bold text-amber-700 mt-1 block">{expiringSoonCount}</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-emerald-600 block uppercase">Valid & Compliant</span>
          <span className="text-2xl font-bold text-emerald-700 mt-1 block">{validCount}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by document number, vehicle, authority, or type..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium text-slate-700 max-w-xs"
            >
              <option value="All">All Types</option>
              {docTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

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
          {['All', 'Valid', 'Expiring Soon', 'Expired'].map(st => (
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
              {st === 'Expired' && expiredCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-rose-200 text-rose-900 text-[10px] font-bold">
                  {expiredCount}
                </span>
              )}
              {st === 'Expiring Soon' && expiringSoonCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold">
                  {expiringSoonCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Grid / Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Document Type</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Document #</th>
                <th className="px-4 py-3">Issuing Authority</th>
                <th className="px-4 py-3">Issue Date</th>
                <th className="px-4 py-3">Expiry Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map(d => {
                const status = getDocumentExpiryStatus(d.expiryDate);

                return (
                  <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                          status === 'Expired' ? 'bg-rose-100 text-rose-700' :
                          status === 'Expiring Soon' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-50 text-blue-700'
                        )}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{d.documentType}</span>
                          {d.cost && d.cost > 0 ? (
                            <span className="text-[10px] text-slate-400">Premium/Fee: ₹{d.cost.toLocaleString()}</span>
                          ) : null}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => setSelectedVehicleId(d.vehicleId)}
                        className="font-bold text-blue-600 hover:underline block font-mono"
                      >
                        {d.vehicleNumber}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-mono font-medium text-slate-800">
                      {d.documentNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {d.issuingAuthority || 'Govt / Regional Transport'}
                    </td>
                    <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                      {d.issueDate || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-semibold">
                      <span className={cn(
                        status === 'Expired' ? 'text-rose-700 font-bold' :
                        status === 'Expiring Soon' ? 'text-amber-700 font-bold' :
                        'text-slate-800'
                      )}>
                        {d.expiryDate || 'Lifetime'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                        status === 'Expired' ? 'bg-rose-100 text-rose-700' :
                        status === 'Expiring Soon' ? 'bg-amber-100 text-amber-700' :
                        'bg-emerald-100 text-emerald-700'
                      )}>
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button 
                          onClick={() => openQuickModal('uploadDocument', { vehicleId: d.vehicleId, vehicleNumber: d.vehicleNumber, documentType: d.documentType })}
                          className="px-2 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded text-xs font-semibold"
                          title="Renew Document"
                        >
                          Renew
                        </button>
                        <button 
                          onClick={() => {
                            if (confirm(`Delete document record ${d.documentNumber}?`)) deleteDocument(d.id);
                          }}
                          className="p-1 text-slate-400 hover:text-red-600 rounded"
                          title="Delete Document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

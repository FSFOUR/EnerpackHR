import React, { useState } from 'react';
import { Laptop, Monitor, Smartphone, Headphones, Search, Plus, Filter, AlertTriangle, CheckCircle2, UserCheck, RefreshCw, X, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface AssetItem {
  id: string;
  type: 'Laptop' | 'Monitor' | 'Smartphone' | 'Accessories';
  model: string;
  serialNumber: string;
  assignedTo: string;
  assignedDate: string;
  status: 'In Use' | 'Available' | 'Maintenance' | 'Retired';
  condition: 'Excellent' | 'Good' | 'Fair';
}

const initialAssets: AssetItem[] = [
  { id: 'AST-M1-001', type: 'Laptop', model: 'MacBook Pro 16" (M3 Max, 36GB)', serialNumber: 'C02GK990MD6R', assignedTo: 'Arjun Sharma', assignedDate: 'Jan 10, 2026', status: 'In Use', condition: 'Excellent' },
  { id: 'AST-M1-002', type: 'Laptop', model: 'MacBook Air 15" (M2, 16GB)', serialNumber: 'C02FN441Q82P', assignedTo: 'Priya Patel', assignedDate: 'Mar 15, 2026', status: 'In Use', condition: 'Good' },
  { id: 'AST-MON-014', type: 'Monitor', model: 'Dell UltraSharp 27" 4K USB-C', serialNumber: 'CN-0K712-74261', assignedTo: 'Unassigned', assignedDate: '—', status: 'Available', condition: 'Excellent' },
  { id: 'AST-MON-015', type: 'Monitor', model: 'LG UltraFine 32" Ergo', serialNumber: 'LG-982-1104', assignedTo: 'Rahul Verma', assignedDate: 'Feb 01, 2026', status: 'In Use', condition: 'Good' },
  { id: 'AST-PHN-008', type: 'Smartphone', model: 'Google Pixel 8 Pro 256GB', serialNumber: '358241098442', assignedTo: 'Manish Singh', assignedDate: 'May 20, 2026', status: 'In Use', condition: 'Good' },
  { id: 'AST-ACC-032', type: 'Accessories', model: 'Sony WH-1000XM5 ANC Headset', serialNumber: 'SN-WH5-4491', assignedTo: 'Aisha Khan', assignedDate: 'Aug 05, 2026', status: 'In Use', condition: 'Excellent' },
  { id: 'AST-M1-009', type: 'Laptop', model: 'ThinkPad X1 Carbon Gen 11', serialNumber: 'PF-394X11', assignedTo: 'IT Lab', assignedDate: 'Jul 12, 2026', status: 'Maintenance', condition: 'Fair' },
];

const CATEGORIES = ['All', 'Laptop', 'Monitor', 'Smartphone', 'Accessories'] as const;

export function Assets() {
  const [assets, setAssets] = useState<AssetItem[]>(initialAssets);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Request Modal State
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestType, setRequestType] = useState('Laptop');
  const [requestReason, setRequestReason] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleReportIssue = (asset: AssetItem) => {
    showToast(`Support ticket created for ${asset.model} (${asset.id}). IT Helpdesk will contact you.`);
  };

  const handleReturnOrRelease = (asset: AssetItem) => {
    setAssets(prev => prev.map(a => {
      if (a.id === asset.id) {
        return { ...a, status: a.status === 'In Use' ? 'Available' : 'In Use', assignedTo: a.status === 'In Use' ? 'Unassigned' : 'Current User' };
      }
      return a;
    }));
    showToast(`Asset ${asset.id} status toggled`);
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestReason.trim()) {
      showToast('Please provide a reason for the asset request');
      return;
    }
    setIsRequestModalOpen(false);
    setRequestReason('');
    showToast(`Asset requisition submitted for ${requestType}! Pending IT manager approval.`);
  };

  const filteredAssets = assets.filter(asset => {
    if (selectedCategory !== 'All' && asset.type !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        asset.id.toLowerCase().includes(q) ||
        asset.model.toLowerCase().includes(q) ||
        asset.assignedTo.toLowerCase().includes(q) ||
        asset.serialNumber.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getAssetIcon = (type: AssetItem['type']) => {
    switch (type) {
      case 'Laptop': return <Laptop className="w-4 h-4 text-blue-600" />;
      case 'Monitor': return <Monitor className="w-4 h-4 text-purple-600" />;
      case 'Smartphone': return <Smartphone className="w-4 h-4 text-emerald-600" />;
      case 'Accessories': return <Headphones className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 border border-slate-700 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Asset Management</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Track company hardware, inventory allocations, and service requests.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Request Asset
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Hardware</span>
          <p className="text-2xl font-bold font-mono text-slate-900 mt-1">{assets.length}</p>
          <span className="text-[10px] text-slate-500 mt-1 block">Registered in CMDB</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">In Active Use</span>
          <p className="text-2xl font-bold font-mono text-blue-600 mt-1">{assets.filter(a => a.status === 'In Use').length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Assigned to staff</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Available in Pool</span>
          <p className="text-2xl font-bold font-mono text-emerald-600 mt-1">{assets.filter(a => a.status === 'Available').length}</p>
          <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">Ready for deployment</span>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">In Maintenance</span>
          <p className="text-2xl font-bold font-mono text-amber-600 mt-1">{assets.filter(a => a.status === 'Maintenance').length}</p>
          <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Service ticket open</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Category Horizontal Scrolling Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {CATEGORIES.map(cat => {
            const isSelected = selectedCategory === cat;
            const count = cat === 'All' ? assets.length : assets.filter(a => a.type === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all border flex items-center gap-1.5 cursor-pointer min-h-[40px]",
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                )}
              >
                <span>{cat}</span>
                <span className={cn(
                  "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                  isSelected ? "bg-blue-700 text-white" : "bg-slate-200 text-slate-600"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search model, asset ID, serial number, employee..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 min-h-[40px]"
          />
        </div>
      </div>

      {/* SECTION 15: MOBILE ASSET CARDS */}
      <div className="lg:hidden space-y-3">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
            <p className="font-bold text-slate-700">No assets found</p>
            <p className="text-xs text-slate-400 mt-1">Try switching categories or clearing search filters.</p>
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
            >
              {/* Card Top: Type icon, Model, and Status Badge */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                    {getAssetIcon(asset.type)}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">{asset.model}</h4>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      {asset.id} &bull; S/N: {asset.serialNumber}
                    </span>
                  </div>
                </div>

                <span className={cn(
                  "px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0",
                  asset.status === 'In Use' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                  asset.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                  asset.status === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                  'bg-slate-100 text-slate-600 border-slate-200'
                )}>
                  {asset.status}
                </span>
              </div>

              {/* Assignment & Condition info */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Assigned To</span>
                  <span className="font-semibold text-slate-800 text-xs mt-0.5 block">{asset.assignedTo}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Condition</span>
                  <span className="text-xs font-semibold text-slate-700 mt-0.5 block">{asset.condition}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleReportIssue(asset)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Report Issue
                </button>
                <button
                  onClick={() => handleReturnOrRelease(asset)}
                  className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[40px] cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-blue-600" /> {asset.status === 'In Use' ? 'Return Asset' : 'Assign'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW */}
      <div className="hidden lg:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="py-3.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset ID</th>
              <th className="py-3.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type & Model</th>
              <th className="py-3.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Serial Number</th>
              <th className="py-3.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned To</th>
              <th className="py-3.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="py-3.5 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {filteredAssets.map((asset) => (
              <tr key={asset.id} className="hover:bg-slate-50 transition-colors group">
                <td className="py-4 px-6 whitespace-nowrap font-mono text-xs font-bold text-slate-900">{asset.id}</td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                      {getAssetIcon(asset.type)}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block text-xs">{asset.model}</span>
                      <span className="text-[10px] text-slate-400">{asset.type} &bull; {asset.condition}</span>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 whitespace-nowrap font-mono text-xs text-slate-500">{asset.serialNumber}</td>
                <td className="py-4 px-6 whitespace-nowrap text-slate-700 font-medium text-xs">{asset.assignedTo}</td>
                <td className="py-4 px-6 whitespace-nowrap">
                  <span className={cn(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    asset.status === 'In Use' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    asset.status === 'Available' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    asset.status === 'Maintenance' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  )}>
                    {asset.status}
                  </span>
                </td>
                <td className="py-4 px-6 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleReportIssue(asset)}
                      title="Report Issue"
                      className="px-2.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Report
                    </button>
                    <button
                      onClick={() => handleReturnOrRelease(asset)}
                      className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                    >
                      {asset.status === 'In Use' ? 'Return' : 'Assign'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Request Asset Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">Request Hardware / Asset</h3>
              <button
                onClick={() => setIsRequestModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Asset Category
                </label>
                <select
                  value={requestType}
                  onChange={(e) => setRequestType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                >
                  <option value="Laptop">Laptop (MacBook Pro / Dell Precision)</option>
                  <option value="Monitor">External Monitor (4K UltraSharp / UltraFine)</option>
                  <option value="Smartphone">Smartphone (Testing device)</option>
                  <option value="Accessories">Accessories (Headphones, Docking Station, Keyboard)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700 block mb-1">
                  Business Justification & Requirements
                </label>
                <textarea
                  rows={3}
                  value={requestReason}
                  onChange={(e) => setRequestReason(e.target.value)}
                  placeholder="Explain why you need this equipment and any specific specs..."
                  className="w-full p-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRequestModalOpen(false)}
                  className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors min-h-[44px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm shadow-blue-200 min-h-[44px] cursor-pointer"
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

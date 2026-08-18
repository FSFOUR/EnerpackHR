import React from 'react';
import { Laptop, Monitor, Smartphone, Search, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export function Assets() {
  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Asset Management</h1>
          <p className="text-slate-500 text-sm mt-1">Track company hardware and equipment assignments.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Asset
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Inventory</h2>
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search assets..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Asset ID</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Model</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assigned To</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {[
                { id: 'AST-M1-001', type: 'Laptop', model: 'MacBook Pro 16"', assigned: 'Arjun Sharma', status: 'In Use' },
                { id: 'AST-M1-002', type: 'Laptop', model: 'MacBook Air M2', assigned: 'Priya Patel', status: 'In Use' },
                { id: 'AST-MON-014', type: 'Monitor', model: 'Dell UltraSharp 27"', assigned: 'Unassigned', status: 'Available' },
              ].map((asset, i) => (
                <tr key={i} className="hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 whitespace-nowrap font-mono text-xs font-bold text-slate-900">{asset.id}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600 flex items-center gap-2">
                    {asset.type === 'Laptop' ? <Laptop className="w-4 h-4 text-slate-400" /> : <Monitor className="w-4 h-4 text-slate-400" />}
                    {asset.type}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap font-bold text-slate-900">{asset.model}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600">{asset.assigned}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      asset.status === 'In Use' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
                    )}>
                      {asset.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { BarChart3, PieChart, Download, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

export function Reports() {
  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Reports & Analytics</h1>
          <p className="text-slate-500 text-sm mt-1">Export company data and view aggregate statistics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
        {[
          { title: 'Headcount Report', desc: 'Current employees, departments, and roles.', icon: BarChart3 },
          { title: 'Payroll Summary', desc: 'Monthly compensation, taxes, and deductions.', icon: FileText },
          { title: 'Leave Analysis', desc: 'Time-off patterns and balance summaries.', icon: PieChart }
        ].map((rep, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition-all group">
            <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 mb-5 border border-slate-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              <rep.icon className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-base mb-2">{rep.title}</h3>
            <p className="text-sm text-slate-500 mb-6">{rep.desc}</p>
            <button className="w-full py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { Receipt, DollarSign, Search, Plus, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { cn } from '../lib/utils';

const mockExpenses = [
  { id: 'EXP-401', emp: 'Rahul Verma', category: 'Travel', amount: 4500, date: 'Aug 10, 2026', status: 'Pending' },
  { id: 'EXP-402', emp: 'Priya Patel', category: 'Office Supplies', amount: 1200, date: 'Aug 05, 2026', status: 'Approved' },
  { id: 'EXP-403', emp: 'Arjun Sharma', category: 'Meals', amount: 850, date: 'Aug 02, 2026', status: 'Approved' },
];

export function Expenses() {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Expenses</h1>
          <p className="text-slate-500 text-sm mt-1">Track and reimburse employee business expenses.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Submit Expense
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
            <DollarSign className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Reimbursed</p>
          <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tighter">₹45,200 <span className="text-xs font-sans text-slate-500 font-medium">this month</span></h3>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col justify-between">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center text-orange-500 mb-4 border border-orange-100">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Pending Approval</p>
          <h3 className="text-2xl font-bold text-slate-900 font-mono tracking-tighter">14</h3>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col mt-4">
        <div className="p-4 border-b border-slate-100 bg-white flex justify-between items-center">
          <h2 className="font-bold text-slate-800">Expense Claims</h2>
          <div className="relative w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search expenses..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Claim ID</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {mockExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6 whitespace-nowrap font-mono text-xs font-bold text-slate-900">{exp.id}</td>
                  <td className="py-4 px-6 whitespace-nowrap font-bold text-slate-900">{exp.emp}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-medium flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-slate-400" /> {exp.category}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-right font-mono font-bold text-slate-900">{formatCurrency(exp.amount)}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-mono text-xs">{exp.date}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                      exp.status === 'Approved' ? 'bg-green-50 text-green-600' :
                      exp.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                      'bg-red-50 text-red-600'
                    )}>
                      {exp.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    {exp.status === 'Pending' && (
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 text-green-600 bg-green-50 rounded hover:bg-green-100 transition-colors">
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                        <button className="p-1.5 text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
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

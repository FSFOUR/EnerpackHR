import React from 'react';
import { Target, TrendingUp, Star, Search, Plus } from 'lucide-react';
import { cn } from '../lib/utils';

export function Performance() {
  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Performance Reviews</h1>
          <p className="text-slate-500 text-sm mt-1">Manage goals, KPIs, and regular performance evaluations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Review
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center">
           <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4 border border-blue-100">
             <Star className="w-8 h-8 fill-current opacity-80" />
           </div>
           <h2 className="text-3xl font-bold text-slate-900 font-mono">4.2<span className="text-lg text-slate-400">/5</span></h2>
           <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-2">Company Average Rating</p>
        </div>
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Upcoming Reviews</h3>
          <div className="space-y-4">
             {[1, 2, 3].map(i => (
               <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold text-sm">
                      E{i}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Employee Name {i}</h4>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Q3 Performance Cycle</p>
                    </div>
                  </div>
                  <button className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors">
                    Start
                  </button>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
}

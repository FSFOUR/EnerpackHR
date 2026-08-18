import React from 'react';
import { Search, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

export const Onboarding: React.FC = () => {
  const onboardingTasks = [
    { id: 1, title: 'Employee Information Form', status: 'completed' },
    { id: 2, title: 'Identity Documents Upload', status: 'completed' },
    { id: 3, title: 'Bank Details', status: 'completed' },
    { id: 4, title: 'Employment Contract Signature', status: 'pending' },
    { id: 5, title: 'Company Policy Agreement', status: 'pending' },
    { id: 6, title: 'IT Assets & Email Setup', status: 'upcoming' },
    { id: 7, title: 'Manager Introduction', status: 'upcoming' },
  ];

  const completedCount = onboardingTasks.filter(t => t.status === 'completed').length;
  const progress = Math.round((completedCount / onboardingTasks.length) * 100);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Onboarding Tracks</h1>
          <p className="text-slate-500 text-sm">Track and manage new hire onboarding progress.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Active Onboardings</h3>
            
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-blue-50/50 border border-blue-200 cursor-pointer transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Aisha Khan</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mt-0.5">UI/UX Designer</p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{progress}%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              
              <div className="p-4 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">Ravi Kumar</p>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 mt-0.5">Marketing Lead</p>
                  </div>
                  <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">100%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Aisha Khan</h2>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-1">UI/UX Designer &bull; Joined Today</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-600">{progress}%</div>
                <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Complete</div>
              </div>
            </div>
            
            <div className="p-0">
              <ul className="divide-y divide-slate-50">
                {onboardingTasks.map((task, idx) => (
                  <li key={task.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center gap-4">
                      {task.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                      {task.status === 'pending' && <Clock className="w-5 h-5 text-orange-500" />}
                      {task.status === 'upcoming' && <Circle className="w-5 h-5 text-slate-300" />}
                      <span className={cn(
                        "font-medium text-sm",
                        task.status === 'completed' ? "text-slate-400 line-through" :
                        task.status === 'pending' ? "text-slate-900 font-bold" : "text-slate-500"
                      )}>
                        {idx + 1}. {task.title}
                      </span>
                    </div>
                    {task.status === 'pending' && (
                      <button className="px-4 py-1.5 bg-white border border-slate-200 rounded text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                        Remind
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

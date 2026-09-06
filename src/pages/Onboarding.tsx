import React, { useState } from 'react';
import { Search, CheckCircle2, Circle, Clock, UserCheck, ShieldCheck, CreditCard, Phone, FileSignature, Laptop, Sparkles, ChevronRight, Check } from 'lucide-react';
import { cn } from '../lib/utils';

interface OnboardingCandidate {
  id: string;
  name: string;
  role: string;
  department: string;
  joinDate: string;
  tasks: {
    id: string;
    title: string;
    desc: string;
    icon: React.ElementType;
    completed: boolean;
  }[];
}

const initialJoinees: OnboardingCandidate[] = [
  {
    id: 'JOIN-001',
    name: 'Aisha Khan',
    role: 'UI/UX Designer',
    department: 'Design & Product',
    joinDate: 'Aug 24, 2026',
    tasks: [
      { id: 't1', title: 'ID Verification', desc: 'Government ID, PAN card, and Aadhaar verified', icon: ShieldCheck, completed: true },
      { id: 't2', title: 'Bank Details', desc: 'Salary account details & cancelled cheque submitted', icon: CreditCard, completed: true },
      { id: 't3', title: 'Emergency Contact', desc: 'Primary and secondary contact numbers recorded', icon: Phone, completed: true },
      { id: 't4', title: 'Signed Contract', desc: 'Offer letter and NDA e-signed by candidate', icon: FileSignature, completed: false },
      { id: 't5', title: 'IT Asset Handover', desc: 'MacBook Pro, security pass & credentials issued', icon: Laptop, completed: false },
    ]
  },
  {
    id: 'JOIN-002',
    name: 'Vikram Joshi',
    role: 'DevOps Engineer',
    department: 'Cloud Infrastructure',
    joinDate: 'Aug 19, 2026',
    tasks: [
      { id: 't1', title: 'ID Verification', desc: 'Government ID, PAN card, and Aadhaar verified', icon: ShieldCheck, completed: true },
      { id: 't2', title: 'Bank Details', desc: 'Salary account details & cancelled cheque submitted', icon: CreditCard, completed: true },
      { id: 't3', title: 'Emergency Contact', desc: 'Primary and secondary contact numbers recorded', icon: Phone, completed: true },
      { id: 't4', title: 'Signed Contract', desc: 'Offer letter and NDA e-signed by candidate', icon: FileSignature, completed: true },
      { id: 't5', title: 'IT Asset Handover', desc: 'Dell Precision laptop & Cloud tokens allocated', icon: Laptop, completed: true },
    ]
  },
];

export const Onboarding: React.FC = () => {
  const [joinees, setJoinees] = useState<OnboardingCandidate[]>(initialJoinees);
  const [selectedJoineeId, setSelectedJoineeId] = useState<string>('JOIN-001');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const currentJoinee = joinees.find(j => j.id === selectedJoineeId) || joinees[0];
  const completedCount = currentJoinee.tasks.filter(t => t.completed).length;
  const progressPercent = Math.round((completedCount / currentJoinee.tasks.length) * 100);

  const toggleTask = (taskId: string) => {
    setJoinees(prev => prev.map(j => {
      if (j.id !== currentJoinee.id) return j;
      const updatedTasks = j.tasks.map(t => t.id === taskId ? { ...t, completed: !t.completed } : t);
      return { ...j, tasks: updatedTasks };
    }));
    showToast('Task updated successfully');
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
      <div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">New Hire Onboarding</h1>
        <p className="text-slate-500 text-xs sm:text-sm mt-1">Track documentation, IT assets, and compliance checklist for new team members.</p>
      </div>

      {/* Candidate Selector Horizontal Chips */}
      <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
          Select New Joinee
        </span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {joinees.map(j => {
            const isSelected = j.id === currentJoinee.id;
            const jCompleted = j.tasks.filter(t => t.completed).length;
            const jPct = Math.round((jCompleted / j.tasks.length) * 100);
            return (
              <button
                key={j.id}
                onClick={() => setSelectedJoineeId(j.id)}
                className={cn(
                  "px-4 py-2.5 rounded-xl text-left whitespace-nowrap transition-all border flex items-center gap-3 cursor-pointer min-h-[44px]",
                  isSelected
                    ? "bg-white border-blue-600 shadow-xs ring-2 ring-blue-500/20"
                    : "bg-white/80 border-slate-200 text-slate-600 hover:bg-white"
                )}
              >
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0",
                  isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                )}>
                  {j.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{j.name}</h4>
                  <p className="text-[10px] text-slate-500">{j.role} &bull; {jPct}%</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Checklist Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Card Header & Progress Bar */}
        <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {currentJoinee.department}
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{currentJoinee.name}</h2>
              <p className="text-xs text-slate-500 font-medium">
                {currentJoinee.role} &bull; Joined {currentJoinee.joinDate}
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl sm:text-3xl font-bold font-mono text-blue-600">{progressPercent}%</div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                {completedCount} of {currentJoinee.tasks.length} Steps
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
            <div 
              className={cn(
                "h-2.5 rounded-full transition-all duration-500",
                progressPercent === 100 ? "bg-emerald-500" : "bg-blue-600"
              )} 
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {progressPercent === 100 && (
            <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 text-center text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Onboarding Complete! All compliance documents & IT assets verified.
            </div>
          )}
        </div>

        {/* SECTION 13: STEP-BY-STEP CHECKLIST */}
        <div className="p-4 sm:p-6 divide-y divide-slate-100">
          {currentJoinee.tasks.map((task, idx) => {
            const TaskIcon = task.icon;
            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "py-4 flex items-start justify-between gap-3 cursor-pointer rounded-xl px-3 transition-colors",
                  task.completed ? "bg-slate-50/40 hover:bg-slate-50" : "hover:bg-blue-50/30"
                )}
              >
                <div className="flex items-start gap-3.5">
                  <button
                    type="button"
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center transition-all shrink-0 mt-0.5 border cursor-pointer min-h-[32px] min-w-[32px]",
                      task.completed
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-2xs"
                        : "bg-white border-slate-300 text-transparent hover:border-blue-500"
                    )}
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-mono font-semibold">Step {idx + 1}</span>
                      <h4 className={cn(
                        "text-sm font-bold",
                        task.completed ? "text-slate-500 line-through" : "text-slate-900"
                      )}>
                        {task.title}
                      </h4>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{task.desc}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                    task.completed ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-slate-100 text-slate-500 border-slate-200"
                  )}>
                    <TaskIcon className="w-4 h-4" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border hidden sm:inline-flex",
                    task.completed ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {task.completed ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

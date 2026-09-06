import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, UserCheck, Star, Phone, Calendar, ArrowRight, XCircle, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const PIPELINE_STAGES = [
  'All', 'Applied', 'Screening', 'Interview', 'Offered', 'Hired'
] as const;

type PipelineStage = typeof PIPELINE_STAGES[number];

interface CandidateItem {
  id: string;
  name: string;
  role: string;
  stage: 'Applied' | 'Screening' | 'Interview' | 'Offered' | 'Hired';
  rating: number;
  score: string;
  appliedDate: string;
  phone: string;
  exp: string;
  source: string;
}

const initialCandidates: CandidateItem[] = [
  { id: 'CAN-001', name: 'Rahul Verma', role: 'Frontend Developer', stage: 'Interview', rating: 4, score: '8.5/10', appliedDate: 'Aug 14, 2026', phone: '+91 98765 43210', exp: '3 Years', source: 'LinkedIn' },
  { id: 'CAN-002', name: 'Sneha Kapoor', role: 'HR Executive', stage: 'Applied', rating: 3, score: '7.0/10', appliedDate: 'Aug 18, 2026', phone: '+91 98765 43211', exp: '1 Year', source: 'Referral' },
  { id: 'CAN-003', name: 'Manish Singh', role: 'Backend Developer', stage: 'Screening', rating: 5, score: '9.0/10', appliedDate: 'Aug 11, 2026', phone: '+91 98765 43212', exp: '5 Years', source: 'Website' },
  { id: 'CAN-004', name: 'Aisha Khan', role: 'UI/UX Designer', stage: 'Offered', rating: 5, score: '9.2/10', appliedDate: 'Aug 04, 2026', phone: '+91 98765 43213', exp: '4 Years', source: 'Dribbble' },
  { id: 'CAN-005', name: 'Vikram Joshi', role: 'DevOps Engineer', stage: 'Hired', rating: 4, score: '8.8/10', appliedDate: 'Jul 28, 2026', phone: '+91 98765 43214', exp: '6 Years', source: 'Naukri' },
];

export const Recruitment: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<CandidateItem[]>(initialCandidates);
  const [selectedStage, setSelectedStage] = useState<PipelineStage>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCall = (c: CandidateItem) => {
    window.open(`tel:${c.phone}`, '_self');
    showToast(`Calling ${c.name} (${c.phone})...`);
  };

  const handleScheduleInterview = (c: CandidateItem) => {
    showToast(`Interview invite scheduled for ${c.name} for tomorrow 2:00 PM`);
  };

  const handleAdvance = (c: CandidateItem) => {
    const stageOrder: CandidateItem['stage'][] = ['Applied', 'Screening', 'Interview', 'Offered', 'Hired'];
    const currentIndex = stageOrder.indexOf(c.stage);
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      setCandidates(prev => prev.map(item => item.id === c.id ? { ...item, stage: nextStage } : item));
      showToast(`Advanced ${c.name} to ${nextStage}`);
    } else {
      showToast(`${c.name} is already in the Hired stage`);
    }
  };

  const handleReject = (c: CandidateItem) => {
    setCandidates(prev => prev.filter(item => item.id !== c.id));
    showToast(`${c.name} has been archived/rejected from pipeline`);
  };

  const handleConvertToEmployee = (id: string) => {
    showToast(`Candidate ${id} converted to employee! Redirecting to onboarding...`);
    setTimeout(() => navigate('/onboarding'), 1000);
  };

  const filteredCandidates = candidates.filter(c => {
    if (selectedStage !== 'All' && c.stage !== selectedStage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    }
    return true;
  });

  const getStageCount = (stage: PipelineStage) => {
    if (stage === 'All') return candidates.length;
    return candidates.filter(c => c.stage === stage).length;
  };

  return (
    <div className="space-y-6 max-w-full mx-auto pb-12">
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
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Recruitment Pipeline</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage job openings, applicant stages, and hiring decisions.</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => showToast('Job creator opened')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors shadow-2xs flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Job
          </button>
          <button 
            onClick={() => showToast('Candidate profile form opened')}
            className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Candidate
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* SECTION 13: STAGE TABS ACROSS TOP (HORIZONTAL SCROLL CHIPS) */}
        <div className="p-3 sm:p-4 border-b border-slate-100 bg-slate-50/70 flex flex-col gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {PIPELINE_STAGES.map(s => {
              const count = getStageCount(s);
              const isActive = selectedStage === s;
              return (
                <button
                  key={s}
                  onClick={() => setSelectedStage(s)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border flex items-center gap-1.5 min-h-[40px]",
                    isActive
                      ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                      : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100"
                  )}
                >
                  <span>{s}</span>
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-mono",
                    isActive ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-500"
                  )}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search candidate name, role, ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 min-h-[40px]"
            />
          </div>
        </div>
        
        {/* SECTION 13: MOBILE PIPELINE CARDS (INSTEAD OF WIDE KANBAN BOARD) */}
        <div className="lg:hidden p-3 space-y-3">
          {filteredCandidates.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-bold text-slate-700">No candidates in this stage</p>
              <p className="text-xs text-slate-400 mt-1">Try switching stages or clearing the search query.</p>
            </div>
          ) : (
            filteredCandidates.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3 hover:border-slate-300 transition-all"
              >
                {/* Card Top: Avatar, Name, Role & Stage Badge */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-100 shrink-0">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{c.role}</p>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">{c.id} &bull; {c.exp}</span>
                    </div>
                  </div>

                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                    c.stage === 'Hired' || c.stage === 'Offered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    c.stage === 'Interview' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                    c.stage === 'Screening' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                    'bg-slate-100 text-slate-600 border-slate-200'
                  )}>
                    {c.stage}
                  </span>
                </div>

                {/* Meta: Rating (Stars) & Applied Date */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-1">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            "w-3.5 h-3.5",
                            star <= c.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-100"
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-[11px] font-mono font-bold text-slate-700 ml-1">({c.score})</span>
                  </div>

                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    {c.appliedDate}
                  </span>
                </div>

                {/* SECTION 13: QUICK ACTIONS: CALL, SCHEDULE INTERVIEW, REJECT, ADVANCE */}
                <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5 flex-1">
                    <button
                      onClick={() => handleCall(c)}
                      title="Call Candidate"
                      className="flex-1 px-2.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 min-h-[40px] cursor-pointer"
                    >
                      <Phone className="w-3.5 h-3.5 text-blue-600" /> Call
                    </button>

                    <button
                      onClick={() => handleScheduleInterview(c)}
                      title="Schedule Interview"
                      className="flex-1 px-2.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 min-h-[40px] cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5 text-blue-600" /> Interview
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {c.stage === 'Offered' || c.stage === 'Hired' ? (
                      <button
                        onClick={() => handleConvertToEmployee(c.id)}
                        className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 min-h-[40px] cursor-pointer shadow-2xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" /> Onboard
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAdvance(c)}
                        className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 min-h-[40px] cursor-pointer"
                      >
                        Advance <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => handleReject(c)}
                      title="Reject Candidate"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer border border-transparent hover:border-rose-200"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* DESKTOP TABLE VIEW */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stage</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Rating</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Applied Date</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredCandidates.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-4 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs border border-slate-200">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-medium text-slate-900 block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 italic">ID: {c.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600">{c.role}</td>
                  <td className="py-4 px-6 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
                      c.stage === 'Hired' || c.stage === 'Offered' ? 'bg-green-50 text-green-600' :
                      c.stage === 'Interview' ? 'bg-blue-50 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    )}>
                      {c.stage}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600">
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                      {c.score}
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600 text-xs">
                    {c.appliedDate}
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => handleCall(c)}
                        title="Call"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button 
                        onClick={() => handleScheduleInterview(c)}
                        title="Schedule Interview"
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Calendar className="w-3.5 h-3.5" />
                      </button>
                      {c.stage === 'Offered' || c.stage === 'Hired' ? (
                        <button 
                          onClick={() => handleConvertToEmployee(c.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-200 cursor-pointer"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          CONVERT TO EMPLOYEE
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleAdvance(c)}
                          className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded transition-colors shadow-sm cursor-pointer"
                        >
                          Advance
                        </button>
                      )}
                      <button 
                        onClick={() => handleReject(c)}
                        title="Reject"
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

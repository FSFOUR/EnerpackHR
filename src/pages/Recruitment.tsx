import React, { useState } from 'react';
import { Search, Plus, Filter, MoreHorizontal, UserCheck, Star } from 'lucide-react';
import { cn } from '../lib/utils';
import { useNavigate } from 'react-router-dom';

const PIPELINE_STAGES = [
  'Applied', 'Screening', 'Interview', 'Selected', 'Offer Accepted'
];

export const Recruitment: React.FC = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([
    { id: 'CAN-001', name: 'Rahul Verma', role: 'Frontend Developer', stage: 'Interview', exp: '3 Years', score: '8.5/10', source: 'LinkedIn' },
    { id: 'CAN-002', name: 'Sneha Kapoor', role: 'HR Executive', stage: 'Applied', exp: '1 Year', score: '-', source: 'Referral' },
    { id: 'CAN-003', name: 'Manish Singh', role: 'Backend Developer', stage: 'Selected', exp: '5 Years', score: '9.0/10', source: 'Website' },
    { id: 'CAN-004', name: 'Aisha Khan', role: 'UI/UX Designer', stage: 'Offer Accepted', exp: '4 Years', score: '9.2/10', source: 'Dribbble' },
  ]);

  const handleConvertToEmployee = (id: string) => {
    // In a real app, this would make an API call to create an employee and an onboarding record
    alert(`Candidate ${id} converted to Employee successfully! Onboarding checklist created.`);
    navigate('/onboarding');
  };

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Recruitment Pipeline</h1>
          <p className="text-slate-500 text-sm">Manage job openings, candidates, and hiring pipelines.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Job
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Candidate
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2 sm:pb-0 hide-scrollbar">
            <button className="px-4 py-2 bg-slate-900 text-white rounded-md text-xs font-bold uppercase tracking-wider whitespace-nowrap shadow-sm">All Candidates</button>
            {PIPELINE_STAGES.map(s => (
              <button key={s} className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-md text-xs font-bold uppercase tracking-wider hover:bg-slate-100 whitespace-nowrap transition-colors">
                {s}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80 shrink-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search candidates..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Candidate</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stage</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Experience</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Score</th>
                <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {candidates.map((c) => (
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
                      c.stage === 'Offer Accepted' ? 'bg-green-50 text-green-600' :
                      c.stage === 'Selected' ? 'bg-blue-50 text-blue-600' :
                      'bg-slate-100 text-slate-600'
                    )}>
                      {c.stage}
                    </span>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600">{c.exp}</td>
                  <td className="py-4 px-6 whitespace-nowrap text-slate-600">
                    <div className="flex items-center gap-1 font-mono text-xs">
                      <Star className="w-3 h-3 text-orange-400 fill-orange-400" />
                      {c.score}
                    </div>
                  </td>
                  <td className="py-4 px-6 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {c.stage === 'Offer Accepted' ? (
                        <button 
                          onClick={() => handleConvertToEmployee(c.id)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors flex items-center gap-1.5 shadow-sm shadow-blue-200"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          CONVERT TO EMPLOYEE
                        </button>
                      ) : (
                        <button className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded transition-colors shadow-sm">
                          View
                        </button>
                      )}
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

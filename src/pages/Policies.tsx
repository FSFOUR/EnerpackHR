import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import { Search, Plus, ShieldCheck, FileSignature, CheckCircle2, X } from 'lucide-react';
import { cn } from '../lib/utils';

export const Policies: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>(['Code of Conduct', 'Attendance Policy', 'Leave Policy', 'IT Usage Policy']);
  
  const DEFAULT_POLICIES = [
    'Code of Conduct', 'Attendance Policy', 'Leave Policy', 
    'Work From Home Policy', 'Confidentiality Policy', 'IT Usage Policy',
    'Workplace Safety Policy', 'Data Protection Policy'
  ];

  const handleTogglePolicy = (policy: string) => {
    if (selectedPolicies.includes(policy)) {
      setSelectedPolicies(selectedPolicies.filter(p => p !== policy));
    } else {
      setSelectedPolicies([...selectedPolicies, policy]);
    }
  };

  const handleGenerate = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("COMPANY POLICY AGREEMENT", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text(`Employee: ${selectedEmp}`, 20, 40);
    doc.text(`Agreement Date: ${new Date().toLocaleDateString()}`, 20, 50);
    
    doc.text("The employee acknowledges receipt and understanding of:", 20, 70);
    
    selectedPolicies.forEach((p, idx) => {
      doc.text(`${idx + 1}. ${p}`, 25, 80 + (idx * 10));
    });
    
    doc.save("Policy_Agreement.pdf");
    
    setIsGenerating(false);
    setSelectedEmp(null);
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-end justify-between border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 leading-tight">Generate Policy Agreement</h1>
            <p className="text-sm text-slate-500 mt-1">Create a consolidated document of selected policies.</p>
          </div>
          <button 
            onClick={() => setIsGenerating(false)}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-slate-50 shadow-sm transition-colors"
          >
            Cancel
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">1. Select Employee</h2>
            <select 
              className="w-full sm:w-1/2 p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              onChange={(e) => setSelectedEmp(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>Select an employee...</option>
              <option value="Arjun Sharma (EMP-001)">Arjun Sharma (EMP-001)</option>
              <option value="Priya Patel (EMP-002)">Priya Patel (EMP-002)</option>
              <option value="Ananya Desai (EMP-004)">Ananya Desai (EMP-004)</option>
            </select>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">2. Select Policies to Include</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_POLICIES.map(policy => (
                <div 
                  key={policy}
                  onClick={() => handleTogglePolicy(policy)}
                  className={cn(
                    "p-4 rounded-xl border-2 cursor-pointer transition-all flex items-center justify-between",
                    selectedPolicies.includes(policy) ? "bg-blue-50/50 border-blue-600 shadow-sm" : "bg-white border-slate-100 hover:border-blue-200 hover:bg-slate-50"
                  )}
                >
                  <span className={cn("font-bold text-sm", selectedPolicies.includes(policy) ? "text-slate-900" : "text-slate-600")}>{policy}</span>
                  {selectedPolicies.includes(policy) && <CheckCircle2 className="w-5 h-5 text-blue-600" />}
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 border-t border-slate-100 flex justify-end">
             <button 
              onClick={handleGenerate}
              disabled={!selectedEmp || selectedPolicies.length === 0}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold text-sm uppercase tracking-wider hover:bg-blue-700 shadow-sm shadow-blue-200 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              <FileSignature className="w-4 h-4" /> Generate PDF & Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Policies & Guidelines</h1>
          <p className="text-slate-500 text-sm">Manage company policies and employee agreements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsGenerating(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center gap-2"
          >
            <FileSignature className="w-4 h-4" /> Generate Agreement
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
           <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Active Policies</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
             {DEFAULT_POLICIES.map((p, i) => (
                <div key={p} className="p-5 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-blue-200 transition-colors flex flex-col gap-4 group">
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors border border-slate-100">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-500 tracking-wider">v1.{i}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">{p}</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Updated: 3 months ago</p>
                  </div>
                </div>
             ))}
           </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pending Agreements</h2>
           <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 space-y-4">
             {[
               { emp: 'Ananya Desai', policy: 'Work From Home Policy v1.2' },
               { emp: 'Arjun Sharma', policy: 'IT Usage Policy v2.0' }
             ].map((a, i) => (
               <div key={i} className="p-4 border border-orange-100 bg-orange-50/50 rounded-xl transition-colors hover:bg-orange-50">
                 <p className="font-bold text-slate-900 text-sm">{a.emp}</p>
                 <p className="text-xs font-medium text-slate-600 mt-1">{a.policy}</p>
                 <button className="mt-4 w-full py-2 bg-white border border-slate-200 shadow-sm rounded-lg text-[10px] font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 transition-colors">
                   Send Reminder
                 </button>
               </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};

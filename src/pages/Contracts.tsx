import React, { useState } from 'react';
import { jsPDF } from "jspdf";
import { Search, Plus, Filter, FileText, CheckCircle2, Clock, XCircle, FileSignature, Download } from 'lucide-react';
import { cn } from '../lib/utils';

// Steps:
// 1. Select Employee
// 2. Configure Clauses
// 3. Preview Document
// 4. Generate PDF

export const Contracts: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedEmp, setSelectedEmp] = useState<string | null>(null);

  const mockContracts = [
    { id: 'CON-1001', employee: 'Arjun Sharma', type: 'Full-time Employment', date: 'Jan 10, 2023', status: 'Signed' },
    { id: 'CON-1002', employee: 'Ananya Desai', type: 'Contract Agreement', date: 'Feb 01, 2024', status: 'Pending Signature' },
  ];

  const handleGenerate = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("EMPLOYMENT CONTRACT", 105, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.text("This Employment Contract is made and effective as of today.", 20, 40);
    doc.text("BETWEEN:", 20, 50);
    doc.setFont("helvetica", "bold");
    doc.text("Enerpack Solutions Pvt Ltd", 20, 60);
    doc.setFont("helvetica", "normal");
    
    doc.text("AND:", 20, 80);
    doc.setFont("helvetica", "bold");
    doc.text("Arjun Sharma (Employee ID: EMP-001)", 20, 90);
    doc.setFont("helvetica", "normal");
    
    doc.text("1. POSITION AND DUTIES", 20, 110);
    doc.text("The Employer agrees to employ the Employee as Senior Developer.", 20, 120);
    
    doc.text("2. COMPENSATION", 20, 140);
    doc.text("The Employee will be paid a base salary of INR 15,00,000 per annum.", 20, 150);
    
    doc.save("Employment_Contract.pdf");
    
    setStep(1);
    setIsGenerating(false);
    setSelectedEmp(null);
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Contract Generator</h1>
            <p className="text-sm text-slate-500">Create a new employment contract.</p>
          </div>
          <button 
            onClick={() => { setIsGenerating(false); setStep(1); }}
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>

        {/* Steps Header */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -z-10 -translate-y-1/2"></div>
          {[
            { num: 1, label: 'Select Employee' },
            { num: 2, label: 'Configure Clauses' },
            { num: 3, label: 'Preview & Generate' }
          ].map((s) => (
            <div key={s.num} className="flex flex-col items-center gap-2 bg-slate-50 px-2">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-colors",
                step === s.num ? "bg-blue-600 text-white" : 
                step > s.num ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
              )}>
                {step > s.num ? <CheckCircle2 className="w-5 h-5" /> : s.num}
              </div>
              <span className={cn("text-xs font-medium", step >= s.num ? "text-slate-900" : "text-slate-400")}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Select an Employee</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Arjun Sharma (EMP-001)', 'Priya Patel (EMP-002)'].map(emp => (
                  <div 
                    key={emp}
                    onClick={() => setSelectedEmp(emp)}
                    className={cn(
                      "p-4 rounded-lg border cursor-pointer transition-all",
                      selectedEmp === emp ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500" : "border-slate-200 hover:border-blue-300"
                    )}
                  >
                    <div className="font-medium text-slate-900">{emp}</div>
                    <div className="text-sm text-slate-500 mt-1">Full-time &bull; joining completed</div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                <button 
                  disabled={!selectedEmp}
                  onClick={() => setStep(2)}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  Next Step
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Configure Contract Clauses</h2>
              <div className="space-y-3">
                {['Confidentiality Clause', 'NDA Clause', 'Intellectual Property Clause', 'Probation Clause', 'Termination Clause'].map(clause => (
                  <label key={clause} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
                    <span className="text-sm font-medium text-slate-700">{clause}</span>
                  </label>
                ))}
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(1)} className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50">Back</button>
                <button onClick={() => setStep(3)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700">Next Step</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold">Preview & Generate</h2>
              <div className="bg-slate-50 p-8 rounded-lg border border-slate-200 aspect-[1/1.4] flex flex-col items-center justify-center text-center">
                <FileSignature className="w-16 h-16 text-slate-300 mb-4" />
                <h3 className="font-medium text-slate-900 mb-2">Employment Contract Preview</h3>
                <p className="text-sm text-slate-500 max-w-sm">
                  The document has been compiled for {selectedEmp} incorporating all selected clauses and personal information.
                </p>
              </div>
              <div className="flex justify-between mt-6">
                <button onClick={() => setStep(2)} className="px-6 py-2 border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50">Back</button>
                <button onClick={handleGenerate} className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600">
                  Generate PDF & Send
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Contracts</h1>
          <p className="text-sm text-slate-500">Manage employee contracts and agreements.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsGenerating(true)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> New Contract
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <div className="relative w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search contracts..." 
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Document ID</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Type</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {mockContracts.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="py-3 px-4 whitespace-nowrap text-sm font-medium text-slate-900">{c.id}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-slate-600">{c.employee}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-slate-600">{c.type}</td>
                  <td className="py-3 px-4 whitespace-nowrap text-sm text-slate-600">{c.date}</td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border",
                      c.status === 'Signed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                    )}>
                      {c.status === 'Signed' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button title="View PDF" className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                        <FileText className="w-4 h-4" />
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

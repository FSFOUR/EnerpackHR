import React, { useState } from 'react';
import { Search, Plus, Filter, DollarSign, Download, CheckCircle2, Clock, Calculator, FileText, CreditCard, ArrowRight, Share2, MessageSquare, Mail, Calendar, ChevronRight, Sparkles, TrendingUp, User, ArrowDownRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { jsPDF } from "jspdf";

const mockStructures = [
  { id: 'EMP-001', name: 'Arjun Sharma', role: 'Engineering Lead', base: 85000, hra: 34000, special: 15000, pf: 4800, tax: 7600, net: 121600 },
  { id: 'EMP-002', name: 'Priya Patel', role: 'Product Manager', base: 75000, hra: 30000, special: 12000, pf: 4200, tax: 6300, net: 106500 },
  { id: 'EMP-004', name: 'Ananya Desai', role: 'UX Designer', base: 60000, hra: 24000, special: 8000, pf: 3600, tax: 4200, net: 84200 },
  { id: 'EMP-005', name: 'Rahul Verma', role: 'Frontend Dev', base: 55000, hra: 22000, special: 6000, pf: 3000, tax: 3500, net: 76500 },
];

const mockPayslips = [
  { id: 'PAY-1049', empId: 'EMP-001', name: 'Arjun Sharma', month: 'Jul 2026', amount: 121600, status: 'Paid', date: 'Jul 31, 2026' },
  { id: 'PAY-1050', empId: 'EMP-002', name: 'Priya Patel', month: 'Jul 2026', amount: 106500, status: 'Paid', date: 'Jul 31, 2026' },
  { id: 'PAY-1051', empId: 'EMP-004', name: 'Ananya Desai', month: 'Jul 2026', amount: 84200, status: 'Paid', date: 'Jul 31, 2026' },
  { id: 'PAY-1052', empId: 'EMP-005', name: 'Rahul Verma', month: 'Jul 2026', amount: 76500, status: 'Paid', date: 'Jul 31, 2026' },
];

export function Payroll() {
  const [activeTab, setActiveTab] = useState<'overview' | 'structures' | 'payslips'>('overview');
  const [selectedMonth, setSelectedMonth] = useState<string>('Jul 2026');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleRunPayroll = () => {
    setIsProcessing(true);
    setProcessStep(1);
    setTimeout(() => setProcessStep(2), 1500);
    setTimeout(() => setProcessStep(3), 3000);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessStep(0);
      setActiveTab('payslips');
      showToast('August 2026 Payroll calculated & published successfully');
    }, 4500);
  };

  const handleDownloadPayslip = (slip: typeof mockPayslips[0]) => {
    const doc = new jsPDF();
    const structure = mockStructures.find(s => s.id === slip.empId) || mockStructures[0];
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text("Enerpack HR", 20, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text("Payslip for the month of " + slip.month, 20, 40);
    
    // Employee Details
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text("Employee Name: " + slip.name, 20, 60);
    doc.text("Employee ID: " + slip.empId, 20, 68);
    doc.text("Designation: " + structure.role, 20, 76);
    
    // Earnings & Deductions Headers
    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("EARNINGS", 20, 95);
    doc.text("DEDUCTIONS", 120, 95);
    
    doc.line(20, 98, 190, 98);
    
    // Values
    doc.setTextColor(15, 23, 42);
    doc.text("Basic Salary", 20, 110);
    doc.text(formatCurrency(structure.base), 80, 110, { align: "right" });
    
    doc.text("House Rent Allowance", 20, 120);
    doc.text(formatCurrency(structure.hra), 80, 120, { align: "right" });
    
    doc.text("Special Allowance", 20, 130);
    doc.text(formatCurrency(structure.special), 80, 130, { align: "right" });
    
    // Deductions
    doc.text("Provident Fund", 120, 110);
    doc.text(formatCurrency(structure.pf), 190, 110, { align: "right" });
    
    doc.text("Professional Tax", 120, 120);
    doc.text(formatCurrency(structure.tax), 190, 120, { align: "right" });
    
    doc.line(20, 140, 190, 140);
    
    // Totals
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    const totalEarnings = structure.base + structure.hra + structure.special;
    const totalDeductions = structure.pf + structure.tax;
    
    doc.text("Total Earnings", 20, 150);
    doc.text(formatCurrency(totalEarnings), 80, 150, { align: "right" });
    
    doc.text("Total Deductions", 120, 150);
    doc.text(formatCurrency(totalDeductions), 190, 150, { align: "right" });
    
    // Net Pay
    doc.setFillColor(248, 250, 252);
    doc.rect(20, 165, 170, 25, "F");
    doc.setFontSize(14);
    doc.text("Net Payable", 30, 181);
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text(formatCurrency(structure.net), 180, 181, { align: "right" });
    
    doc.save(`${slip.empId}_Payslip_${slip.month.replace(' ', '_')}.pdf`);
    showToast(`Downloaded payslip for ${slip.name}`);
  };

  const handleShareWhatsApp = (slip: typeof mockPayslips[0]) => {
    const text = encodeURIComponent(`Hi ${slip.name},\nYour Enerpack HR payslip for ${slip.month} is processed.\nNet Salary: ${formatCurrency(slip.amount)}\nPay Date: ${slip.date}\nStatus: ${slip.status}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
    showToast(`Shared ${slip.month} payslip to WhatsApp`);
  };

  const handleShareEmail = (slip: typeof mockPayslips[0]) => {
    const subject = encodeURIComponent(`Payslip for ${slip.month} - Enerpack HR`);
    const body = encodeURIComponent(`Hello ${slip.name},\n\nPlease find your salary statement for ${slip.month}.\nNet Payable: ${formatCurrency(slip.amount)}\nPay Date: ${slip.date}\nStatus: ${slip.status}\n\nBest Regards,\nEnerpack HR Operations`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
    showToast(`Opened email draft for ${slip.month} payslip`);
  };

  // Selected slip & structure for the Monthly Overview Card (Section 12)
  const defaultSlip = mockPayslips[0];
  const defaultStructure = mockStructures[0];
  const previousMonths = ['Jul 2026', 'Jun 2026', 'May 2026', 'Apr 2026'];

  if (isProcessing) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 mt-10 p-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10 text-center">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-blue-100 shadow-inner">
            <Calculator className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600 animate-pulse" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">Processing Payroll</h2>
          <p className="text-slate-500 text-xs sm:text-sm mb-8">Please wait while we calculate taxes, statutory deductions, and generate payslips for August 2026.</p>
          
          <div className="space-y-5 text-left max-w-sm mx-auto">
            <div className="flex items-center gap-3.5">
              {processStep >= 1 ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : <Clock className="w-5 h-5 text-slate-300 shrink-0" />}
              <span className={cn("text-xs sm:text-sm font-bold uppercase tracking-wider", processStep >= 1 ? "text-slate-900" : "text-slate-400")}>Calculating Earnings & Deductions</span>
            </div>
            <div className="flex items-center gap-3.5">
              {processStep >= 2 ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : <Clock className="w-5 h-5 text-slate-300 shrink-0" />}
              <span className={cn("text-xs sm:text-sm font-bold uppercase tracking-wider", processStep >= 2 ? "text-slate-900" : "text-slate-400")}>Generating Payslips</span>
            </div>
            <div className="flex items-center gap-3.5">
              {processStep >= 3 ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" /> : <Clock className="w-5 h-5 text-slate-300 shrink-0" />}
              <span className={cn("text-xs sm:text-sm font-bold uppercase tracking-wider", processStep >= 3 ? "text-slate-900" : "text-slate-400")}>Initiating Bank Transfers</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Payroll & Salary</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">Manage salary structures, process payroll disbursements, and access payslips.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={handleRunPayroll}
            className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200 flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
          >
            <Calculator className="w-4 h-4" /> Run Payroll
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-slate-200 overflow-x-auto no-scrollbar">
        {[
          { id: 'overview', label: 'Monthly Overview' },
          { id: 'structures', label: 'Salary Structures' },
          { id: 'payslips', label: 'Generated Payslips' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "pb-3 text-xs sm:text-[10px] font-bold uppercase tracking-widest transition-colors relative whitespace-nowrap min-h-[40px] flex items-center cursor-pointer",
              activeTab === tab.id ? "text-blue-600" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* TAB: MONTHLY OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* SECTION 12: PREVIOUS MONTHS PAYSLIP SELECTOR (HORIZONTAL CHIPS) */}
          <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-blue-600" /> Select Pay Period
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Cycle: Monthly</span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {previousMonths.map((m) => {
                const isSelected = selectedMonth === m;
                return (
                  <button
                    key={m}
                    onClick={() => {
                      setSelectedMonth(m);
                      showToast(`Showing salary overview for ${m}`);
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer border min-h-[40px] flex items-center gap-1.5",
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    )}
                  >
                    <CheckCircle2 className={cn("w-3 h-3", isSelected ? "text-white" : "text-slate-400")} />
                    {m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 12: DEDICATED MONTHLY OVERVIEW CARD */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            {/* Header: Net Salary + Pay Date + Status */}
            <div className="p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 text-white">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <span className="text-[10px] font-bold tracking-widest uppercase text-blue-200 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-amber-300" /> {selectedMonth} Net Salary
                  </span>
                  <div className="text-3xl sm:text-4xl font-bold font-mono tracking-tight text-white mt-1">
                    {formatCurrency(defaultStructure.net)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                    Paid
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs text-slate-300">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-300" />
                  {defaultStructure.name} &bull; {defaultStructure.role}
                </span>
                <span className="flex items-center gap-1.5 font-mono text-slate-300">
                  <Calendar className="w-3.5 h-3.5 text-blue-300" />
                  Pay Date: {defaultSlip.date}
                </span>
              </div>
            </div>

            {/* SECTION 12: EARNINGS & DEDUCTIONS CLEAN BREAKDOWN LIST */}
            <div className="p-5 sm:p-6 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Earnings & Deductions Breakdown
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                    <span className="text-emerald-700">Gross Earnings</span>
                    <span className="font-mono text-emerald-700">
                      +{formatCurrency(defaultStructure.base + defaultStructure.hra + defaultStructure.special)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Basic Salary</span>
                    <span className="font-mono font-medium text-slate-900">{formatCurrency(defaultStructure.base)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>House Rent Allowance (HRA)</span>
                    <span className="font-mono font-medium text-slate-900">{formatCurrency(defaultStructure.hra)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Special Allowance</span>
                    <span className="font-mono font-medium text-slate-900">{formatCurrency(defaultStructure.special)}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 border-b border-slate-200 pb-2">
                    <span className="text-rose-700">Total Deductions</span>
                    <span className="font-mono text-rose-700">
                      -{formatCurrency(defaultStructure.pf + defaultStructure.tax)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>PF Deduction</span>
                    <span className="font-mono font-medium text-rose-600">-{formatCurrency(defaultStructure.pf)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Professional Tax</span>
                    <span className="font-mono font-medium text-rose-600">-{formatCurrency(defaultStructure.tax)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>TDS / Income Tax</span>
                    <span className="font-mono font-medium text-slate-400">₹0</span>
                  </div>
                </div>
              </div>

              {/* SECTION 12: ACTIONS: DOWNLOAD PAYSLIP (PDF) & SEND TO WHATSAPP / EMAIL */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 border-t border-slate-100">
                <button
                  onClick={() => handleDownloadPayslip(defaultSlip)}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm shadow-blue-200 transition-colors min-h-[44px] cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Payslip (PDF)
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleShareWhatsApp(defaultSlip)}
                    className="flex-1 sm:flex-none px-3.5 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-600" /> Send to WhatsApp
                  </button>
                  <button
                    onClick={() => handleShareEmail(defaultSlip)}
                    className="flex-1 sm:flex-none px-3.5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer"
                  >
                    <Mail className="w-4 h-4 text-slate-600" /> Email
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Metric Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-100 flex flex-col justify-between">
              <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 mb-3 border border-slate-100">
                <DollarSign className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Total Payroll Cost</p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-mono tracking-tight">₹14,52,400</h3>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-100 flex flex-col justify-between">
              <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 mb-3 border border-slate-100">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Processed</p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-mono tracking-tight">42 <span className="text-xs text-slate-500 font-medium font-sans">Staff</span></h3>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-100 flex flex-col justify-between">
              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mb-3 border border-orange-100">
                <Clock className="w-4 h-4" />
              </div>
              <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-1">Pending Run</p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-mono tracking-tight">156 <span className="text-xs text-slate-500 font-medium font-sans">Staff</span></h3>
            </div>
            <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-100 flex flex-col justify-between">
              <div className="w-9 h-9 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 mb-3 border border-slate-100">
                <CreditCard className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Next Pay Date</p>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-mono tracking-tight">Aug 31</h3>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl shadow-2xs border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 mb-1">August 2026 Payroll Cycle</h3>
              <p className="text-xs text-slate-500">Review employee attendance, bonuses, and statutory deductions before processing.</p>
            </div>
            <button 
              onClick={handleRunPayroll}
              className="w-full md:w-auto px-5 py-2.5 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-800 transition-colors shadow-sm whitespace-nowrap min-h-[44px] cursor-pointer"
            >
              Start Payroll Run
            </button>
          </div>
        </div>
      )}

      {/* TAB: SALARY STRUCTURES (MOBILE CARDS + DESKTOP TABLE) */}
      {activeTab === 'structures' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">Salary Structures</h2>
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search employees..." 
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400 min-h-[40px]"
              />
            </div>
          </div>

          {/* MOBILE SALARY STRUCTURE CARDS */}
          <div className="lg:hidden p-3 space-y-3">
            {mockStructures.map((s) => (
              <div key={s.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{s.name}</h4>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.id} &bull; {s.role}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Net Monthly</span>
                    <span className="text-sm font-bold font-mono text-slate-900">{formatCurrency(s.net)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Base Salary</span>
                    <span className="font-mono font-medium text-slate-700">{formatCurrency(s.base)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Allowances</span>
                    <span className="font-mono font-medium text-emerald-600">+{formatCurrency(s.hra + s.special)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Deductions</span>
                    <span className="font-mono font-medium text-rose-600">-{formatCurrency(s.pf + s.tax)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-end">
                  <button
                    onClick={() => showToast(`Editing structure for ${s.name}`)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-bold transition-colors cursor-pointer min-h-[36px]"
                  >
                    Edit Structure
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP SALARY STRUCTURE TABLE */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Base Salary</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Allowances</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Deductions</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Net Monthly</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {mockStructures.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{s.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.id} • {s.role}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-mono text-slate-700">{formatCurrency(s.base)}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-mono text-green-600">+{formatCurrency(s.hra + s.special)}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-mono text-red-500">-{formatCurrency(s.pf + s.tax)}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-mono font-bold text-slate-900">{formatCurrency(s.net)}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <button 
                        onClick={() => showToast(`Editing structure for ${s.name}`)}
                        className="text-[10px] font-bold uppercase tracking-wider text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: GENERATED PAYSLIPS (MOBILE CARDS + DESKTOP TABLE) */}
      {activeTab === 'payslips' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <h2 className="font-bold text-slate-800 text-sm sm:text-base">Generated Payslips</h2>
            <div className="flex gap-3">
              <select className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-700 outline-none min-h-[40px]">
                <option>July 2026</option>
                <option>June 2026</option>
                <option>May 2026</option>
              </select>
            </div>
          </div>

          {/* MOBILE PAYSLIPS CARDS */}
          <div className="lg:hidden p-3 space-y-3">
            {mockPayslips.map((slip) => (
              <div key={slip.id} className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{slip.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono block">{slip.id} &bull; {slip.empId}</span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {slip.status}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                  <span className="text-slate-500">Pay Period: <strong className="text-slate-700">{slip.month}</strong></span>
                  <span className="text-slate-900 font-bold font-mono text-sm">{formatCurrency(slip.amount)}</span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleDownloadPayslip(slip)}
                    className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors min-h-[40px] cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    onClick={() => handleShareWhatsApp(slip)}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[40px] cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> WhatsApp
                  </button>
                  <button
                    onClick={() => handleShareEmail(slip)}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1 min-h-[40px] cursor-pointer"
                  >
                    <Mail className="w-3.5 h-3.5 text-slate-600" /> Email
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP PAYSLIPS TABLE */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document ID</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Month</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Amount</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Status</th>
                  <th className="py-3 px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {mockPayslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6 whitespace-nowrap font-mono text-xs font-bold text-slate-900">{slip.id}</td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{slip.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{slip.empId}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-slate-600 font-medium">{slip.month}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-right font-mono font-bold text-slate-900">{formatCurrency(slip.amount)}</td>
                    <td className="py-4 px-6 whitespace-nowrap text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-600">
                        {slip.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleDownloadPayslip(slip)}
                          title="Download PDF" 
                          className="p-2 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleShareWhatsApp(slip)}
                          title="Share to WhatsApp" 
                          className="p-2 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleShareEmail(slip)}
                          title="Email Payslip" 
                          className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Mail className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

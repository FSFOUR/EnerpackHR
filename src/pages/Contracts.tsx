import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileText, Plus, Download, Printer, Eye, CheckCircle2, 
  Search, Shield, Briefcase, Calendar, User, FileSignature, X, ArrowLeft,
  FileCheck, AlertCircle, Sparkles, Building2, HelpCircle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { ENERPACK_EMPLOYEE_MASTER, maskAadhaar } from '../data/enerpackEmployeeMaster';
import { useEmployees } from '../context/EmployeeContext';
import { mapEmployeeToContractFields, MappedContractFields } from '../template-engine/contractFieldMapper';
import { generateContractPdf } from '../template-engine/contractPdfConverter';
import { generateContractDocxBlob, downloadBlob } from '../template-engine/contractDocxGenerator';
import { validateContract, ContractValidationResult } from '../template-engine/contractValidator';
import { MASTER_CONTRACT_TEMPLATES, getMasterTemplateByType } from '../template-engine/contractTemplateLoader';

export interface ContractRecord {
  id: string;
  agreementNumber: string;
  employeeId: string;
  employeeName: string;
  contractType: 'Residential' | 'Non-Residential / Other State Employee';
  agreementDate: string;
  joiningDate: string;
  designation: string;
  department: string;
  otClassification: string;
  basicSalary: number;
  status: 'Active' | 'Draft' | 'Signed' | 'Superseded';
  generatedDate: string;
  pagesCount: number;
}

export const Contracts: React.FC = () => {
  const [searchParams] = useSearchParams();
  const preSelectedEmpId = searchParams.get('empId');
  const preAction = searchParams.get('action');
  const preType = searchParams.get('type');

  const { employees } = useEmployees();
  const employeeList = useMemo(() => {
    if (employees && employees.length > 0) return employees;
    try {
      const saved = localStorage.getItem('enerpack_employees_master');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // ignore
    }
    return ENERPACK_EMPLOYEE_MASTER;
  }, [employees]);

  const [activeTab, setActiveTab] = useState<'list' | 'generate' | 'blank' | 'templates'>(
    preAction === 'generate' ? 'generate' : 'list'
  );
  const [selectedEmpId, setSelectedEmpId] = useState<string>(preSelectedEmpId || employeeList[0]?.id || 'ENR001');
  const [contractType, setContractType] = useState<'Residential' | 'Non-Residential / Other State Employee'>(
    preType && preType.includes('Non') ? 'Non-Residential / Other State Employee' : 'Residential'
  );
  
  // Contract specific inputs
  const [agreementDate, setAgreementDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [probationPeriod, setProbationPeriod] = useState<string>('3 Months');
  const [noticePeriod, setNoticePeriod] = useState<string>("45 days'");
  const [workLocation, setWorkLocation] = useState<string>('Enerpack Primary Plant, Kerala');
  const [allowances, setAllowances] = useState<string>('Standard HRA & Medical Allowance');
  const [remarks, setRemarks] = useState<string>('Standard Enerpack Employment Terms & Conditions Applied.');

  // Preview Modal state
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewTitle, setPreviewTitle] = useState<string>('');
  const [validationReport, setValidationReport] = useState<ContractValidationResult | null>(null);
  const [isGeneratingDocx, setIsGeneratingDocx] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Contracts storage state
  const [contractsList, setContractsList] = useState<ContractRecord[]>([
    {
      id: 'CON-001',
      agreementNumber: 'ENR-CON-2026-0001',
      employeeId: employeeList[0]?.id || 'ENR001',
      employeeName: employeeList[0]?.name || 'SHAFI PARA THADATHIL',
      contractType: 'Residential',
      agreementDate: '2026-01-15',
      joiningDate: employeeList[0]?.joinDate || '2022-03-15',
      designation: employeeList[0]?.occupation || 'Operations Head',
      department: employeeList[0]?.department || 'Operations',
      otClassification: employeeList[0]?.otEligibility || 'Monthly Staff (Fixed)',
      basicSalary: employeeList[0]?.basicSalary || 45000,
      status: 'Active',
      generatedDate: '2026-01-15',
      pagesCount: 3,
    },
    {
      id: 'CON-002',
      agreementNumber: 'ENR-CON-2026-0002',
      employeeId: employeeList[1]?.id || 'ENR002',
      employeeName: employeeList[1]?.name || 'MOHAMMED RAFI',
      contractType: 'Non-Residential / Other State Employee',
      agreementDate: '2026-02-01',
      joiningDate: employeeList[1]?.joinDate || '2023-01-10',
      designation: employeeList[1]?.occupation || 'Technician',
      department: employeeList[1]?.department || 'Production',
      otClassification: 'OT Employee',
      basicSalary: 28000,
      status: 'Active',
      generatedDate: '2026-02-01',
      pagesCount: 3,
    }
  ]);

  const selectedEmployee = useMemo(() => {
    return employeeList.find(e => e.id === selectedEmpId) || employeeList[0];
  }, [selectedEmpId, employeeList]);

  const generatedAgreementNo = useMemo(() => {
    const nextNum = contractsList.length + 1;
    return `ENR-CON-2026-${String(nextNum).padStart(4, '0')}`;
  }, [contractsList]);

  // Clean up blob URL on unmount or change
  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  // Current mapped fields for live preview
  const currentMappedFields = useMemo(() => {
    return mapEmployeeToContractFields(selectedEmployee, {
      agreementNo: generatedAgreementNo,
      agreementDate,
      contractType,
      probationPeriod,
      noticePeriod,
      workLocation,
      allowances,
    });
  }, [selectedEmployee, generatedAgreementNo, agreementDate, contractType, probationPeriod, noticePeriod, workLocation, allowances]);

  // Generate & Download PDF using the authoritative template engine
  const handleGeneratePdf = (isDownload = true, isBlank = false, targetType = contractType) => {
    const fields = isBlank
      ? mapEmployeeToContractFields(null, { isBlank: true, contractType: targetType })
      : mapEmployeeToContractFields(selectedEmployee, {
          agreementNo: generatedAgreementNo,
          agreementDate,
          contractType: targetType,
          probationPeriod,
          noticePeriod,
          workLocation,
          allowances,
        });

    const doc = generateContractPdf(fields, isBlank);
    const valResult = validateContract(doc, fields, isBlank);
    setValidationReport(valResult);

    const docName = isBlank
      ? `Enerpack_Blank_Contract_${targetType === 'Residential' ? 'Residential_3Pages' : 'Non_Residential_3Pages'}.pdf`
      : `Enerpack_Contract_${fields.staffNo || 'Agreement'}_${targetType === 'Residential' ? 'Residential' : 'NonResidential'}.pdf`;

    if (isDownload) {
      doc.save(docName);
      showToast(`Successfully downloaded ${docName} (${valResult.actualPageCount} Pages)`);
    } else {
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      setPreviewBlobUrl(blobUrl);
      setPreviewTitle(isBlank ? `Blank Contract Agreement (${targetType})` : `${fields.fullName} (${targetType})`);
    }
  };

  // Generate & Download DOCX using the docx template generator
  const handleGenerateDocx = async (isBlank = false, targetType = contractType) => {
    setIsGeneratingDocx(true);
    try {
      const fields = isBlank
        ? mapEmployeeToContractFields(null, { isBlank: true, contractType: targetType })
        : mapEmployeeToContractFields(selectedEmployee, {
            agreementNo: generatedAgreementNo,
            agreementDate,
            contractType: targetType,
            probationPeriod,
            noticePeriod,
            workLocation,
            allowances,
          });

      const blob = await generateContractDocxBlob(fields, isBlank);
      const filename = isBlank
        ? `Enerpack_Master_Blank_Contract_${targetType === 'Residential' ? 'Residential' : 'Non_Residential'}.docx`
        : `Enerpack_Employee_Contract_${fields.staffNo || 'Agreement'}_${targetType === 'Residential' ? 'Residential' : 'Non_Residential'}.docx`;

      downloadBlob(blob, filename);
      showToast(`Generated & downloaded official Word document: ${filename}`);
    } catch (err) {
      console.error('DOCX generation error:', err);
      showToast('Error generating DOCX document. Please check inputs.');
    } finally {
      setIsGeneratingDocx(false);
    }
  };

  const handleSaveContractRecord = () => {
    const newRecord: ContractRecord = {
      id: `CON-${Date.now().toString().slice(-4)}`,
      agreementNumber: generatedAgreementNo,
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      contractType: contractType,
      agreementDate: agreementDate,
      joiningDate: selectedEmployee.joinDate,
      designation: selectedEmployee.occupation,
      department: selectedEmployee.department || 'Operations',
      otClassification: selectedEmployee.otEligibility,
      basicSalary: selectedEmployee.basicSalary || 25000,
      status: 'Active',
      generatedDate: new Date().toISOString().slice(0, 10),
      pagesCount: contractType === 'Residential' ? 3 : 4,
    };

    setContractsList(prev => [newRecord, ...prev]);
    showToast(`Contract ${generatedAgreementNo} successfully saved & recorded!`);
    setActiveTab('list');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 select-none px-2 sm:px-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-4 sm:right-6 z-50 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Employee Contract Agreements</h1>
            <span className="text-[11px] font-extrabold px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
              Master Document Engine
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Exact template fidelity • Indian Rupee (₹) preserved • Exactly 3 A4 Pages for All Contracts
          </p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('templates')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Building2 className="w-3.5 h-3.5" /> Master Templates
          </button>
          <button
            onClick={() => setActiveTab('blank')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <FileText className="w-3.5 h-3.5" /> Blank Agreement
          </button>
          <button
            onClick={() => setActiveTab('generate')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" /> Generate New Contract
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('list')}
          className={cn(
            "px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer shrink-0",
            activeTab === 'list' ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          )}
        >
          All Contracts ({contractsList.length})
        </button>
        <button
          onClick={() => setActiveTab('generate')}
          className={cn(
            "px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer shrink-0",
            activeTab === 'generate' ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          )}
        >
          Contract Generator
        </button>
        <button
          onClick={() => setActiveTab('blank')}
          className={cn(
            "px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer shrink-0",
            activeTab === 'blank' ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          )}
        >
          Blank Agreement Printing
        </button>
        <button
          onClick={() => setActiveTab('templates')}
          className={cn(
            "px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer shrink-0",
            activeTab === 'templates' ? "bg-blue-600 text-white shadow-xs" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
          )}
        >
          Master Documents (DOCX)
        </button>
      </div>

      {/* TAB 1: ALL CONTRACTS LIST */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm">Active & Historical Contract Records</h3>
              <p className="text-xs text-slate-500">Each contract adheres strictly to the authoritative Enerpack document schema.</p>
            </div>
            <span className="text-xs font-bold text-slate-400">{contractsList.length} Total Records</span>
          </div>
          <div className="divide-y divide-slate-100">
            {contractsList.map(c => (
              <div key={c.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-bold shrink-0">
                    <FileSignature className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-slate-900 text-sm">{c.employeeName}</p>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                        {c.contractType}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                        {c.pagesCount} Pages
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Agreement No: <span className="font-mono font-semibold text-slate-700">{c.agreementNumber}</span> &bull; Staff No: {c.employeeId} &bull; Generated: {c.generatedDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className={cn(
                    "px-2.5 py-1 text-xs font-extrabold rounded-lg border",
                    c.status === 'Active' ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                  )}>
                    {c.status}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedEmpId(c.employeeId);
                      setContractType(c.contractType);
                      handleGeneratePdf(false, false, c.contractType);
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEmpId(c.employeeId);
                      setContractType(c.contractType);
                      handleGeneratePdf(true, false, c.contractType);
                    }}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    onClick={() => {
                      setSelectedEmpId(c.employeeId);
                      setContractType(c.contractType);
                      handleGenerateDocx(false, c.contractType);
                    }}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border border-indigo-200"
                  >
                    <FileText className="w-3.5 h-3.5" /> DOCX
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: CONTRACT GENERATOR WORKFLOW */}
      {activeTab === 'generate' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left/Main Column: Employee Master Info & Contract Type */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Select Employee from Master */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-blue-600" /> Step 1: Select Employee from Employee Master
                  </h3>
                  <span className="text-xs font-bold text-slate-400">Single Source of Truth</span>
                </div>
                
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">Select Employee</label>
                  <select
                    value={selectedEmpId}
                    onChange={(e) => setSelectedEmpId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {employeeList.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.id} - {emp.name} ({emp.occupation || 'Staff'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Two-Column Auto-Populated Employee Details Table Preview */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-extrabold text-slate-700">Section 1: Auto-Populated Two-Column Layout</p>
                    <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Standard Master Alignment
                    </span>
                  </div>
                  
                  <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                    <div className="grid grid-cols-12 bg-blue-700 text-white font-bold px-3 py-2">
                      <div className="col-span-12 font-extrabold tracking-wide">1. EMPLOYEE DETAILS</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      <div className="grid grid-cols-12">
                        <div className="col-span-4 sm:col-span-5 px-3 py-2 bg-blue-50/60 font-bold text-slate-700 border-r border-slate-200">Employee Full Name</div>
                        <div className="col-span-8 sm:col-span-7 px-3 py-2 bg-white font-bold text-slate-900">{selectedEmployee.name}</div>
                      </div>
                      <div className="grid grid-cols-12">
                        <div className="col-span-4 sm:col-span-5 px-3 py-2 bg-blue-50/60 font-bold text-slate-700 border-r border-slate-200">Staff No.</div>
                        <div className="col-span-8 sm:col-span-7 px-3 py-2 bg-white font-mono font-semibold text-slate-900">{selectedEmployee.id}</div>
                      </div>
                      <div className="grid grid-cols-12">
                        <div className="col-span-4 sm:col-span-5 px-3 py-2 bg-blue-50/60 font-bold text-slate-700 border-r border-slate-200">Age / Date of Birth</div>
                        <div className="col-span-8 sm:col-span-7 px-3 py-2 bg-white text-slate-800">{currentMappedFields.ageDob}</div>
                      </div>
                      <div className="grid grid-cols-12">
                        <div className="col-span-4 sm:col-span-5 px-3 py-2 bg-blue-50/60 font-bold text-slate-700 border-r border-slate-200">Aadhaar No. (if lawfully required)</div>
                        <div className="col-span-8 sm:col-span-7 px-3 py-2 bg-white font-mono text-slate-800">{currentMappedFields.aadhaar}</div>
                      </div>
                      <div className="grid grid-cols-12">
                        <div className="col-span-4 sm:col-span-5 px-3 py-2 bg-blue-50/60 font-bold text-slate-700 border-r border-slate-200">Permanent Address</div>
                        <div className="col-span-8 sm:col-span-7 px-3 py-2 bg-white text-slate-800">{currentMappedFields.permAddress}</div>
                      </div>
                      <div className="grid grid-cols-12">
                        <div className="col-span-4 sm:col-span-5 px-3 py-2 bg-blue-50/60 font-bold text-slate-700 border-r border-slate-200">Current Address</div>
                        <div className="col-span-8 sm:col-span-7 px-3 py-2 bg-white text-slate-800">{currentMappedFields.currAddress}</div>
                      </div>
                      <div className="grid grid-cols-12">
                        <div className="col-span-4 sm:col-span-5 px-3 py-2 bg-blue-50/60 font-bold text-slate-700 border-r border-slate-200">Mobile / Email</div>
                        <div className="col-span-8 sm:col-span-7 px-3 py-2 bg-white text-slate-800">{currentMappedFields.mobileEmail}</div>
                      </div>
                      <div className="grid grid-cols-12">
                        <div className="col-span-4 sm:col-span-5 px-3 py-2 bg-blue-50/60 font-bold text-slate-700 border-r border-slate-200">Emergency Contact</div>
                        <div className="col-span-8 sm:col-span-7 px-3 py-2 bg-white text-slate-800">{currentMappedFields.emergencyContact}</div>
                      </div>
                      <div className="grid grid-cols-12">
                        <div className="col-span-4 sm:col-span-5 px-3 py-2 bg-blue-50/60 font-bold text-slate-700 border-r border-slate-200">Designation / Department</div>
                        <div className="col-span-8 sm:col-span-7 px-3 py-2 bg-white font-semibold text-slate-900">{currentMappedFields.designationDept}</div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 2. Contract Type Selection */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" /> Step 2: Contract Version (Enforces Exact Page Count)
                  </h3>
                  <span className="text-xs font-bold text-blue-600">
                    Exactly 3 Pages (A4)
                  </span>
                </div>
                <p className="text-xs text-slate-500">Select the applicable contract version. The engine preserves the exact page breaks and clauses.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <label className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    contractType === 'Residential' ? "bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/20" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  )}>
                    <input 
                      type="radio" 
                      name="contractType" 
                      checked={contractType === 'Residential'}
                      onChange={() => setContractType('Residential')}
                      className="mt-0.5 h-4 w-4 text-blue-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm block">Residential Agreement</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">3 Pages</span>
                      </div>
                      <span className="text-xs text-slate-500 leading-relaxed block mt-1">
                        Clauses 1–20. Standard Enerpack employment agreement with common terms, rules, and dual acceptance tables on Page 3.
                      </span>
                    </div>
                  </label>

                  <label className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all",
                    contractType === 'Non-Residential / Other State Employee' ? "bg-blue-50/60 border-blue-600 ring-2 ring-blue-500/20" : "bg-slate-50 border-slate-200 hover:border-slate-300"
                  )}>
                    <input 
                      type="radio" 
                      name="contractType" 
                      checked={contractType === 'Non-Residential / Other State Employee'}
                      onChange={() => setContractType('Non-Residential / Other State Employee')}
                      className="mt-0.5 h-4 w-4 text-blue-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-slate-900 text-sm block">Non-Residential / Other State</span>
                        <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">3 Pages</span>
                      </div>
                      <span className="text-xs text-slate-500 leading-relaxed block mt-1">
                        Clauses 1–21. Includes Clause 20 (travel tickets, accommodation, plastic/waste rules, uniform) with dual acceptance tables on Page 3.
                      </span>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            {/* Right Column: Contract Metadata & Actions */}
            <div className="space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-slate-900">Step 3: Parameters & Actions</h3>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> ₹ Preserved
                  </div>
                </div>
                
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Agreement No. (Auto-Generated)</label>
                    <input 
                      type="text" 
                      value={generatedAgreementNo} 
                      disabled 
                      className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Agreement Date</label>
                    <input 
                      type="date" 
                      value={agreementDate} 
                      onChange={(e) => setAgreementDate(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Primary Work Location</label>
                    <input 
                      type="text" 
                      value={workLocation} 
                      onChange={(e) => setWorkLocation(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Basic / Gross Salary</label>
                    <div className="px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-emerald-700 flex items-center justify-between">
                      <span>₹{Number(selectedEmployee.basicSalary || 20000).toLocaleString('en-IN')} / month</span>
                      <span className="text-[10px] text-slate-500 font-sans font-normal">From Master</span>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Probation Period</label>
                    <input 
                      type="text" 
                      value={probationPeriod} 
                      onChange={(e) => setProbationPeriod(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Resignation Notice Period</label>
                    <input 
                      type="text" 
                      value={noticePeriod} 
                      onChange={(e) => setNoticePeriod(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Approved Allowances / Benefits</label>
                    <input 
                      type="text" 
                      value={allowances} 
                      onChange={(e) => setAllowances(e.target.value)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => handleGeneratePdf(false, false)}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Eye className="w-4 h-4" /> Visual Preview (High Fidelity)
                  </button>

                  <button
                    onClick={() => handleGeneratePdf(true, false)}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <Download className="w-4 h-4" /> Download Official PDF (3 Pages)
                  </button>

                  <button
                    onClick={() => handleGenerateDocx(false)}
                    disabled={isGeneratingDocx}
                    className="w-full py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer border border-indigo-200 transition-colors"
                  >
                    <FileText className="w-4 h-4" /> {isGeneratingDocx ? 'Generating Word...' : 'Download Official Word (DOCX)'}
                  </button>

                  <button
                    onClick={handleSaveContractRecord}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Save Contract Record
                  </button>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* TAB 3: BLANK AGREEMENT PRINTING */}
      {activeTab === 'blank' && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs max-w-2xl mx-auto space-y-6 text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <FileText className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900">Generate Blank Employee Agreement</h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Print official Enerpack employment agreements with blank employee details boxes and signature fields for manual physical use.
            </p>
          </div>

          <div className="space-y-3 text-left max-w-md mx-auto pt-2">
            <label className="block text-xs font-bold text-slate-700">Select Contract Template Version</label>
            <div className="grid grid-cols-1 gap-3">
              <label className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer",
                contractType === 'Residential' ? "bg-blue-50/50 border-blue-600 font-bold" : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="blankType" 
                    checked={contractType === 'Residential'}
                    onChange={() => setContractType('Residential')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-xs text-slate-900">Residential Blank Agreement</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  3 Pages
                </span>
              </label>

              <label className={cn(
                "flex items-center justify-between p-3.5 rounded-xl border cursor-pointer",
                contractType === 'Non-Residential / Other State Employee' ? "bg-blue-50/50 border-blue-600 font-bold" : "bg-slate-50 border-slate-200"
              )}>
                <div className="flex items-center gap-3">
                  <input 
                    type="radio" 
                    name="blankType" 
                    checked={contractType === 'Non-Residential / Other State Employee'}
                    onChange={() => setContractType('Non-Residential / Other State Employee')}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="text-xs text-slate-900">Non-Residential / Other State Blank Agreement</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                  3 Pages
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => handleGeneratePdf(false, true)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Eye className="w-4 h-4" /> Preview Blank PDF
            </button>
            <button
              onClick={() => handleGeneratePdf(true, true)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
            >
              <Download className="w-4 h-4" /> Download Blank PDF
            </button>
            <button
              onClick={() => handleGenerateDocx(true)}
              className="px-5 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer border border-indigo-200 transition-colors"
            >
              <FileText className="w-4 h-4" /> Download Blank DOCX
            </button>
          </div>
        </div>
      )}

      {/* TAB 4: MASTER DOCUMENTS (DOCX) LIBRARY */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-indigo-50 text-indigo-700 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Authoritative Master Contract Documents</h2>
                <p className="text-xs text-slate-500">Official Enerpack master contracts stored in <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-700">/templates/contracts</code> for legal compliance.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
              {MASTER_CONTRACT_TEMPLATES.map(tmpl => (
                <div key={tmpl.id} className="p-5 border border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-white hover:border-blue-300 transition-all space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {tmpl.pageCount} Pages • {tmpl.clausesCount} Clauses
                      </span>
                      <h3 className="font-extrabold text-slate-900 text-sm mt-1.5">{tmpl.name}</h3>
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      DOCX
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">{tmpl.description}</p>

                  <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                    <a
                      href={tmpl.docxUrl}
                      download={tmpl.docxFilename}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Download className="w-3.5 h-3.5" /> Download Master DOCX
                    </a>
                    <button
                      onClick={() => handleGeneratePdf(false, true, tmpl.contractType)}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview Format
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Visual Contract Preview Modal */}
      {previewBlobUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-sm">Contract Preview: {previewTitle}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>Master Layout Verified</span>
                    {validationReport && (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.2 rounded border border-emerald-200">
                        {validationReport.actualPageCount} Pages Enforced (100% Valid)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const iframe = document.getElementById('contract-preview-iframe') as HTMLIFrameElement;
                    if (iframe && iframe.contentWindow) {
                      iframe.contentWindow.print();
                    } else {
                      window.open(previewBlobUrl, '_blank');
                    }
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = previewBlobUrl;
                    a.download = `Enerpack_Contract_Agreement_${contractType.slice(0, 11)}.pdf`;
                    a.click();
                  }}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
                <button
                  onClick={() => {
                    URL.revokeObjectURL(previewBlobUrl);
                    setPreviewBlobUrl(null);
                  }}
                  className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body: PDF Display */}
            <div className="flex-1 bg-slate-200/70 p-2 sm:p-4 overflow-hidden relative">
              <iframe
                id="contract-preview-iframe"
                src={previewBlobUrl}
                title="Contract Preview"
                className="w-full h-full rounded-xl bg-white shadow-md border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import React, { useState, useMemo, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Search, Plus, Filter, Folder, File, FileText, FileSignature, Download, 
  Trash2, ShieldAlert, ShieldCheck, Eye, Upload, CheckCircle2, X, 
  Clock, Lock, Unlock, HardDrive, ArrowUpDown, ChevronRight, User, 
  Building, AlertCircle, RefreshCw, FileCode, CheckSquare, Square,
  MoreVertical, Edit3, Share2, Tag, Layers, Database, AlertTriangle
} from 'lucide-react';
import { cn } from '../lib/utils';
import { WarningLetter } from '../types/warningLetter';
import { INITIAL_WARNING_LETTERS } from '../data/warningLetterData';
import { WarningLettersTab } from '../components/documents/WarningLettersTab';
import { IssueWarningLetterModal } from '../components/documents/IssueWarningLetterModal';
import { WarningLetterPreviewModal } from '../components/documents/WarningLetterPreviewModal';

export interface DocumentItem {
  id: string;
  name: string;
  category: 'Identity Documents' | 'Employment Contracts' | 'Policy Agreements' | 'Payroll' | 'Company Certificates' | 'Medical & Insurance';
  employeeId?: string;
  employeeName?: string;
  fileFormat: 'pdf' | 'docx' | 'png' | 'xlsx' | 'jpg';
  size: string;
  sizeBytes: number;
  uploadedAt: string;
  verified: boolean;
  confidentiality: 'Confidential' | 'Restricted' | 'Internal' | 'Public';
  description?: string;
  tags?: string[];
}

const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'DOC-101',
    name: 'Arjun_Sharma_Employment_Contract.pdf',
    category: 'Employment Contracts',
    employeeId: 'EMP-001',
    employeeName: 'Arjun Sharma',
    fileFormat: 'pdf',
    size: '2.4 MB',
    sizeBytes: 2400000,
    uploadedAt: 'Today, 10:30 AM',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Signed full-time senior software engineer contract agreement with 3-year IP assignment clause.',
    tags: ['Contract', 'Signed', 'Engineering']
  },
  {
    id: 'DOC-102',
    name: 'Ananya_Desai_PAN_Card.jpg',
    category: 'Identity Documents',
    employeeId: 'EMP-004',
    employeeName: 'Ananya Desai',
    fileFormat: 'jpg',
    size: '1.1 MB',
    sizeBytes: 1100000,
    uploadedAt: 'Yesterday, 02:15 PM',
    verified: true,
    confidentiality: 'Confidential',
    description: 'Government PAN card identity verification copy.',
    tags: ['PAN', 'KYC', 'Verified']
  },
  {
    id: 'DOC-103',
    name: 'Company_Leave_Policy_2026_v2.pdf',
    category: 'Policy Agreements',
    fileFormat: 'pdf',
    size: '4.8 MB',
    sizeBytes: 4800000,
    uploadedAt: 'Aug 10, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Annual leave policy update covering maternity, paternity, casual, and privileged leaves.',
    tags: ['HR Policy', 'All Staff', '2026']
  },
  {
    id: 'DOC-104',
    name: 'Rohan_Mehta_Payslip_July_2026.pdf',
    category: 'Payroll',
    employeeId: 'EMP-005',
    employeeName: 'Rohan Mehta',
    fileFormat: 'pdf',
    size: '850 KB',
    sizeBytes: 850000,
    uploadedAt: 'Aug 01, 2026',
    verified: true,
    confidentiality: 'Confidential',
    description: 'Monthly payslip statement with itemized deductions and tax withholdings.',
    tags: ['Payslip', 'Finance', 'July']
  },
  {
    id: 'DOC-105',
    name: 'Enerpack_ISO_27001_Compliance_Certificate.pdf',
    category: 'Company Certificates',
    fileFormat: 'pdf',
    size: '3.2 MB',
    sizeBytes: 3200000,
    uploadedAt: 'Jul 15, 2026',
    verified: true,
    confidentiality: 'Public',
    description: 'Information Security Management System certification issued by TÜV SÜD.',
    tags: ['Compliance', 'ISO27001', 'Security']
  },
  {
    id: 'DOC-106',
    name: 'Priya_Patel_NDA_Agreement.pdf',
    category: 'Employment Contracts',
    employeeId: 'EMP-002',
    employeeName: 'Priya Patel',
    fileFormat: 'pdf',
    size: '1.8 MB',
    sizeBytes: 1800000,
    uploadedAt: 'Jun 20, 2026',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Mutual non-disclosure and intellectual property assignment agreement.',
    tags: ['NDA', 'HR', 'Legal']
  },
  {
    id: 'DOC-107',
    name: 'Vikram_Singh_Aadhaar_Verification.pdf',
    category: 'Identity Documents',
    employeeId: 'EMP-003',
    employeeName: 'Vikram Singh',
    fileFormat: 'pdf',
    size: '920 KB',
    sizeBytes: 920000,
    uploadedAt: 'Jun 12, 2026',
    verified: false,
    confidentiality: 'Confidential',
    description: 'Masked e-Aadhaar identity verification document uploaded during onboarding.',
    tags: ['KYC', 'Aadhaar', 'Pending Review']
  },
  {
    id: 'DOC-108',
    name: 'Group_Health_Insurance_Policy_Card_2026.pdf',
    category: 'Medical & Insurance',
    fileFormat: 'pdf',
    size: '2.1 MB',
    sizeBytes: 2100000,
    uploadedAt: 'May 04, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Star Health corporate group cashless medical cover guide and e-card portal details.',
    tags: ['Insurance', 'Benefits', 'Medical']
  },
  {
    id: 'DOC-109',
    name: 'Form_16_PartA_PartB_Consolidated.xlsx',
    category: 'Payroll',
    fileFormat: 'xlsx',
    size: '1.4 MB',
    sizeBytes: 1400000,
    uploadedAt: 'May 01, 2026',
    verified: true,
    confidentiality: 'Confidential',
    description: 'TDS certificate and tax computation summary under section 203 of IT Act.',
    tags: ['TDS', 'Taxation', 'Form 16']
  },
  {
    id: 'DOC-110',
    name: 'IT_Security_Code_Of_Conduct_v4.docx',
    category: 'Policy Agreements',
    fileFormat: 'docx',
    size: '640 KB',
    sizeBytes: 640000,
    uploadedAt: 'Apr 18, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Guidelines on laptop encryption, remote VPN usage, and clean desk security regulations.',
    tags: ['IT', 'Cybersecurity', 'Compliance']
  }
];

const CATEGORIES = [
  'All Files',
  'Identity Documents',
  'Employment Contracts',
  'Policy Agreements',
  'Payroll',
  'Company Certificates',
  'Medical & Insurance'
] as const;

const EMPLOYEES = [
  { id: 'EMP-001', name: 'Arjun Sharma', dept: 'Engineering', designation: 'Senior Software Engineer' },
  { id: 'EMP-002', name: 'Priya Patel', dept: 'Human Resources', designation: 'Head of People & Culture' },
  { id: 'EMP-003', name: 'Vikram Singh', dept: 'Sales', designation: 'Enterprise Account Executive' },
  { id: 'EMP-004', name: 'Ananya Desai', dept: 'Marketing', designation: 'Digital Marketing Specialist' },
  { id: 'EMP-005', name: 'Rohan Mehta', dept: 'Finance', designation: 'Senior Financial Analyst' },
  { id: 'EMP-006', name: 'Sneha Reddy', dept: 'Operations', designation: 'Supply Chain Coordinator' },
  { id: 'EMP-007', name: 'Kavita Iyer', dept: 'Design', designation: 'Product Designer' },
];

export const Documents: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [warningLetters, setWarningLetters] = useState<WarningLetter[]>(INITIAL_WARNING_LETTERS);
  const [activeTab, setActiveTab] = useState<'all' | 'warning-letters' | 'employee' | 'security'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Files');
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'docx' | 'png' | 'xlsx' | 'jpg'>('all');
  const [confidentialityFilter, setConfidentialityFilter] = useState<'all' | 'Confidential' | 'Restricted' | 'Internal' | 'Public'>('all');
  
  // Selection for bulk operations
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showIssueWarningModal, setShowIssueWarningModal] = useState(false);
  const [selectedWarningLetter, setSelectedWarningLetter] = useState<WarningLetter | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);
  const [editDoc, setEditDoc] = useState<DocumentItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    name: '',
    category: 'Employment Contracts' as DocumentItem['category'],
    employeeId: 'EMP-001',
    isCompanyWide: false,
    fileFormat: 'pdf' as DocumentItem['fileFormat'],
    confidentiality: 'Restricted' as DocumentItem['confidentiality'],
    description: '',
    tags: 'HR, Onboarding',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // Category filter
      if (selectedCategory !== 'All Files' && doc.category !== selectedCategory) {
        return false;
      }
      // Format filter
      if (formatFilter !== 'all' && doc.fileFormat !== formatFilter) {
        return false;
      }
      // Confidentiality filter
      if (confidentialityFilter !== 'all' && doc.confidentiality !== confidentialityFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = doc.name.toLowerCase().includes(q);
        const matchEmp = doc.employeeName?.toLowerCase().includes(q) || false;
        const matchCategory = doc.category.toLowerCase().includes(q);
        const matchDesc = doc.description?.toLowerCase().includes(q) || false;
        const matchTags = doc.tags?.some(t => t.toLowerCase().includes(q)) || false;
        if (!matchName && !matchEmp && !matchCategory && !matchDesc && !matchTags) {
          return false;
        }
      }
      return true;
    });
  }, [documents, selectedCategory, formatFilter, confidentialityFilter, searchQuery]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { 'All Files': documents.length };
    CATEGORIES.forEach(c => {
      if (c !== 'All Files') {
        counts[c] = documents.filter(d => d.category === c).length;
      }
    });
    return counts;
  }, [documents]);

  // Overall storage metrics
  const storageMetrics = useMemo(() => {
    const totalBytes = documents.reduce((acc, d) => acc + d.sizeBytes, 0);
    const totalMb = (totalBytes / (1024 * 1024)).toFixed(1);
    const verifiedCount = documents.filter(d => d.verified).length;
    const restrictedCount = documents.filter(d => d.confidentiality === 'Restricted' || d.confidentiality === 'Confidential').length;
    return {
      totalMb,
      totalCount: documents.length,
      verifiedCount,
      restrictedCount,
      percentUsed: Math.min(100, Math.round((Number(totalMb) / 100) * 100)), // mock 100MB vault
    };
  }, [documents]);

  // Toggle single selection
  const handleToggleSelect = (id: string) => {
    setSelectedDocIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  // Toggle all selection
  const handleToggleSelectAll = () => {
    if (selectedDocIds.length === filteredDocuments.length) {
      setSelectedDocIds([]);
    } else {
      setSelectedDocIds(filteredDocuments.map(d => d.id));
    }
  };

  // Delete single document
  const handleDeleteDoc = (id: string) => {
    const docToDelete = documents.find(d => d.id === id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    setSelectedDocIds(prev => prev.filter(i => i !== id));
    showToast(`"${docToDelete?.name || 'Document'}" was permanently deleted.`);
  };

  // Bulk delete
  const handleBulkDelete = () => {
    if (selectedDocIds.length === 0) return;
    const count = selectedDocIds.length;
    setDocuments(prev => prev.filter(d => !selectedDocIds.includes(d.id)));
    setSelectedDocIds([]);
    showToast(`Successfully deleted ${count} selected document${count > 1 ? 's' : ''}.`);
  };

  // Download PDF / Blob
  const handleDownloadDoc = (docItem: DocumentItem) => {
    try {
      if (docItem.fileFormat === 'pdf') {
        const doc = new jsPDF();
        doc.setFillColor(30, 41, 59);
        doc.rect(0, 0, 210, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text("ENERPACK HR DOCUMENT VAULT", 15, 16);
        
        doc.setTextColor(30, 41, 59);
        doc.setFontSize(20);
        doc.text(docItem.name.replace('.pdf', ''), 15, 45);

        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139);
        doc.text(`Document ID: ${docItem.id}  |  Category: ${docItem.category}`, 15, 55);
        doc.text(`Classification: ${docItem.confidentiality}  |  Verified Status: ${docItem.verified ? 'Verified & Cryptographically Signed' : 'Pending'}`, 15, 62);
        
        if (docItem.employeeName) {
          doc.text(`Associated Employee: ${docItem.employeeName} (${docItem.employeeId})`, 15, 69);
        }

        doc.setDrawColor(226, 232, 240);
        doc.line(15, 75, 195, 75);

        doc.setTextColor(51, 65, 85);
        doc.setFontSize(11);
        doc.text("OFFICIAL ARCHIVE COPY", 15, 88);
        
        const descriptionLines = doc.splitTextToSize(docItem.description || "Official Enerpack enterprise archived document.", 180);
        doc.text(descriptionLines, 15, 98);

        doc.setFontSize(9);
        doc.setTextColor(148, 163, 184);
        doc.text(`Timestamp: ${new Date().toLocaleString()} | Authenticated Vault Export`, 15, 270);

        doc.save(docItem.name);
      } else {
        // Text / CSV simulation
        const content = `Enerpack HR Enterprise Vault Export\nDocument: ${docItem.name}\nCategory: ${docItem.category}\nEmployee: ${docItem.employeeName || 'Company-Wide'}\nClassification: ${docItem.confidentiality}\nDate: ${docItem.uploadedAt}\nDescription: ${docItem.description || ''}\n`;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = docItem.name;
        link.click();
        URL.revokeObjectURL(url);
      }
      showToast(`Downloaded "${docItem.name}".`);
    } catch (err) {
      console.error(err);
      showToast(`Document generated for download: ${docItem.name}`);
    }
  };

  // Bulk download
  const handleBulkDownload = () => {
    if (selectedDocIds.length === 0) return;
    const selected = documents.filter(d => selectedDocIds.includes(d.id));
    selected.forEach((d, idx) => {
      setTimeout(() => {
        handleDownloadDoc(d);
      }, idx * 300);
    });
    showToast(`Initiating download for ${selected.length} files...`);
  };

  // Upload handler
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) {
      showToast('Please enter a valid document file name.');
      return;
    }

    const emp = uploadForm.isCompanyWide 
      ? undefined 
      : EMPLOYEES.find(e => e.id === uploadForm.employeeId);

    const ext = uploadForm.fileFormat;
    let finalName = uploadForm.name.trim();
    if (!finalName.toLowerCase().endsWith(`.${ext}`)) {
      finalName = `${finalName}.${ext}`;
    }

    const randomBytes = Math.floor(Math.random() * (4500000 - 450000) + 450000);
    const sizeStr = randomBytes > 1024 * 1024 
      ? `${(randomBytes / (1024 * 1024)).toFixed(1)} MB` 
      : `${Math.round(randomBytes / 1024)} KB`;

    const tagList = uploadForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newDoc: DocumentItem = {
      id: `DOC-${Date.now().toString().slice(-4)}`,
      name: finalName,
      category: uploadForm.category,
      employeeId: emp?.id,
      employeeName: emp?.name,
      fileFormat: uploadForm.fileFormat,
      size: sizeStr,
      sizeBytes: randomBytes,
      uploadedAt: 'Just now',
      verified: true,
      confidentiality: uploadForm.confidentiality,
      description: uploadForm.description || 'Uploaded via Document Vault Portal.',
      tags: tagList.length > 0 ? tagList : ['Uploaded', uploadForm.category.split(' ')[0]],
    };

    setDocuments(prev => [newDoc, ...prev]);
    setShowUploadModal(false);
    showToast(`Successfully uploaded "${newDoc.name}" to ${newDoc.category}.`);
  };

  // Edit / Update document
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDoc) return;

    setDocuments(prev => prev.map(d => d.id === editDoc.id ? editDoc : d));
    setEditDoc(null);
    showToast(`Document "${editDoc.name}" updated successfully.`);
  };

  // Trigger file selection from input
  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = (file.name.split('.').pop()?.toLowerCase() || 'pdf') as DocumentItem['fileFormat'];
      setUploadForm(prev => ({
        ...prev,
        name: file.name,
        fileFormat: ['pdf', 'docx', 'png', 'xlsx', 'jpg'].includes(ext) ? ext : 'pdf',
      }));
    }
  };

  // Warning Letter Handlers
  const handleIssueWarningLetter = (newLetter: WarningLetter, autoArchive: boolean) => {
    setWarningLetters(prev => [newLetter, ...prev]);
    if (autoArchive) {
      const newDoc: DocumentItem = {
        id: `DOC-${Date.now().toString().slice(-4)}`,
        name: `${newLetter.letterNumber}_${newLetter.employeeName.replace(/\s+/g, '_')}_Warning_Notice.pdf`,
        category: 'Policy Agreements',
        employeeId: newLetter.employeeId,
        employeeName: newLetter.employeeName,
        fileFormat: 'pdf',
        size: '1.2 MB',
        sizeBytes: 1200000,
        uploadedAt: 'Today, Just now',
        verified: true,
        confidentiality: 'Restricted',
        description: `Formal disciplinary warning notice: ${newLetter.subject} (${newLetter.warningLevel}).`,
        tags: ['Warning Letter', 'Disciplinary', newLetter.incidentType]
      };
      setDocuments(prev => [newDoc, ...prev]);
      showToast(`Warning Notice ${newLetter.letterNumber} issued and archived to ${newLetter.employeeName}'s vault.`);
    } else {
      showToast(`Warning Notice ${newLetter.letterNumber} issued successfully.`);
    }
  };

  const handleAcknowledgeWarning = (id: string) => {
    const timestamp = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    setWarningLetters(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: 'Acknowledged',
          acknowledgedAt: timestamp,
          acknowledgedBy: `${l.employeeName} (Digitally Signed)`
        };
      }
      return l;
    }));
    if (selectedWarningLetter && selectedWarningLetter.id === id) {
      setSelectedWarningLetter(prev => prev ? ({
        ...prev,
        status: 'Acknowledged',
        acknowledgedAt: timestamp,
        acknowledgedBy: `${prev.employeeName} (Digitally Signed)`
      }) : null);
    }
    showToast('Warning Letter acknowledged and digitally signed.');
  };

  const handleUpdateWarningStatus = (id: string, newStatus: WarningLetter['status'], appealNote?: string) => {
    setWarningLetters(prev => prev.map(l => {
      if (l.id === id) {
        return {
          ...l,
          status: newStatus,
          ...(appealNote ? { appealNotes: appealNote } : {})
        };
      }
      return l;
    }));
    if (selectedWarningLetter && selectedWarningLetter.id === id) {
      setSelectedWarningLetter(prev => prev ? ({
        ...prev,
        status: newStatus,
        ...(appealNote ? { appealNotes: appealNote } : {})
      }) : null);
    }
    showToast(`Warning record status updated to ${newStatus}.`);
  };

  const handleDeleteWarningLetter = (id: string) => {
    setWarningLetters(prev => prev.filter(l => l.id !== id));
    if (selectedWarningLetter && selectedWarningLetter.id === id) {
      setSelectedWarningLetter(null);
    }
    showToast('Warning Letter record removed.');
  };

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100 flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-blue-600" /> Enterprise Encrypted Document Vault
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">Document Management</h1>
          <p className="text-slate-500 text-sm">Centralized, secure repository for employee KYC, contracts, company policies, tax records, and warning letters.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowIssueWarningModal(true)}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-amber-200 flex items-center gap-2 cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" /> Issue Warning Letter
          </button>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Upload Document
          </button>
        </div>
      </div>

      {/* Storage & Security Overview Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Vault Storage</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{storageMetrics.totalMb} MB <span className="text-xs text-slate-400 font-normal">/ 100 MB</span></p>
            <div className="w-28 bg-slate-100 h-1.5 rounded-full mt-1 overflow-hidden">
              <div className="bg-blue-600 h-full rounded-full" style={{ width: `${storageMetrics.percentUsed}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Archived Documents</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{documents.length} Files</p>
            <span className="text-[10px] text-indigo-600 font-bold">6 Active Categories</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Verified & Signed</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{storageMetrics.verifiedCount} / {documents.length}</p>
            <span className="text-[10px] text-emerald-600 font-bold">100% Tamper Proof</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Confidential / Restricted</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{storageMetrics.restrictedCount} Files</p>
            <span className="text-[10px] text-amber-700 font-bold">Role-Based Access</span>
          </div>
        </div>
      </div>

      {/* Main Category Folders Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {CATEGORIES.map(cat => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts[cat] || 0;
          return (
            <div 
              key={cat} 
              onClick={() => {
                setSelectedCategory(cat);
                if (activeTab !== 'all') setActiveTab('all');
              }}
              className={cn(
                "p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group",
                isSelected 
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200 scale-[1.02]" 
                  : "bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <div className={cn(
                  "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                  isSelected 
                    ? "bg-white/20 text-white" 
                    : "bg-slate-50 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 border border-slate-100"
                )}>
                  {cat === 'All Files' ? <Layers className="w-4 h-4" /> : <Folder className="w-4 h-4 fill-current opacity-30" />}
                </div>
                <span className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full font-mono",
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                )}>
                  {count}
                </span>
              </div>
              <div>
                <h3 className={cn(
                  "font-bold text-xs line-clamp-1",
                  isSelected ? "text-white" : "text-slate-800"
                )}>
                  {cat}
                </h3>
                <p className={cn(
                  "text-[9px] uppercase tracking-wider mt-0.5 font-medium",
                  isSelected ? "text-blue-100" : "text-slate-400"
                )}>
                  {cat === 'All Files' ? 'Master Repository' : 'Directory'}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Tabs and Content Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Navigation Tabs Bar */}
        <div className="px-4 pt-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {[
              { id: 'all', label: 'All Files (Master Table)', count: documents.length },
              { id: 'warning-letters', label: 'Warning Letters', count: warningLetters.length, isWarning: true },
              { id: 'employee', label: 'Employee Vault View' },
              { id: 'security', label: 'Security & Access Matrix' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "px-4 py-2.5 text-xs font-bold uppercase tracking-wider rounded-t-xl transition-all border-b-2 flex items-center gap-2 cursor-pointer",
                  activeTab === tab.id
                    ? tab.id === 'warning-letters'
                      ? "border-amber-600 text-amber-700 bg-white shadow-xs"
                      : "border-blue-600 text-blue-600 bg-white shadow-xs"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60"
                )}
              >
                {tab.id === 'warning-letters' && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                {tab.label}
                {tab.count !== undefined && (
                  <span className={cn(
                    "px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold",
                    activeTab === tab.id 
                      ? tab.id === 'warning-letters' ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-700" 
                      : "bg-slate-200 text-slate-600"
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Active Folder Indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500 pb-2">
            <span className="text-slate-400">Current Scope:</span>
            <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              {selectedCategory}
            </span>
          </div>
        </div>

        {/* Search, Filter & Bulk Actions Bar */}
        {activeTab === 'all' && (
          <div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search file name, employee, tag..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Format Filter */}
              <select
                value={formatFilter}
                onChange={(e) => setFormatFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Formats</option>
                <option value="pdf">PDF (.pdf)</option>
                <option value="docx">Word (.docx)</option>
                <option value="xlsx">Excel (.xlsx)</option>
                <option value="jpg">Image (.jpg / .png)</option>
              </select>

              {/* Sensitivity Filter */}
              <select
                value={confidentialityFilter}
                onChange={(e) => setConfidentialityFilter(e.target.value as any)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Classifications</option>
                <option value="Confidential">Confidential</option>
                <option value="Restricted">Restricted</option>
                <option value="Internal">Internal</option>
                <option value="Public">Public</option>
              </select>
            </div>

            {/* Bulk Action Controls */}
            {selectedDocIds.length > 0 && (
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl">
                <span className="text-xs font-bold text-blue-900 font-mono">
                  {selectedDocIds.length} Selected
                </span>
                <button
                  onClick={handleBulkDownload}
                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Download className="w-3 h-3" /> Download
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 1: ALL FILES TABLE */}
        {activeTab === 'all' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-4 w-10 text-center">
                    <button 
                      onClick={handleToggleSelectAll}
                      className="text-slate-400 hover:text-blue-600 focus:outline-none"
                    >
                      {selectedDocIds.length > 0 && selectedDocIds.length === filteredDocuments.length ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Document Name</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Linked Employee</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classification</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Size</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date Added</th>
                  <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {filteredDocuments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-16 text-slate-400 text-sm">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-slate-400">
                        <Folder className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-slate-700">No documents found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your category, format, or search query filter.</p>
                      <button 
                        onClick={() => { setSelectedCategory('All Files'); setSearchQuery(''); setFormatFilter('all'); setConfidentialityFilter('all'); }}
                        className="mt-3 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold"
                      >
                        Reset All Filters
                      </button>
                    </td>
                  </tr>
                ) : (
                  filteredDocuments.map((doc) => {
                    const isSelected = selectedDocIds.includes(doc.id);
                    return (
                      <tr 
                        key={doc.id} 
                        className={cn(
                          "transition-colors group",
                          isSelected ? "bg-blue-50/40" : "hover:bg-slate-50/80"
                        )}
                      >
                        <td className="py-4 px-4 text-center">
                          <button 
                            onClick={() => handleToggleSelect(doc.id)}
                            className="text-slate-400 hover:text-blue-600 focus:outline-none"
                          >
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-blue-600" />
                            ) : (
                              <Square className="w-4 h-4" />
                            )}
                          </button>
                        </td>

                        {/* File Name & Format Badge */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs uppercase",
                              doc.fileFormat === 'pdf' ? "bg-red-50 text-red-600 border-red-100" :
                              doc.fileFormat === 'docx' ? "bg-blue-50 text-blue-600 border-blue-100" :
                              doc.fileFormat === 'xlsx' ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                              "bg-purple-50 text-purple-600 border-purple-100"
                            )}>
                              {doc.fileFormat === 'pdf' ? <FileText className="w-5 h-5" /> : 
                               doc.fileFormat === 'docx' ? <FileSignature className="w-5 h-5" /> : 
                               doc.fileFormat === 'xlsx' ? <FileCode className="w-5 h-5" /> : 
                               <File className="w-5 h-5" />}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span 
                                  onClick={() => setPreviewDoc(doc)}
                                  className="font-bold text-slate-900 hover:text-blue-600 transition-colors cursor-pointer text-sm"
                                  title={doc.name}
                                >
                                  {doc.name}
                                </span>
                                {doc.verified && (
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" title="Cryptographically Verified" />
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] font-mono text-slate-400">{doc.id}</span>
                                {doc.tags?.slice(0, 2).map((t, idx) => (
                                  <span key={idx} className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.2 rounded font-medium">
                                    #{t}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                            {doc.category}
                          </span>
                        </td>

                        {/* Linked Employee */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          {doc.employeeName ? (
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {doc.employeeName.charAt(0)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-900">{doc.employeeName}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{doc.employeeId}</p>
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-slate-400" /> Company-Wide
                            </span>
                          )}
                        </td>

                        {/* Classification */}
                        <td className="py-4 px-4 whitespace-nowrap">
                          <span className={cn(
                            "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                            doc.confidentiality === 'Restricted' ? "bg-red-50 text-red-700 border border-red-200" :
                            doc.confidentiality === 'Confidential' ? "bg-amber-50 text-amber-700 border border-amber-200" :
                            doc.confidentiality === 'Internal' ? "bg-blue-50 text-blue-700 border border-blue-200" :
                            "bg-slate-100 text-slate-700 border border-slate-200"
                          )}>
                            {doc.confidentiality === 'Restricted' || doc.confidentiality === 'Confidential' ? (
                              <Lock className="w-2.5 h-2.5" />
                            ) : (
                              <Unlock className="w-2.5 h-2.5" />
                            )}
                            {doc.confidentiality}
                          </span>
                        </td>

                        {/* Size */}
                        <td className="py-4 px-4 whitespace-nowrap font-mono text-xs text-slate-600">
                          {doc.size}
                        </td>

                        {/* Date */}
                        <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                          {doc.uploadedAt}
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              onClick={() => setPreviewDoc(doc)}
                              title="Preview Document Details"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDownloadDoc(doc)}
                              title="Download File"
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditDoc(doc)}
                              title="Edit Document Info"
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteDoc(doc.id)}
                              title="Delete File"
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 2: WARNING LETTERS TAB */}
        {activeTab === 'warning-letters' && (
          <div className="p-6">
            <WarningLettersTab
              warningLetters={warningLetters}
              onOpenIssueModal={() => setShowIssueWarningModal(true)}
              onSelectLetter={(letter) => setSelectedWarningLetter(letter)}
              onAcknowledge={handleAcknowledgeWarning}
              onDelete={handleDeleteWarningLetter}
            />
          </div>
        )}

        {/* TAB 2: EMPLOYEE VAULT VIEW */}
        {activeTab === 'employee' && (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Employee Individual Document Dossiers</h3>
                <p className="text-xs text-slate-500">Access and verify KYC, contracts, and compensation slips partitioned by team member.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {EMPLOYEES.map(emp => {
                const empDocs = documents.filter(d => d.employeeId === emp.id);
                return (
                  <div key={emp.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-300 transition-all">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                            {emp.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{emp.name}</h4>
                            <p className="text-xs text-slate-500 font-medium">{emp.dept} &bull; <span className="font-mono">{emp.id}</span></p>
                          </div>
                        </div>
                        <span className="text-xs font-bold bg-white text-slate-700 px-2.5 py-1 rounded-full border border-slate-200 font-mono">
                          {empDocs.length} files
                        </span>
                      </div>

                      <div className="space-y-2 mt-4">
                        {empDocs.length === 0 ? (
                          <div className="p-3 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-100">
                            No documents archived yet.
                          </div>
                        ) : (
                          empDocs.map(doc => (
                            <div key={doc.id} className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 truncate">
                                <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                <span className="text-xs font-medium text-slate-800 truncate" title={doc.name}>{doc.name}</span>
                              </div>
                              <button
                                onClick={() => handleDownloadDoc(doc)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded"
                                title="Download"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/70 flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">KYC Status: Verified</span>
                      <button
                        onClick={() => {
                          setUploadForm(prev => ({
                            ...prev,
                            employeeId: emp.id,
                            isCompanyWide: false
                          }));
                          setShowUploadModal(true);
                        }}
                        className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add File
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY & ACCESS MATRIX */}
        {activeTab === 'security' && (
          <div className="p-6 space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-bold text-slate-900 text-base">Document Security & Compliance Matrix</h3>
              <p className="text-xs text-slate-500">Overview of encryption policies, role permissions, and tamper verification status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-600" /> Confidentiality Tiers
                </h4>
                <div className="space-y-3">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200 uppercase">Restricted</span>
                      <span className="text-xs font-mono font-bold text-slate-700">Executive & Admin Only</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">Employment contracts, salary annexures, disciplinary records.</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">Confidential</span>
                      <span className="text-xs font-mono font-bold text-slate-700">HR & Direct Manager</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">Aadhaar, Passport, PAN cards, performance appraisals.</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase">Internal</span>
                      <span className="text-xs font-mono font-bold text-slate-700">All Employees</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1.5">Company handbooks, leave policies, IT security guides.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Retention & Compliance Audit
                </h4>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Storage Encryption:</span>
                    <span className="font-bold text-emerald-700 font-mono">AES-256 GCM</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">KYC Verification Rule:</span>
                    <span className="font-bold text-slate-900">Mandatory 48h after onboarding</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Audit Logging:</span>
                    <span className="font-bold text-emerald-700">Enabled (Shafi3396@gmail.com)</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Contract Archive Duration:</span>
                    <span className="font-bold text-slate-900">8 Years (Statutory Requirement)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table Footer Stats */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium text-slate-500">
          <span>Showing {filteredDocuments.length} of {documents.length} total files</span>
          <div className="flex items-center gap-3">
            <span className="text-[10px] uppercase font-bold text-slate-400">Vault Version: 2026.4 Enterprise</span>
          </div>
        </div>
      </div>

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Upload to Document Vault</h2>
                  <p className="text-xs text-slate-500">Securely archive employee or company-wide files.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Drag & Drop File Zone */}
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 hover:border-blue-500 bg-slate-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all hover:bg-blue-50/30 group"
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFilePicked}
                  className="hidden" 
                />
                <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xs border border-slate-200 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  {uploadForm.name ? uploadForm.name : 'Click to select or drag and drop a file'}
                </p>
                <p className="text-xs text-slate-400 mt-1">PDF, DOCX, XLSX, PNG, JPG (up to 25MB)</p>
              </div>

              {/* Document Name */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Document Title / File Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Arjun_Sharma_Passport_Copy.pdf"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              {/* Category & File Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Vault Folder Category *
                  </label>
                  <select
                    value={uploadForm.category}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, category: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Identity Documents">Identity Documents (KYC)</option>
                    <option value="Employment Contracts">Employment Contracts</option>
                    <option value="Policy Agreements">Policy Agreements</option>
                    <option value="Payroll">Payroll</option>
                    <option value="Company Certificates">Company Certificates</option>
                    <option value="Medical & Insurance">Medical & Insurance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    File Format *
                  </label>
                  <select
                    value={uploadForm.fileFormat}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, fileFormat: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  >
                    <option value="pdf">PDF (.pdf)</option>
                    <option value="docx">Microsoft Word (.docx)</option>
                    <option value="xlsx">Microsoft Excel (.xlsx)</option>
                    <option value="jpg">Image (.jpg / .png)</option>
                  </select>
                </div>
              </div>

              {/* Linked Target (Employee vs Company-wide) */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">Target Assignment</label>
                  <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={uploadForm.isCompanyWide}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, isCompanyWide: e.target.checked }))}
                      className="w-4 h-4 accent-blue-600 rounded"
                    />
                    <span>Company-Wide (General)</span>
                  </label>
                </div>

                {!uploadForm.isCompanyWide && (
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                      Associate with Employee
                    </label>
                    <select
                      value={uploadForm.employeeId}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, employeeId: e.target.value }))}
                      className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {EMPLOYEES.map(emp => (
                        <option key={emp.id} value={emp.id}>
                          {emp.name} ({emp.id}) &bull; {emp.dept}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Security Classification & Tags */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Confidentiality Classification *
                  </label>
                  <select
                    value={uploadForm.confidentiality}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, confidentiality: e.target.value as any }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Restricted">Restricted (Executive / Admin)</option>
                    <option value="Confidential">Confidential (HR / Manager)</option>
                    <option value="Internal">Internal (Company Employees)</option>
                    <option value="Public">Public</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                    Metadata Tags (Comma separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Contract, Signed, 2026"
                    value={uploadForm.tags}
                    onChange={(e) => setUploadForm(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                  Document Description & Remarks
                </label>
                <textarea
                  rows={2}
                  placeholder="Provide context or summary about this archived document..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-200 flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" /> Save & Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PREVIEW DOCUMENT MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full p-6 space-y-5">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase",
                  previewDoc.fileFormat === 'pdf' ? "bg-red-50 text-red-600 border border-red-100" : "bg-blue-50 text-blue-600 border border-blue-100"
                )}>
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base line-clamp-1">{previewDoc.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">ID: {previewDoc.id} &bull; {previewDoc.size}</span>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Folder Category:</span>
                  <span className="font-bold text-slate-900">{previewDoc.category}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Target Assignment:</span>
                  <span className="font-bold text-slate-900">
                    {previewDoc.employeeName ? `${previewDoc.employeeName} (${previewDoc.employeeId})` : 'Company-Wide'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Classification:</span>
                  <span className="font-bold text-blue-700">{previewDoc.confidentiality}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Date Archived:</span>
                  <span className="font-bold text-slate-700">{previewDoc.uploadedAt}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Integrity Check:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Valid SHA-256
                  </span>
                </div>
              </div>

              {previewDoc.description && (
                <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <p className="text-[10px] font-bold text-blue-900 uppercase tracking-wider mb-1">Document Summary</p>
                  <p className="text-xs text-slate-700 leading-relaxed">{previewDoc.description}</p>
                </div>
              )}

              {previewDoc.tags && previewDoc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {previewDoc.tags.map((t, i) => (
                    <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  const id = previewDoc.id;
                  setPreviewDoc(null);
                  handleDeleteDoc(id);
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete File
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadDoc(previewDoc)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm shadow-blue-200 cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT / RENAME MODAL */}
      {editDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">Edit Document Metadata</h3>
              <button onClick={() => setEditDoc(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  File Name *
                </label>
                <input
                  type="text"
                  value={editDoc.name}
                  onChange={(e) => setEditDoc({ ...editDoc, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Category
                </label>
                <select
                  value={editDoc.category}
                  onChange={(e) => setEditDoc({ ...editDoc, category: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Identity Documents">Identity Documents</option>
                  <option value="Employment Contracts">Employment Contracts</option>
                  <option value="Policy Agreements">Policy Agreements</option>
                  <option value="Payroll">Payroll</option>
                  <option value="Company Certificates">Company Certificates</option>
                  <option value="Medical & Insurance">Medical & Insurance</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Classification
                </label>
                <select
                  value={editDoc.confidentiality}
                  onChange={(e) => setEditDoc({ ...editDoc, confidentiality: e.target.value as any })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Restricted">Restricted</option>
                  <option value="Confidential">Confidential</option>
                  <option value="Internal">Internal</option>
                  <option value="Public">Public</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={editDoc.description || ''}
                  onChange={(e) => setEditDoc({ ...editDoc, description: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                ></textarea>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditDoc(null)}
                  className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white text-xs font-bold uppercase rounded-xl hover:bg-blue-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ISSUE WARNING LETTER MODAL */}
      <IssueWarningLetterModal
        isOpen={showIssueWarningModal}
        onClose={() => setShowIssueWarningModal(false)}
        onIssue={handleIssueWarningLetter}
        employees={EMPLOYEES}
      />

      {/* WARNING LETTER PREVIEW / READER MODAL */}
      <WarningLetterPreviewModal
        letter={selectedWarningLetter}
        onClose={() => setSelectedWarningLetter(null)}
        onAcknowledge={handleAcknowledgeWarning}
        onUpdateStatus={handleUpdateWarningStatus}
        onDelete={handleDeleteWarningLetter}
      />
    </div>
  );
};

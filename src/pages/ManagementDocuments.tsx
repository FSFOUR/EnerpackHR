import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  Briefcase, ArrowLeft, LayoutGrid, List, Search, Filter, Plus, 
  FileText, FileCode, FileSignature, File, Download, Eye, Edit3, 
  ShieldCheck, Lock, Unlock, Sparkles, Building, ChevronRight,
  CheckCircle2, Clock, X, Tag, HardDrive, Calendar, ArrowUpDown,
  Share2, Shield, Award, Check
} from 'lucide-react';
import { cn } from '../lib/utils';

export interface ManagementDocumentItem {
  id: string;
  docNumber: string;
  name: string;
  category: '01 Management';
  fileFormat: 'pdf' | 'docx' | 'xlsx';
  size: string;
  sizeBytes: number;
  uploadedAt: string;
  verified: boolean;
  confidentiality: 'Restricted' | 'Confidential' | 'Internal' | 'Public';
  description: string;
  tags: string[];
  version: string;
  approvedBy: string;
}

export const INITIAL_MANAGEMENT_DOCUMENTS: ManagementDocumentItem[] = [
  {
    id: 'DOC-01-01',
    docNumber: 'ENP-MGT-001',
    name: 'Company_Organization_Structure.pdf',
    category: '01 Management',
    fileFormat: 'pdf',
    size: '2.4 MB',
    sizeBytes: 2400000,
    uploadedAt: 'Aug 20, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Hierarchical organization chart of Enerpack packaging units, departmental reporting matrix, and plant leadership hierarchy.',
    tags: ['Org Structure', 'Management', 'Governance', 'Leadership'],
    version: 'v4.2',
    approvedBy: 'Board of Directors'
  },
  {
    id: 'DOC-01-02',
    docNumber: 'ENP-MGT-002',
    name: 'Management_Roles_and_Responsibilities.pdf',
    category: '01 Management',
    fileFormat: 'pdf',
    size: '1.8 MB',
    sizeBytes: 1800000,
    uploadedAt: 'Aug 18, 2026',
    verified: true,
    confidentiality: 'Internal',
    description: 'Detailed terms of reference, key result areas (KRAs), and executive responsibilities for Directors, Plant Head, and Department Managers.',
    tags: ['KRAs', 'Job Roles', 'Executive', 'Accountability'],
    version: 'v3.0',
    approvedBy: 'Managing Director'
  },
  {
    id: 'DOC-01-03',
    docNumber: 'ENP-MGT-003',
    name: 'Management_Approval_Authority_Matrix.xlsx',
    category: '01 Management',
    fileFormat: 'xlsx',
    size: '1.2 MB',
    sizeBytes: 1200000,
    uploadedAt: 'Aug 15, 2026',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Delegation of Financial and Administrative Powers (DOFP) matrix for CapEx, OpEx, vendor selection, and headcount approvals.',
    tags: ['Authority Matrix', 'DOFP', 'Approval Limits', 'Finance'],
    version: 'v2026.1',
    approvedBy: 'Chief Financial Officer'
  },
  {
    id: 'DOC-01-04',
    docNumber: 'ENP-MGT-004',
    name: 'Risk_and_Business_Continuity_Plan.pdf',
    category: '01 Management',
    fileFormat: 'pdf',
    size: '3.6 MB',
    sizeBytes: 3600000,
    uploadedAt: 'Aug 10, 2026',
    verified: true,
    confidentiality: 'Restricted',
    description: 'Enterprise risk mitigation framework, disaster recovery protocols, supply chain contingency, and power outage fallback procedures.',
    tags: ['BCP', 'Risk Management', 'Contingency', 'Disaster Recovery'],
    version: 'v5.0',
    approvedBy: 'Plant Operations Committee'
  },
  {
    id: 'DOC-01-05',
    docNumber: 'ENP-MGT-005',
    name: 'Management_Review_Report.pdf',
    category: '01 Management',
    fileFormat: 'pdf',
    size: '4.2 MB',
    sizeBytes: 4200000,
    uploadedAt: 'Aug 05, 2026',
    verified: true,
    confidentiality: 'Confidential',
    description: 'Quarterly executive review report evaluating plant productivity, safety metrics, quality deviations, and strategic growth goals.',
    tags: ['MRM', 'Review Report', 'Executive Summary', 'Q2 2026'],
    version: 'v2026-Q2',
    approvedBy: 'Executive Committee'
  }
];

export const ManagementDocuments: React.FC = () => {
  const navigate = useNavigate();
  
  // View mode: 'list' (default) or 'grid'
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  // Data state
  const [documents, setDocuments] = useState<ManagementDocumentItem[]>(INITIAL_MANAGEMENT_DOCUMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'docx' | 'xlsx'>('all');
  const [confidentialityFilter, setConfidentialityFilter] = useState<'all' | 'Restricted' | 'Confidential' | 'Internal' | 'Public'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size' | 'docNumber'>('docNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [previewDoc, setPreviewDoc] = useState<ManagementDocumentItem | null>(null);
  const [editDoc, setEditDoc] = useState<ManagementDocumentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState({
    name: '',
    docNumber: `ENP-MGT-${String(documents.length + 1).padStart(3, '0')}`,
    fileFormat: 'pdf' as 'pdf' | 'docx' | 'xlsx',
    confidentiality: 'Internal' as ManagementDocumentItem['confidentiality'],
    description: '',
    tags: 'Management, Executive, Governance',
    approvedBy: 'Executive Committee'
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered & Sorted Documents
  const filteredDocs = useMemo(() => {
    return documents.filter(doc => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = 
        doc.name.toLowerCase().includes(q) ||
        doc.docNumber.toLowerCase().includes(q) ||
        doc.description.toLowerCase().includes(q) ||
        doc.tags.some(t => t.toLowerCase().includes(q));

      const matchesFormat = formatFilter === 'all' || doc.fileFormat === formatFilter;
      const matchesConf = confidentialityFilter === 'all' || doc.confidentiality === confidentialityFilter;

      return matchesSearch && matchesFormat && matchesConf;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'docNumber') {
        comparison = a.docNumber.localeCompare(b.docNumber);
      } else if (sortBy === 'size') {
        comparison = a.sizeBytes - b.sizeBytes;
      } else if (sortBy === 'date') {
        comparison = a.uploadedAt.localeCompare(b.uploadedAt);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [documents, searchQuery, formatFilter, confidentialityFilter, sortBy, sortOrder]);

  // Storage calculation
  const totalStorage = useMemo(() => {
    const totalBytes = documents.reduce((acc, d) => acc + d.sizeBytes, 0);
    return (totalBytes / (1024 * 1024)).toFixed(1);
  }, [documents]);

  // Download Handler
  const handleDownloadDoc = (docItem: ManagementDocumentItem) => {
    try {
      if (docItem.fileFormat === 'pdf') {
        const doc = new jsPDF();
        doc.setFillColor(30, 58, 138); // Dark blue banner
        doc.rect(0, 0, 210, 32, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('ENERPACK PACKAGING SOLUTIONS', 14, 15);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('01. MANAGEMENT REPOSITORY & CORPORATE GOVERNANCE', 14, 23);

        doc.setTextColor(30, 41, 59);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(docItem.name.replace(/_/g, ' '), 14, 48);

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Document Reference: ${docItem.docNumber} | Version: ${docItem.version}`, 14, 56);
        doc.text(`Classification: ${docItem.confidentiality.toUpperCase()} | Approved By: ${docItem.approvedBy}`, 14, 62);
        doc.text(`Upload Date: ${docItem.uploadedAt} | File Size: ${docItem.size}`, 14, 68);

        doc.setDrawColor(226, 232, 240);
        doc.line(14, 73, 196, 73);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('1. Purpose & Scope', 14, 84);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        const splitDesc = doc.splitTextToSize(docItem.description, 180);
        doc.text(splitDesc, 14, 91);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('2. Executive Authorization Matrix', 14, 115);
        
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text('This document constitutes an official corporate record within the Enerpack Management Information', 14, 123);
        doc.text('System (MIS). Any alterations or revisions must be formally ratified through the Executive Committee.', 14, 129);

        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text('3. Keywords & Departmental Tags', 14, 145);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Tags: ${docItem.tags.join(', ')}`, 14, 153);

        doc.setDrawColor(203, 213, 225);
        doc.rect(14, 180, 182, 35);
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text('CONFIDENTIALITY NOTICE:', 18, 188);
        doc.text('The contents of this management record are proprietary to Enerpack Industries Ltd.', 18, 194);
        doc.text('Unauthorized dissemination, duplication, or reproduction is strictly prohibited.', 18, 200);
        doc.text(`Digital Verification Hash: SHA256-ENP-MGT-${docItem.id}-VERIFIED`, 18, 208);

        doc.save(docItem.name);
      } else {
        const content = `ENERPACK MANAGEMENT RECORD\n${docItem.name}\nDoc ID: ${docItem.docNumber}\nApproved By: ${docItem.approvedBy}\nClassification: ${docItem.confidentiality}\n\nDescription:\n${docItem.description}\n\nTags: ${docItem.tags.join(', ')}`;
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
      showToast(`Generated download for ${docItem.name}`);
    }
  };

  // Upload handler
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name.trim()) {
      showToast('Please enter a valid document name.');
      return;
    }

    const ext = uploadForm.fileFormat;
    let finalName = uploadForm.name.trim();
    if (!finalName.toLowerCase().endsWith(`.${ext}`)) {
      finalName = `${finalName}.${ext}`;
    }

    const randomBytes = Math.floor(Math.random() * (4000000 - 800000) + 800000);
    const sizeStr = `${(randomBytes / (1024 * 1024)).toFixed(1)} MB`;

    const tagList = uploadForm.tags
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    const newDoc: ManagementDocumentItem = {
      id: `DOC-01-${String(documents.length + 1).padStart(2, '0')}`,
      docNumber: uploadForm.docNumber.trim() || `ENP-MGT-${String(documents.length + 1).padStart(3, '0')}`,
      name: finalName,
      category: '01 Management',
      fileFormat: uploadForm.fileFormat,
      size: sizeStr,
      sizeBytes: randomBytes,
      uploadedAt: 'Today, Just now',
      verified: true,
      confidentiality: uploadForm.confidentiality,
      description: uploadForm.description || 'Uploaded to 01 Management repository.',
      tags: tagList.length > 0 ? tagList : ['Management', 'Executive'],
      version: 'v1.0',
      approvedBy: uploadForm.approvedBy || 'Managing Director'
    };

    setDocuments(prev => [newDoc, ...prev]);
    setShowUploadModal(false);
    showToast(`Successfully added "${newDoc.name}" to 01 Management repository.`);
  };

  // Edit handler
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editDoc) return;
    setDocuments(prev => prev.map(d => d.id === editDoc.id ? editDoc : d));
    setEditDoc(null);
    showToast(`Document "${editDoc.name}" updated successfully.`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Breadcrumb & Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/documents')}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xs transition-all cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            Back to Documents
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span 
              onClick={() => navigate('/documents')}
              className="hover:text-blue-600 cursor-pointer font-medium"
            >
              Document Vault
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              01 Management
            </span>
          </div>
        </div>

        {/* View Toggle (List vs Grid) & Upload Button */}
        <div className="flex items-center gap-2.5">
          {/* List vs Grid Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              title="List View"
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                viewMode === 'list'
                  ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <List className="w-3.5 h-3.5" />
              List View
            </button>

            <button
              onClick={() => setViewMode('grid')}
              title="Grid View"
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                viewMode === 'grid'
                  ? "bg-white text-blue-700 shadow-2xs font-extrabold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Grid View
            </button>
          </div>

          <button
            onClick={() => setShowUploadModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm shadow-blue-200 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Upload Management Doc
          </button>
        </div>
      </div>

      {/* Hero Header Banner */}
      <div className="bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 rounded-2xl text-white p-6 sm:p-7 shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-full bg-blue-600/10 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 backdrop-blur-md rounded-lg text-xs font-mono font-bold tracking-wider text-blue-200 border border-white/10">
              <Building className="w-3.5 h-3.5 text-blue-400" />
              ENERPACK ENTERPRISE GOVERNANCE &bull; FOLDER 01
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              01. Management Documents
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Official corporate organization architecture, executive terms of reference, delegated financial authorization limits, risk mitigation continuity protocols, and periodic board review reports.
            </p>
          </div>

          {/* Quick Stats Bento */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-center">
              <span className="text-2xl font-mono font-bold text-white block">{documents.length}</span>
              <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Core Files</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-center">
              <span className="text-2xl font-mono font-bold text-emerald-300 block">{totalStorage} MB</span>
              <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Storage</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 text-center">
              <span className="text-2xl font-mono font-bold text-amber-300 block">100%</span>
              <span className="text-[10px] uppercase font-bold text-blue-200 tracking-wider">Verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search management documents, tags, doc ID..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Format Filter */}
          <select
            value={formatFilter}
            onChange={(e) => setFormatFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Formats</option>
            <option value="pdf">PDF Documents (.pdf)</option>
            <option value="xlsx">Excel Sheets (.xlsx)</option>
            <option value="docx">Word Files (.docx)</option>
          </select>

          {/* Confidentiality Filter */}
          <select
            value={confidentialityFilter}
            onChange={(e) => setConfidentialityFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Classifications</option>
            <option value="Restricted">Restricted</option>
            <option value="Confidential">Confidential</option>
            <option value="Internal">Internal</option>
            <option value="Public">Public</option>
          </select>

          {/* Sort By */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-2 py-1">
            <span className="text-[10px] font-bold uppercase text-slate-400">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="docNumber">Doc Number</option>
              <option value="name">Title Name</option>
              <option value="size">File Size</option>
              <option value="date">Date Added</option>
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              title={`Toggle Sort Order (${sortOrder})`}
              className="p-1 text-slate-500 hover:text-blue-600 rounded transition-colors"
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Management Document Catalog ({filteredDocs.length} items)
            </span>
            <span className="text-xs text-slate-400 font-medium font-mono">
              Folder 01 &bull; Active Master Records
            </span>
          </div>

          {filteredDocs.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="font-bold text-slate-700 text-sm">No management documents found</p>
              <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria or clear the filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredDocs.map((doc, idx) => (
                <div
                  key={doc.id}
                  className="p-4 sm:p-5 hover:bg-blue-50/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5 min-w-0">
                    {/* Index number */}
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-slate-200 group-hover:bg-blue-50 group-hover:text-blue-700 group-hover:border-blue-200 transition-colors">
                      {String(idx + 1).padStart(2, '0')}
                    </div>

                    {/* Format icon */}
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs uppercase shadow-2xs",
                      doc.fileFormat === 'pdf' ? "bg-red-50 text-red-600 border-red-200" :
                      doc.fileFormat === 'docx' ? "bg-blue-50 text-blue-600 border-blue-200" :
                      doc.fileFormat === 'xlsx' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                      "bg-purple-50 text-purple-600 border-purple-200"
                    )}>
                      {doc.fileFormat === 'pdf' ? <FileText className="w-5 h-5" /> : 
                       doc.fileFormat === 'docx' ? <FileSignature className="w-5 h-5" /> : 
                       doc.fileFormat === 'xlsx' ? <FileCode className="w-5 h-5" /> : 
                       <File className="w-5 h-5 text-slate-600" />}
                    </div>

                    {/* Document details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                          {doc.docNumber}
                        </span>

                        <h3 
                          onClick={() => setPreviewDoc(doc)}
                          className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition-colors"
                        >
                          {doc.name.replace(/_/g, ' ').replace(/\.(pdf|docx|xlsx|jpg)$/i, '')}
                        </h3>

                        <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
                          .{doc.fileFormat}
                        </span>

                        {doc.verified && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 font-bold px-2 py-0.5 rounded-full">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" /> Verified
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {doc.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5 mt-2.5">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
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

                        <span className="text-[11px] text-slate-500 font-mono">
                          {doc.size}
                        </span>

                        <span className="text-[11px] text-slate-400">
                          &bull; Approved: <span className="font-semibold text-slate-600">{doc.approvedBy}</span>
                        </span>

                        <span className="text-[11px] text-slate-400">
                          &bull; Updated: {doc.uploadedAt}
                        </span>

                        {doc.tags?.map((t, i) => (
                          <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-medium">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Preview
                    </button>
                    <button
                      onClick={() => handleDownloadDoc(doc)}
                      className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button
                      onClick={() => setEditDoc(doc)}
                      title="Edit metadata"
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-amber-200"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: GRID VIEW */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocs.map((doc, idx) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
            >
              <div>
                {/* Header card info */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs uppercase shadow-2xs",
                      doc.fileFormat === 'pdf' ? "bg-red-50 text-red-600 border-red-200" :
                      doc.fileFormat === 'docx' ? "bg-blue-50 text-blue-600 border-blue-200" :
                      doc.fileFormat === 'xlsx' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                      "bg-purple-50 text-purple-600 border-purple-200"
                    )}>
                      {doc.fileFormat === 'pdf' ? <FileText className="w-5 h-5" /> : 
                       doc.fileFormat === 'docx' ? <FileSignature className="w-5 h-5" /> : 
                       doc.fileFormat === 'xlsx' ? <FileCode className="w-5 h-5" /> : 
                       <File className="w-5 h-5 text-slate-600" />}
                    </div>

                    <div>
                      <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.5 rounded">
                        {doc.docNumber}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
                        {doc.version} &bull; {doc.size}
                      </span>
                    </div>
                  </div>

                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider",
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
                </div>

                {/* Title and Description */}
                <h3 
                  onClick={() => setPreviewDoc(doc)}
                  className="font-bold text-slate-900 text-base hover:text-blue-600 cursor-pointer transition-colors line-clamp-2"
                >
                  {doc.name.replace(/_/g, ' ').replace(/\.(pdf|docx|xlsx|jpg)$/i, '')}
                </h3>

                <p className="text-xs text-slate-500 mt-2 line-clamp-3 leading-relaxed">
                  {doc.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {doc.tags?.slice(0, 3).map((t, i) => (
                    <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                      #{t}
                    </span>
                  ))}
                  {doc.tags?.length > 3 && (
                    <span className="text-[9px] text-slate-400 font-medium self-center">
                      +{doc.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer & Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="text-[10px] text-slate-400">
                  <span>Approved by <strong className="text-slate-700">{doc.approvedBy}</strong></span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    title="Preview Document"
                    className="p-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer border border-slate-200"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadDoc(doc)}
                    title="Download File"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Governance & Authorization Notice Footer */}
      <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-200/80 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
          <Shield className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-950">
            Enerpack Corporate Governance & Executive Revision Policy
          </h4>
          <p className="text-xs text-blue-900/80 mt-1 leading-relaxed">
            All records in Folder 01 represent certified enterprise directives. Modifying roles, delegation limits, or risk continuity procedures requires an Executive Change Request (ECR) signed by the Managing Director.
          </p>
        </div>
      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center font-bold text-xs">
                  {previewDoc.fileFormat.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white line-clamp-1">{previewDoc.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono">{previewDoc.docNumber} &bull; {previewDoc.category}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Document Overview</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Master Record
                  </span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed font-medium">
                  {previewDoc.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Classification</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">{previewDoc.confidentiality}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Version Number</span>
                  <span className="text-xs font-mono font-bold text-blue-600 mt-0.5 block">{previewDoc.version}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">File Size</span>
                  <span className="text-xs font-mono font-bold text-slate-800 mt-0.5 block">{previewDoc.size}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Approved By</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">{previewDoc.approvedBy}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Last Revision</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block">{previewDoc.uploadedAt}</span>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">File Type</span>
                  <span className="text-xs font-bold text-slate-800 mt-0.5 block uppercase">.{previewDoc.fileFormat} File</span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">Search Tags</span>
                <div className="flex flex-wrap gap-2">
                  {previewDoc.tags.map((t, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-700 px-3 py-1 rounded-lg font-medium border border-slate-200">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setEditDoc(previewDoc);
                  setPreviewDoc(null);
                }}
                className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-4 h-4" /> Edit Details
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => handleDownloadDoc(previewDoc)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Official File
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm">Edit Management Document Details</h3>
              <button onClick={() => setEditDoc(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Document Title</label>
                <input
                  type="text"
                  value={editDoc.name}
                  onChange={(e) => setEditDoc({ ...editDoc, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Classification</label>
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
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Approved By</label>
                  <input
                    type="text"
                    value={editDoc.approvedBy}
                    onChange={(e) => setEditDoc({ ...editDoc, approvedBy: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</label>
                <textarea
                  value={editDoc.description}
                  onChange={(e) => setEditDoc({ ...editDoc, description: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={editDoc.tags.join(', ')}
                  onChange={(e) => setEditDoc({ ...editDoc, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditDoc(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD NEW MANAGEMENT DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-sm">Upload to 01 Management Repository</h3>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Document Title</label>
                <input
                  type="text"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="e.g. Annual_Capital_Budget_FY2027.pdf"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Doc Ref Number</label>
                  <input
                    type="text"
                    value={uploadForm.docNumber}
                    onChange={(e) => setUploadForm({ ...uploadForm, docNumber: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">File Format</label>
                  <select
                    value={uploadForm.fileFormat}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileFormat: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="xlsx">Excel Workbook (.xlsx)</option>
                    <option value="docx">Word Document (.docx)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Classification</label>
                  <select
                    value={uploadForm.confidentiality}
                    onChange={(e) => setUploadForm({ ...uploadForm, confidentiality: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="Restricted">Restricted</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Internal">Internal</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Approved By</label>
                  <input
                    type="text"
                    value={uploadForm.approvedBy}
                    onChange={(e) => setUploadForm({ ...uploadForm, approvedBy: e.target.value })}
                    placeholder="e.g. Managing Director"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description & Purpose</label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Summarize the core purpose and scope of this governance document..."
                  rows={3}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

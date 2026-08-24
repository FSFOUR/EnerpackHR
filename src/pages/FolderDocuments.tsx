import React, { useState, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  ArrowLeft, LayoutGrid, List, Search, Filter, Plus, 
  FileText, FileCode, FileSignature, File, Download, Eye, Edit3, 
  ShieldCheck, Lock, Unlock, Sparkles, ChevronRight,
  CheckCircle2, Clock, X, Tag, HardDrive, Calendar, ArrowUpDown,
  Share2, Shield, Award, Check, ChevronDown, FolderOpen
} from 'lucide-react';
import { cn } from '../lib/utils';
import { 
  FOLDER_CONFIGS, 
  MASTER_VAULT_DOCUMENTS, 
  VaultDocumentItem, 
  FolderMetadata,
  getFolderBySlug 
} from '../data/documentVaultData';

export const FolderDocuments: React.FC = () => {
  const navigate = useNavigate();
  const { folderSlug } = useParams<{ folderSlug: string }>();

  // Determine current folder config based on URL slug or default to 01
  const currentFolder: FolderMetadata = useMemo(() => {
    if (!folderSlug) return FOLDER_CONFIGS[0];
    return getFolderBySlug(folderSlug);
  }, [folderSlug]);

  const [allDocs, setAllDocs] = useState<VaultDocumentItem[]>(MASTER_VAULT_DOCUMENTS);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [formatFilter, setFormatFilter] = useState<'all' | 'pdf' | 'docx' | 'xlsx'>('all');
  const [confidentialityFilter, setConfidentialityFilter] = useState<'all' | 'Restricted' | 'Confidential' | 'Internal' | 'Public'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'uploadedAt' | 'size' | 'docNumber'>('docNumber');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Modals
  const [previewDoc, setPreviewDoc] = useState<VaultDocumentItem | null>(null);
  const [editingDoc, setEditingDoc] = useState<VaultDocumentItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState<{
    name: string;
    docNumber: string;
    fileFormat: 'pdf' | 'docx' | 'xlsx';
    confidentiality: 'Restricted' | 'Confidential' | 'Internal' | 'Public';
    description: string;
    tags: string;
    approvedBy: string;
    version: string;
  }>({
    name: '',
    docNumber: '',
    fileFormat: 'pdf',
    confidentiality: 'Internal',
    description: '',
    tags: '',
    approvedBy: currentFolder.defaultApprover,
    version: 'v1.0'
  });

  // Filtered documents for the current folder
  const folderDocuments = useMemo(() => {
    return allDocs.filter(d => d.category === currentFolder.name);
  }, [allDocs, currentFolder.name]);

  const filteredDocs = useMemo(() => {
    return folderDocuments.filter(doc => {
      const matchesSearch = 
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.docNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

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
      } else if (sortBy === 'uploadedAt') {
        comparison = a.uploadedAt.localeCompare(b.uploadedAt);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [folderDocuments, searchQuery, formatFilter, confidentialityFilter, sortBy, sortOrder]);

  // Statistics
  const totalSizeBytes = useMemo(() => {
    return folderDocuments.reduce((acc, curr) => acc + (curr.sizeBytes || 0), 0);
  }, [folderDocuments]);

  const totalSizeMB = (totalSizeBytes / (1024 * 1024)).toFixed(1);

  const formatStats = useMemo(() => {
    const counts = { pdf: 0, docx: 0, xlsx: 0 };
    folderDocuments.forEach(d => {
      if (d.fileFormat in counts) {
        counts[d.fileFormat as keyof typeof counts]++;
      }
    });
    return counts;
  }, [folderDocuments]);

  // Handle Download using jsPDF
  const handleDownloadDoc = (doc: VaultDocumentItem) => {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Outer border & header banner
    pdf.setFillColor(15, 23, 42); // slate-900
    pdf.rect(0, 0, 210, 36, 'F');

    // Title text
    pdf.setTextColor(255, 255, 255);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text('ENERPACK PACKAGING INDUSTRIES', 15, 15);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(148, 163, 184);
    pdf.text(`OFFICIAL REPOSITORY: ${currentFolder.name.toUpperCase()}`, 15, 22);
    pdf.text(`DOC REF: ${doc.docNumber}  |  CONFIDENTIALITY: ${doc.confidentiality.toUpperCase()}  |  VERSION: ${doc.version}`, 15, 28);

    // Meta Badge on right
    pdf.setFillColor(30, 41, 59);
    pdf.roundedRect(145, 8, 50, 20, 2, 2, 'F');
    pdf.setTextColor(56, 189, 248);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(8);
    pdf.text('CONTROLLED DOCUMENT', 150, 16);
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(7);
    pdf.text('ISO 9001 / EHS COMPLIANT', 150, 22);

    // Body content
    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.text(doc.name.replace(/_/g, ' '), 15, 52);

    // Metadata Table
    pdf.setFillColor(248, 250, 252);
    pdf.rect(15, 58, 180, 48, 'F');
    pdf.setDrawColor(226, 232, 240);
    pdf.rect(15, 58, 180, 48, 'S');

    pdf.setFontSize(9);
    pdf.setTextColor(100, 116, 139);
    pdf.text('Category Folder:', 20, 68);
    pdf.text('File Format:', 20, 78);
    pdf.text('File Size / Verified:', 20, 88);
    pdf.text('Approving Authority:', 20, 98);

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text(doc.category, 65, 68);
    pdf.text(doc.fileFormat.toUpperCase(), 65, 78);
    pdf.text(`${doc.size} (Cryptographically Verified)`, 65, 88);
    pdf.text(doc.approvedBy || currentFolder.defaultApprover, 65, 98);

    pdf.setTextColor(100, 116, 139);
    pdf.setFont('helvetica', 'normal');
    pdf.text('Revision / Version:', 120, 68);
    pdf.text('Last Updated Date:', 120, 78);
    pdf.text('Classification Level:', 120, 88);
    pdf.text('Security Status:', 120, 98);

    pdf.setTextColor(15, 23, 42);
    pdf.setFont('helvetica', 'bold');
    pdf.text(doc.version, 160, 68);
    pdf.text(doc.uploadedAt, 160, 78);
    pdf.text(doc.confidentiality, 160, 88);
    pdf.text('Active / Approved', 160, 98);

    // Document Scope Description
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.text('1. Operational Scope & Purpose', 15, 120);

    pdf.setFontSize(9.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);
    const splitDesc = pdf.splitTextToSize(doc.description, 180);
    pdf.text(splitDesc, 15, 128);

    // Key Governance Terms
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('2. Regulatory & Governance Directive', 15, 150);

    pdf.setFontSize(9.5);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(51, 65, 85);
    const splitGov = pdf.splitTextToSize(currentFolder.governanceNote, 180);
    pdf.text(splitGov, 15, 158);

    // Tags & Classifications
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('3. Associated Indexation Tags', 15, 180);

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(71, 85, 105);
    pdf.text(doc.tags.map(t => `#${t}`).join('   •   '), 15, 188);

    // Digital Signature & Approval Box
    pdf.setFillColor(241, 245, 249);
    pdf.roundedRect(15, 215, 180, 48, 2, 2, 'F');
    pdf.setDrawColor(203, 213, 225);
    pdf.roundedRect(15, 215, 180, 48, 2, 2, 'S');

    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(15, 23, 42);
    pdf.text('EXECUTIVE VERIFICATION & AUTHORIZATION SEAL', 20, 226);

    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(100, 116, 139);
    pdf.text(`This document is certified under Enerpack Quality Management Systems & ISO 9001 regulations.`, 20, 233);
    pdf.text(`Authorized by: ${doc.approvedBy || currentFolder.defaultApprover} | Release Hash: SHA256-${Math.random().toString(36).substring(2, 12).toUpperCase()}`, 20, 239);
    pdf.text(`Official Timestamp: ${new Date().toLocaleString()} (Electronic Signature Attached)`, 20, 245);

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(148, 163, 184);
    pdf.text('Enerpack Packaging Industries  •  Document Repository System  •  Strictly Confidential', 15, 285);
    pdf.text('Page 1 of 1', 180, 285);

    pdf.save(`${doc.docNumber}_${doc.name}`);
  };

  // Upload handler
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.name) return;

    const nextIndex = folderDocuments.length + 1;
    const paddedIndex = nextIndex < 10 ? `00${nextIndex}` : nextIndex < 100 ? `0${nextIndex}` : `${nextIndex}`;
    const generatedDocNumber = uploadForm.docNumber || `${currentFolder.prefix}-${paddedIndex}`;

    const newDoc: VaultDocumentItem = {
      id: `DOC-${currentFolder.number}-${paddedIndex}`,
      docNumber: generatedDocNumber,
      name: uploadForm.name.endsWith(`.${uploadForm.fileFormat}`) ? uploadForm.name : `${uploadForm.name}.${uploadForm.fileFormat}`,
      category: currentFolder.name,
      fileFormat: uploadForm.fileFormat,
      size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
      sizeBytes: Math.floor((Math.random() * 2 + 1) * 1024 * 1024),
      uploadedAt: 'Today, Just Now',
      verified: true,
      confidentiality: uploadForm.confidentiality,
      description: uploadForm.description || `Official ${currentFolder.name} record uploaded to company vault.`,
      tags: uploadForm.tags ? uploadForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [currentFolder.name, 'Document'],
      version: uploadForm.version || 'v1.0',
      approvedBy: uploadForm.approvedBy || currentFolder.defaultApprover
    };

    setAllDocs(prev => [newDoc, ...prev]);
    setShowUploadModal(false);
    setUploadForm({
      name: '',
      docNumber: '',
      fileFormat: 'pdf',
      confidentiality: 'Internal',
      description: '',
      tags: '',
      approvedBy: currentFolder.defaultApprover,
      version: 'v1.0'
    });
  };

  // Edit handler
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    setAllDocs(prev => prev.map(doc => {
      if (doc.id === editingDoc.id) {
        return editingDoc;
      }
      return doc;
    }));

    setEditingDoc(null);
  };

  const handleShare = (doc: VaultDocumentItem) => {
    const textToCopy = `Document: ${doc.name} (${doc.docNumber})\nCategory: ${doc.category}\nConfidentiality: ${doc.confidentiality}\nVersion: ${doc.version}`;
    navigator.clipboard.writeText(textToCopy);
    setCopySuccess(doc.id);
    setTimeout(() => setCopySuccess(null), 2500);
  };

  const FolderIcon = currentFolder.icon;

  return (
    <div className="space-y-6 pb-16">
      {/* Top Breadcrumb & Back Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <Link 
            to="/documents" 
            className="hover:text-blue-600 transition-colors flex items-center gap-1 text-slate-600"
          >
            <HardDrive className="w-3.5 h-3.5" />
            Document Vault
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1.5">
            <span className={cn(
              "w-2 h-2 rounded-full",
              currentFolder.color === 'blue' ? "bg-blue-600" :
              currentFolder.color === 'indigo' ? "bg-indigo-600" :
              currentFolder.color === 'emerald' ? "bg-emerald-600" :
              currentFolder.color === 'purple' ? "bg-purple-600" :
              currentFolder.color === 'amber' ? "bg-amber-600" :
              currentFolder.color === 'rose' ? "bg-rose-600" :
              currentFolder.color === 'cyan' ? "bg-cyan-600" :
              currentFolder.color === 'sky' ? "bg-sky-600" :
              currentFolder.color === 'violet' ? "bg-violet-600" :
              currentFolder.color === 'teal' ? "bg-teal-600" :
              currentFolder.color === 'orange' ? "bg-orange-600" :
              currentFolder.color === 'red' ? "bg-red-600" :
              "bg-slate-600"
            )} />
            {currentFolder.name}
          </span>
        </div>

        {/* Action Controls Top */}
        <div className="flex items-center gap-2">
          {/* Quick Jump Folder Selector */}
          <div className="relative group">
            <select
              value={currentFolder.slug}
              onChange={(e) => navigate(`/documents/folder/${e.target.value}`)}
              aria-label="Switch Department Folder"
              className="appearance-none bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-2 pr-8 text-xs font-bold text-slate-700 shadow-2xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              {FOLDER_CONFIGS.map(f => (
                <option key={f.slug} value={f.slug}>
                  {f.name} ({f.badge})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          <button
            onClick={() => navigate('/documents')}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
            Back to Documents
          </button>

          <button
            onClick={() => {
              const nextIndex = folderDocuments.length + 1;
              const paddedIndex = nextIndex < 10 ? `00${nextIndex}` : nextIndex < 100 ? `0${nextIndex}` : `${nextIndex}`;
              setUploadForm({
                name: '',
                docNumber: `${currentFolder.prefix}-${paddedIndex}`,
                fileFormat: 'pdf',
                confidentiality: 'Internal',
                description: '',
                tags: `${currentFolder.name}, Standard`,
                approvedBy: currentFolder.defaultApprover,
                version: 'v1.0'
              });
              setShowUploadModal(true);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-blue-200 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Upload File
          </button>
        </div>
      </div>

      {/* Main Folder Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-50/80 via-slate-50/40 to-transparent rounded-bl-full pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs",
              currentFolder.color === 'blue' ? "bg-blue-50 text-blue-600 border-blue-200" :
              currentFolder.color === 'indigo' ? "bg-indigo-50 text-indigo-600 border-indigo-200" :
              currentFolder.color === 'emerald' ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
              currentFolder.color === 'purple' ? "bg-purple-50 text-purple-600 border-purple-200" :
              currentFolder.color === 'amber' ? "bg-amber-50 text-amber-600 border-amber-200" :
              currentFolder.color === 'rose' ? "bg-rose-50 text-rose-600 border-rose-200" :
              currentFolder.color === 'cyan' ? "bg-cyan-50 text-cyan-600 border-cyan-200" :
              currentFolder.color === 'sky' ? "bg-sky-50 text-sky-600 border-sky-200" :
              currentFolder.color === 'violet' ? "bg-violet-50 text-violet-600 border-violet-200" :
              currentFolder.color === 'teal' ? "bg-teal-50 text-teal-600 border-teal-200" :
              currentFolder.color === 'orange' ? "bg-orange-50 text-orange-600 border-orange-200" :
              currentFolder.color === 'red' ? "bg-red-50 text-red-600 border-red-200" :
              "bg-slate-50 text-slate-700 border-slate-200"
            )}>
              <FolderIcon className="w-8 h-8" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-mono font-bold bg-slate-900 text-white px-2 py-0.5 rounded-md">
                  FOLDER {currentFolder.number}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                  {currentFolder.subtitle}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  ISO 9001 Compliant
                </span>
              </div>

              <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mt-1.5">
                {currentFolder.name}
              </h1>

              <p className="text-sm text-slate-500 max-w-3xl mt-1.5 leading-relaxed">
                {currentFolder.description}
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 gap-2">
            <div className="text-left md:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Records</span>
              <div className="text-2xl font-black text-slate-900 font-mono">{folderDocuments.length}</div>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Storage Used</span>
              <div className="text-sm font-bold text-slate-700 font-mono">{totalSizeMB} MB</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`Search ${currentFolder.name} by title, doc number, tags...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
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

          {/* Controls Right */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Format Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl">
              {(['all', 'pdf', 'xlsx', 'docx'] as const).map(fmt => (
                <button
                  key={fmt}
                  onClick={() => setFormatFilter(fmt)}
                  className={cn(
                    "px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer",
                    formatFilter === fmt ? "bg-white text-blue-700 shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Confidentiality Filter */}
            <select
              value={confidentialityFilter}
              onChange={(e) => setConfidentialityFilter(e.target.value as any)}
              aria-label="Filter by Confidentiality"
              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Classifications</option>
              <option value="Restricted">Restricted</option>
              <option value="Confidential">Confidential</option>
              <option value="Internal">Internal</option>
              <option value="Public">Public</option>
            </select>

            {/* Sort Order */}
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              title={`Sort ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
              className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl transition-all cursor-pointer shadow-2xs"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>

            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center">
              <button
                onClick={() => setViewMode('list')}
                title="List View"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === 'list' ? "bg-white text-blue-700 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid View"
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer",
                  viewMode === 'grid' ? "bg-white text-blue-700 shadow-2xs" : "text-slate-500 hover:text-slate-800"
                )}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Grid
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Grid / List Content */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {currentFolder.name} Inventory ({filteredDocs.length} of {folderDocuments.length} files)
          </span>
          <span className="text-xs font-medium text-slate-500 font-mono">
            {viewMode === 'list' ? 'Structured List Mode' : 'Card Grid Mode'}
          </span>
        </div>

        {filteredDocs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No documents found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              No matching files found in {currentFolder.name} matching your search or filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFormatFilter('all');
                setConfidentialityFilter('all');
              }}
              className="mt-4 px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          /* GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-start justify-between gap-3 mb-3">
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

                    <div className="flex flex-col items-end gap-1">
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
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{doc.docNumber}</span>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 
                    onClick={() => setPreviewDoc(doc)}
                    className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition-colors line-clamp-2"
                  >
                    {doc.name.replace(/_/g, ' ').replace(/\.(pdf|docx|xlsx)$/i, '')}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-3 leading-relaxed">
                    {doc.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {doc.tags?.slice(0, 3).map((t, i) => (
                      <span key={i} className="text-[9px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Footer Info & Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-[10px] text-slate-400">
                    <span className="font-mono">{doc.size}</span> • <span>{doc.version}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      title="Preview Document"
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer border border-slate-200"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setEditingDoc(doc)}
                      title="Edit Metadata"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer border border-slate-200"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDownloadDoc(doc)}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-2xs transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* LIST VIEW */
          <div className="grid grid-cols-1 gap-2.5">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 hover:border-blue-300 hover:shadow-xs transition-all p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border font-bold text-xs uppercase shadow-2xs mt-0.5",
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
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {doc.docNumber}
                      </span>
                      <h3 
                        onClick={() => setPreviewDoc(doc)}
                        className="font-bold text-slate-900 text-sm hover:text-blue-600 cursor-pointer transition-colors"
                      >
                        {doc.name.replace(/_/g, ' ')}
                      </h3>
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                        {doc.version}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-2xl">
                      {doc.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-slate-400">
                      <span className="font-mono text-slate-600 font-semibold">{doc.size}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {doc.uploadedAt}
                      </span>
                      <span>•</span>
                      <span>Approved by <strong className="text-slate-700">{doc.approvedBy || currentFolder.defaultApprover}</strong></span>
                      <span>•</span>
                      <span className={cn(
                        "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                        doc.confidentiality === 'Restricted' ? "text-red-700 bg-red-50" :
                        doc.confidentiality === 'Confidential' ? "text-amber-700 bg-amber-50" :
                        doc.confidentiality === 'Internal' ? "text-blue-700 bg-blue-50" :
                        "text-slate-700 bg-slate-100"
                      )}>
                        {doc.confidentiality}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleShare(doc)}
                    title="Share Reference"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200"
                  >
                    {copySuccess === doc.id ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    title="Preview Details"
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all cursor-pointer border border-slate-200"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingDoc(doc)}
                    title="Edit Properties"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all cursor-pointer border border-slate-200"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownloadDoc(doc)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Department Compliance & Governance Card */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 md:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded">
                COMPLIANCE & GOVERNANCE
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                FOLDER {currentFolder.number} / {currentFolder.badge}
              </span>
            </div>
            <h4 className="text-base font-bold text-white">
              {currentFolder.name} Regulatory SOP Directive
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentFolder.governanceNote}
            </p>
          </div>

          <button
            onClick={() => {
              const nextIndex = folderDocuments.length + 1;
              const paddedIndex = nextIndex < 10 ? `00${nextIndex}` : nextIndex < 100 ? `0${nextIndex}` : `${nextIndex}`;
              setUploadForm({
                name: '',
                docNumber: `${currentFolder.prefix}-${paddedIndex}`,
                fileFormat: 'pdf',
                confidentiality: 'Internal',
                description: '',
                tags: `${currentFolder.name}, Standard`,
                approvedBy: currentFolder.defaultApprover,
                version: 'v1.0'
              });
              setShowUploadModal(true);
            }}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer shadow-sm shadow-blue-900"
          >
            + Append Document
          </button>
        </div>
      </div>

      {/* PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs uppercase",
                  previewDoc.fileFormat === 'pdf' ? "bg-red-50 text-red-600 border border-red-200" :
                  previewDoc.fileFormat === 'docx' ? "bg-blue-50 text-blue-600 border border-blue-200" :
                  "bg-emerald-50 text-emerald-600 border border-emerald-200"
                )}>
                  {previewDoc.fileFormat === 'pdf' ? <FileText className="w-5 h-5" /> : 
                   previewDoc.fileFormat === 'docx' ? <FileSignature className="w-5 h-5" /> : 
                   <FileCode className="w-5 h-5" />}
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {previewDoc.docNumber}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {previewDoc.name.replace(/_/g, ' ')}
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Document Overview Bento */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Version</span>
                  <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">{previewDoc.version}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">File Size</span>
                  <p className="text-xs font-bold text-slate-800 font-mono mt-0.5">{previewDoc.size}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Uploaded</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{previewDoc.uploadedAt}</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Classification</span>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{previewDoc.confidentiality}</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description & Operational Scope</h4>
                <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {previewDoc.description}
                </p>
              </div>

              {/* Tags */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Indexed Tags</h4>
                <div className="flex flex-wrap gap-1.5">
                  {previewDoc.tags.map((t, i) => (
                    <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg font-medium border border-slate-200">
                      #{t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Verification & Approver */}
              <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-900 block">Verified Compliance Seal</span>
                    <span className="text-[11px] text-blue-700">Authorized by {previewDoc.approvedBy || currentFolder.defaultApprover}</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-bold text-blue-800 bg-white px-2.5 py-1 rounded-lg border border-blue-200">
                  ISO-9001:2026
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/60 rounded-b-2xl">
              <button
                onClick={() => handleShare(previewDoc)}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                Copy Meta
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingDoc(previewDoc);
                    setPreviewDoc(null);
                  }}
                  className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDownloadDoc(previewDoc)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-blue-200 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900">Edit Document Metadata</h3>
              <button onClick={() => setEditingDoc(null)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Document Title</label>
                <input
                  type="text"
                  value={editingDoc.name}
                  onChange={(e) => setEditingDoc({ ...editingDoc, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Document Number</label>
                  <input
                    type="text"
                    value={editingDoc.docNumber}
                    onChange={(e) => setEditingDoc({ ...editingDoc, docNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Version</label>
                  <input
                    type="text"
                    value={editingDoc.version}
                    onChange={(e) => setEditingDoc({ ...editingDoc, version: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Confidentiality</label>
                  <select
                    value={editingDoc.confidentiality}
                    onChange={(e) => setEditingDoc({ ...editingDoc, confidentiality: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="Restricted">Restricted</option>
                    <option value="Confidential">Confidential</option>
                    <option value="Internal">Internal</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Approving Authority</label>
                  <input
                    type="text"
                    value={editingDoc.approvedBy}
                    onChange={(e) => setEditingDoc({ ...editingDoc, approvedBy: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editingDoc.description}
                  onChange={(e) => setEditingDoc({ ...editingDoc, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  value={editingDoc.tags.join(', ')}
                  onChange={(e) => setEditingDoc({ ...editingDoc, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPLOAD MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upload to {currentFolder.name}</h3>
                <p className="text-xs text-slate-500">Add verified record with automated ref ID & metadata</p>
              </div>
              <button onClick={() => setShowUploadModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Document Name / Title</label>
                <input
                  type="text"
                  placeholder="e.g. Annual_Safety_Inspection_Protocol"
                  value={uploadForm.name}
                  onChange={(e) => setUploadForm({ ...uploadForm, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">File Format</label>
                  <select
                    value={uploadForm.fileFormat}
                    onChange={(e) => setUploadForm({ ...uploadForm, fileFormat: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="pdf">PDF Document (.pdf)</option>
                    <option value="docx">Word Document (.docx)</option>
                    <option value="xlsx">Excel Spreadsheet (.xlsx)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Confidentiality</label>
                  <select
                    value={uploadForm.confidentiality}
                    onChange={(e) => setUploadForm({ ...uploadForm, confidentiality: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  >
                    <option value="Internal">Internal (Company-Wide)</option>
                    <option value="Confidential">Confidential (Executive/HR)</option>
                    <option value="Restricted">Restricted (Board Only)</option>
                    <option value="Public">Public</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Doc Number / Reference</label>
                  <input
                    type="text"
                    value={uploadForm.docNumber}
                    onChange={(e) => setUploadForm({ ...uploadForm, docNumber: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Approving Authority</label>
                  <input
                    type="text"
                    value={uploadForm.approvedBy}
                    onChange={(e) => setUploadForm({ ...uploadForm, approvedBy: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Summary of document purpose and scope..."
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Tags (Comma-separated)</label>
                <input
                  type="text"
                  placeholder="Safety, SOP, Audit"
                  value={uploadForm.tags}
                  onChange={(e) => setUploadForm({ ...uploadForm, tags: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm shadow-blue-200"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

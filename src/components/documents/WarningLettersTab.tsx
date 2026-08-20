import React, { useState, useMemo } from 'react';
import { 
  Search, Plus, Filter, Download, Trash2, Eye, 
  AlertTriangle, ShieldAlert, CheckCircle2, Clock, 
  User, Building, Calendar, AlertOctagon, FileText, 
  RefreshCw, Scale, X, ArrowUpDown, ChevronRight, FileWarning,
  FileCheck, Printer, HelpCircle, Sparkles, FileDown, BookOpen
} from 'lucide-react';
import { WarningLetter, WarningLevel, IncidentCategory, WarningStatus } from '../../types/warningLetter';
import { generateWarningLetterPdf } from '../../utils/generateWarningLetterPdf';
import { generateBlankWarningLetterPdf } from '../../utils/generateBlankWarningLetterPdf';
import { cn } from '../../lib/utils';

interface WarningLettersTabProps {
  warningLetters: WarningLetter[];
  onOpenIssueModal: () => void;
  onSelectLetter: (letter: WarningLetter) => void;
  onAcknowledge: (id: string) => void;
  onDelete: (id: string) => void;
}

export const WarningLettersTab: React.FC<WarningLettersTabProps> = ({
  warningLetters,
  onOpenIssueModal,
  onSelectLetter,
  onAcknowledge,
  onDelete
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showBlankTemplateModal, setShowBlankTemplateModal] = useState(false);

  // Filtered Letters
  const filteredLetters = useMemo(() => {
    return warningLetters.filter(letter => {
      // Level filter
      if (levelFilter !== 'all' && letter.warningLevel !== levelFilter) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && letter.status !== statusFilter) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && letter.incidentType !== categoryFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = letter.employeeName.toLowerCase().includes(q);
        const matchEmpId = letter.employeeId.toLowerCase().includes(q);
        const matchNum = letter.letterNumber.toLowerCase().includes(q);
        const matchSubject = letter.subject.toLowerCase().includes(q);
        const matchDept = letter.department.toLowerCase().includes(q);
        const matchCat = letter.incidentType.toLowerCase().includes(q);
        if (!matchName && !matchEmpId && !matchNum && !matchSubject && !matchDept && !matchCat) {
          return false;
        }
      }
      return true;
    });
  }, [warningLetters, levelFilter, statusFilter, categoryFilter, searchQuery]);

  // Analytics Metrics
  const metrics = useMemo(() => {
    const total = warningLetters.length;
    const active = warningLetters.filter(l => l.status === 'Issued' || l.status === 'Under Appeal').length;
    const critical = warningLetters.filter(l => l.warningLevel === 'Final Warning' || l.warningLevel === 'Show Cause Notice').length;
    const acknowledgedOrResolved = warningLetters.filter(l => l.status === 'Acknowledged' || l.status === 'Resolved' || l.status === 'Closed').length;
    const resolutionRate = total > 0 ? Math.round((acknowledgedOrResolved / total) * 100) : 100;
    return {
      total,
      active,
      critical,
      resolutionRate
    };
  }, [warningLetters]);

  const getLevelBadgeClasses = (level: WarningLevel) => {
    switch (level) {
      case 'Verbal Warning Record':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'First Written Warning':
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case 'Second Written Warning':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'Final Warning':
        return 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold';
      case 'Show Cause Notice':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusBadgeClasses = (status: WarningStatus) => {
    switch (status) {
      case 'Issued':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Acknowledged':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Under Appeal':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Resolved':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Closed':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Blank Warning Letter Template Banner for New Issuance */}
      <div className="bg-linear-to-r from-amber-500/10 via-orange-500/5 to-rose-500/10 border-2 border-dashed border-amber-300/80 rounded-2xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-200">
              <FileWarning className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                  Standard Blank Template
                </span>
                <span className="text-xs text-slate-500 font-medium">Doc Ref: ENR-DISC-FORM-2026</span>
              </div>
              <h3 className="text-base font-bold text-slate-900">Blank Warning Letter (Official Template)</h3>
              <p className="text-xs text-slate-600 max-w-2xl mt-0.5">
                Standardized disciplinary document format covering Verbal, 1st/2nd Written, Final Warning & Show Cause notices with fillable sections for statement of facts, corrective action plan (CAP), and signatures.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0">
            <button
              onClick={() => setShowBlankTemplateModal(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-slate-500" /> View Form Structure
            </button>
            <button
              onClick={() => generateBlankWarningLetterPdf()}
              className="px-3.5 py-2 bg-white hover:bg-amber-50 text-amber-800 border border-amber-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-4 h-4 text-amber-600" /> Download Blank PDF
            </button>
            <button
              onClick={onOpenIssueModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-amber-300 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Issue New Warning Letter
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Issued Notices</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{metrics.total} <span className="text-xs text-slate-400 font-normal">Records</span></p>
            <span className="text-[10px] text-amber-700 font-bold">Official Disciplinary Vault</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active / Pending Review</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{metrics.active} <span className="text-xs text-slate-400 font-normal">Active</span></p>
            <span className="text-[10px] text-orange-600 font-bold">Under 30-Day Monitoring</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Critical Escalations</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{metrics.critical} <span className="text-xs text-slate-400 font-normal">Notices</span></p>
            <span className="text-[10px] text-rose-700 font-bold">Final & Show-Cause Tier</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution Rate</p>
            <p className="text-xl font-bold text-slate-900 font-mono">{metrics.resolutionRate}%</p>
            <span className="text-[10px] text-emerald-600 font-bold">Signed / Closed Satisfactorily</span>
          </div>
        </div>
      </div>

      {/* Filter and Action Header */}
      <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search issued warning reference, employee, subject..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent placeholder:text-slate-400 font-medium"
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

          {/* Right Action buttons */}
          <div className="flex items-center gap-2.5">
            <button 
              onClick={() => generateBlankWarningLetterPdf()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-slate-600" /> Blank Form (PDF)
            </button>
            <button 
              onClick={onOpenIssueModal}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs shadow-amber-200 flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Issue Warning Letter
            </button>
          </div>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold uppercase tracking-wider mr-1">
            <Filter className="w-3.5 h-3.5" /> Filters:
          </div>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">All Warning Levels</option>
            <option value="Verbal Warning Record">Verbal Warning Record</option>
            <option value="First Written Warning">First Written Warning</option>
            <option value="Second Written Warning">Second Written Warning</option>
            <option value="Final Warning">Final Warning</option>
            <option value="Show Cause Notice">Show Cause Notice</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="Issued">Issued (Pending Sign-off)</option>
            <option value="Acknowledged">Acknowledged & Signed</option>
            <option value="Under Appeal">Under Appeal</option>
            <option value="Resolved">Resolved / Rectified</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            <option value="all">All Incident Categories</option>
            <option value="Attendance & Punctuality">Attendance & Punctuality</option>
            <option value="Performance & Deliverables">Performance & Deliverables</option>
            <option value="Code of Conduct">Code of Conduct</option>
            <option value="Policy & Security Breach">Policy & Security Breach</option>
            <option value="Insubordination">Insubordination</option>
            <option value="Safety Violation">Safety Violation</option>
          </select>

          {(levelFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all' || searchQuery) && (
            <button
              onClick={() => {
                setLevelFilter('all');
                setStatusFilter('all');
                setCategoryFilter('all');
                setSearchQuery('');
              }}
              className="text-xs text-amber-700 hover:text-amber-800 font-bold px-2 py-1 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Warning Letters Master Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/40 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">All Issued Warning Letters ({filteredLetters.length})</h4>
            <p className="text-xs text-slate-500">Historical disciplinary warnings, digital signatures, and review status.</p>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
            {metrics.active} Under Active Review
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Notice Ref & Level</th>
                <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee & Dept</th>
                <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Violation / Subject</th>
                <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Incident Category</th>
                <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Issue Date</th>
                <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Review Due</th>
                <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="py-3.5 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {filteredLetters.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-slate-400 text-sm">
                    <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-800">No Warning Letters Found</p>
                    <p className="text-xs text-slate-400 mt-1">No disciplinary records match your current filter criteria.</p>
                    <button 
                      onClick={() => { setLevelFilter('all'); setStatusFilter('all'); setCategoryFilter('all'); setSearchQuery(''); }}
                      className="mt-3 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  </td>
                </tr>
              ) : (
                filteredLetters.map((letter) => {
                  return (
                    <tr 
                      key={letter.id} 
                      className="hover:bg-amber-50/30 transition-colors group cursor-pointer"
                      onClick={() => onSelectLetter(letter)}
                    >
                      {/* Notice Ref & Level */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          <span className="font-mono text-xs font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                            {letter.letterNumber}
                          </span>
                          <span className={cn(
                            "inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider w-fit",
                            getLevelBadgeClasses(letter.warningLevel)
                          )}>
                            {letter.warningLevel}
                          </span>
                        </div>
                      </td>

                      {/* Employee Details */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {letter.employeeName.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">{letter.employeeName}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{letter.employeeId} &bull; {letter.department}</p>
                          </div>
                        </div>
                      </td>

                      {/* Subject */}
                      <td className="py-4 px-4 max-w-xs">
                        <p className="text-xs font-semibold text-slate-800 line-clamp-1 group-hover:text-amber-800 transition-colors" title={letter.subject}>
                          {letter.subject}
                        </p>
                        <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                          {letter.incidentDescription}
                        </p>
                      </td>

                      {/* Incident Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                          {letter.incidentType}
                        </span>
                      </td>

                      {/* Issue Date */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs text-slate-600">
                        {letter.issueDate}
                      </td>

                      {/* Review Due */}
                      <td className="py-4 px-4 whitespace-nowrap text-xs font-semibold text-amber-800">
                        {letter.reviewDate}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className={cn(
                          "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
                          getStatusBadgeClasses(letter.status)
                        )}>
                          {letter.status === 'Acknowledged' && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />}
                          {letter.status === 'Issued' && <Clock className="w-2.5 h-2.5 text-amber-600" />}
                          {letter.status === 'Under Appeal' && <Scale className="w-2.5 h-2.5 text-indigo-600" />}
                          {letter.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 whitespace-nowrap text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => onSelectLetter(letter)}
                            title="Preview Notice"
                            className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => generateWarningLetterPdf(letter)}
                            title="Download PDF Letter"
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          {letter.status === 'Issued' && (
                            <button 
                              onClick={() => onAcknowledge(letter.id)}
                              title="Mark as Acknowledged"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          <button 
                            onClick={() => onDelete(letter.id)}
                            title="Delete Notice"
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

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-medium text-slate-500">
          <span>Displaying {filteredLetters.length} of {warningLetters.length} disciplinary records</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => generateBlankWarningLetterPdf()}
              className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5" /> Download Blank Warning Letter Template (A4 PDF)
            </button>
          </div>
        </div>
      </div>

      {/* Blank Warning Letter Structure / Preview Modal */}
      {showBlankTemplateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
                  <FileWarning className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Blank Warning Letter Form Structure</h3>
                  <p className="text-xs text-slate-500">Official HR Document Vault Standard Form HR-DISC-WL-BLANK</p>
                </div>
              </div>
              <button
                onClick={() => setShowBlankTemplateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 text-xs text-slate-700">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between font-bold text-slate-900 border-b border-slate-200 pb-2">
                  <span>ENERPACK ENTERPRISES PVT. LTD.</span>
                  <span className="font-mono text-amber-700">REF: ENR-WL-2026-XXXX</span>
                </div>
                <p className="text-[11px] text-slate-500">Disciplinary & Compliance Committee &bull; Formal Disciplinary Notice</p>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-3 bg-white">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-amber-800">1. Recipient & Designation Metadata</h4>
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-slate-400 font-medium">Employee Full Name:</span> ______________________
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-slate-400 font-medium">Employee ID:</span> EMP-________
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-slate-400 font-medium">Designation:</span> ______________________
                  </div>
                  <div className="border-b border-dashed border-slate-300 pb-1">
                    <span className="text-slate-400 font-medium">Department:</span> ______________________
                  </div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-white">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-amber-800">2. Incident Classification & Statement of Facts</h4>
                <p className="text-[11px] text-slate-500 italic">Fillable lines for date, time, detailed description of violation, and witnesses.</p>
                <div className="space-y-1.5 pt-1">
                  <div className="h-4 border-b border-slate-200"></div>
                  <div className="h-4 border-b border-slate-200"></div>
                  <div className="h-4 border-b border-slate-200"></div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-white">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] text-amber-800">3. Corrective Action Plan & 30-Day PIP Timeline</h4>
                <p className="text-[11px] text-slate-500 italic">Measurable improvement milestones and mandatory mentor check-ins.</p>
                <div className="space-y-1.5 pt-1">
                  <div className="h-4 border-b border-slate-200"></div>
                  <div className="h-4 border-b border-slate-200"></div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 space-y-2 bg-rose-50/50">
                <h4 className="font-bold text-rose-800 uppercase tracking-wider text-[11px]">4. Consequences & Signatures Section</h4>
                <p className="text-[11px] text-slate-600">3 formal sign-off boxes: Issuing HR Authority, Reporting Manager, and Recipient Employee acknowledgement.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4 mt-5">
              <button
                onClick={() => setShowBlankTemplateModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  generateBlankWarningLetterPdf();
                  setShowBlankTemplateModal(false);
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <FileDown className="w-4 h-4" /> Download Blank Printable PDF
              </button>
              <button
                onClick={() => {
                  setShowBlankTemplateModal(false);
                  onOpenIssueModal();
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="w-4 h-4" /> Fill & Issue Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


import React, { useState } from 'react';
import { 
  X, Download, CheckCircle2, AlertTriangle, ShieldCheck, 
  Trash2, User, Building, Calendar, Scale, MessageSquare, Printer
} from 'lucide-react';
import { WarningLetter } from '../../types/warningLetter';
import { generateWarningLetterPdf } from '../../utils/generateWarningLetterPdf';
import { cn } from '../../lib/utils';

interface WarningLetterPreviewModalProps {
  letter: WarningLetter | null;
  onClose: () => void;
  onAcknowledge: (id: string) => void;
  onUpdateStatus: (id: string, newStatus: WarningLetter['status'], appealNote?: string) => void;
  onDelete: (id: string) => void;
}

export const WarningLetterPreviewModal: React.FC<WarningLetterPreviewModalProps> = ({
  letter,
  onClose,
  onAcknowledge,
  onUpdateStatus,
  onDelete
}) => {
  const [showAppealInput, setShowAppealInput] = useState(false);
  const [appealText, setAppealText] = useState('');

  if (!letter) return null;

  const handleDownload = () => {
    generateWarningLetterPdf(letter);
  };

  const handleSaveAppeal = () => {
    if (!appealText.trim()) return;
    onUpdateStatus(letter.id, 'Under Appeal', appealText.trim());
    setShowAppealInput(false);
  };

  const getLevelBadgeClasses = (level: WarningLetter['warningLevel']) => {
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
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full flex flex-col max-h-[92vh] overflow-hidden">
        {/* Top Action Bar */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono font-bold bg-white text-slate-800 px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
              {letter.letterNumber}
            </span>
            <span className={cn(
              "px-2.5 py-0.5 rounded-full text-[11px] font-bold border uppercase tracking-wider",
              getLevelBadgeClasses(letter.warningLevel)
            )}>
              {letter.warningLevel}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Letter Document Viewer */}
        <div className="p-6 overflow-y-auto space-y-5 bg-white text-slate-900 text-sm">
          {/* Formal Letterhead */}
          <div className="border-b border-slate-200 pb-4 text-center space-y-1">
            <h1 className="font-extrabold tracking-wider text-base text-slate-900 uppercase">
              ENERPACK ENTERPRISES PVT. LTD.
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">
              People & Culture Disciplinary Committee &bull; Confidential Record
            </p>
            <div className="flex items-center justify-center gap-4 text-xs text-slate-400 font-mono pt-1">
              <span>Date: {letter.issueDate}</span>
              <span>&bull;</span>
              <span>Ref: {letter.letterNumber}</span>
              <span>&bull;</span>
              <span className="text-red-600 font-bold uppercase">Strictly Confidential</span>
            </div>
          </div>

          {/* Employee & Case Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-xs">
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">Employee Name</span>
              <span className="font-bold text-slate-900 text-sm">{letter.employeeName}</span>
              <span className="text-slate-500 block font-mono text-[11px]">{letter.employeeId} &bull; {letter.employeeDesignation}</span>
            </div>
            <div>
              <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">Department</span>
              <span className="font-bold text-slate-900 text-sm">{letter.department}</span>
              <span className="text-slate-500 block text-[11px]">Incident Category: {letter.incidentType}</span>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">Incident Date</span>
              <span className="font-semibold text-slate-800">{letter.incidentDate}</span>
            </div>
            <div className="pt-2 border-t border-slate-200/60">
              <span className="text-slate-400 font-medium block uppercase text-[10px] tracking-wider">Corrective Review Due</span>
              <span className="font-bold text-amber-700">{letter.reviewDate}</span>
            </div>
          </div>

          {/* Subject Line */}
          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-widest block mb-0.5">Subject Notice</span>
            <p className="font-bold text-slate-900 text-sm">{letter.subject}</p>
          </div>

          {/* Section 1: Infraction */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> 1. Statement of Infraction & Findings
            </h3>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-xs leading-relaxed">
              {letter.incidentDescription}
            </div>
          </div>

          {/* Section 2: Corrective Action */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> 2. Required Corrective Measures & Performance Targets
            </h3>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 text-xs leading-relaxed whitespace-pre-line">
              {letter.correctiveAction}
            </div>
          </div>

          {/* Section 3: Consequences */}
          <div className="space-y-1.5">
            <h3 className="font-bold text-rose-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-rose-600" /> 3. Consequences of Further Non-Compliance
            </h3>
            <div className="p-3.5 bg-rose-50/40 rounded-xl border border-rose-100 text-rose-950 text-xs leading-relaxed">
              {letter.consequences}
            </div>
          </div>

          {/* Section 4: Appeal Notes if any */}
          {letter.appealNotes && (
            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-1">
              <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-widest flex items-center gap-1">
                <MessageSquare className="w-3 h-3 text-indigo-600" /> Employee Appeal & Hearing Notes
              </span>
              <p className="text-xs text-indigo-950 leading-relaxed italic">{letter.appealNotes}</p>
            </div>
          )}

          {/* Signatures and Acknowledgment Status */}
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Authorized Signatory</span>
              <p className="font-bold text-slate-900">{letter.issuedBy}</p>
              <p className="text-[11px] text-slate-500">{letter.issuedByRole}</p>
              <span className="inline-block mt-1 text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-medium border border-blue-100">
                Official HR Stamp Verified
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1 text-xs">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Employee Acknowledgment</span>
              {letter.status === 'Acknowledged' || letter.acknowledgedAt ? (
                <div>
                  <p className="font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Acknowledged & Signed
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{letter.acknowledgedAt}</p>
                </div>
              ) : (
                <div>
                  <p className="font-semibold text-amber-700">Pending Employee Sign-off</p>
                  <button
                    onClick={() => onAcknowledge(letter.id)}
                    className="mt-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Mark as Acknowledged
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Appeal Input Form if toggled */}
          {showAppealInput && (
            <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-900">Record Employee Appeal / Representation</span>
                <button 
                  onClick={() => setShowAppealInput(false)}
                  className="text-xs text-slate-500 hover:text-slate-700"
                >
                  Cancel
                </button>
              </div>
              <textarea
                rows={3}
                value={appealText}
                onChange={(e) => setAppealText(e.target.value)}
                placeholder="Enter summary of employee's written response, hearing notes, or mitigation factors..."
                className="w-full p-2.5 bg-white border border-indigo-200 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
              ></textarea>
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleSaveAppeal}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                >
                  Save Appeal & Set Under Review
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Footer Actions */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const id = letter.id;
                onClose();
                onDelete(id);
              }}
              className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1 cursor-pointer p-1.5 rounded-lg hover:bg-red-50"
              title="Delete this record"
            >
              <Trash2 className="w-4 h-4" /> Delete Record
            </button>

            {!letter.appealNotes && !showAppealInput && (
              <button
                onClick={() => setShowAppealInput(true)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer p-1.5 rounded-lg hover:bg-indigo-50"
              >
                <MessageSquare className="w-4 h-4" /> File Appeal / Notes
              </button>
            )}

            {letter.status !== 'Resolved' && (
              <button
                onClick={() => onUpdateStatus(letter.id, 'Resolved')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer p-1.5 rounded-lg hover:bg-emerald-50"
              >
                <CheckCircle2 className="w-4 h-4" /> Mark Resolved
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center gap-1.5 shadow-sm shadow-amber-200 cursor-pointer transition-all"
            >
              <Download className="w-4 h-4" /> Export Letter PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

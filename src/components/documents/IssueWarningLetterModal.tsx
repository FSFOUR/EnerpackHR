import React, { useState } from 'react';
import { X, AlertTriangle, FileText, CheckCircle2, Sparkles, User, Calendar, ShieldAlert, AlertOctagon } from 'lucide-react';
import { WarningLetter, WarningLevel, IncidentCategory } from '../../types/warningLetter';
import { WARNING_TEMPLATES } from '../../data/warningLetterData';
import { cn } from '../../lib/utils';

interface IssueWarningLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIssue: (letter: WarningLetter, autoArchive: boolean) => void;
  employees: Array<{ id: string; name: string; dept: string; designation?: string }>;
}

export const IssueWarningLetterModal: React.FC<IssueWarningLetterModalProps> = ({
  isOpen,
  onClose,
  onIssue,
  employees
}) => {
  const [selectedEmpId, setSelectedEmpId] = useState(employees[0]?.id || 'EMP-001');
  const [warningLevel, setWarningLevel] = useState<WarningLevel>('First Written Warning');
  const [incidentType, setIncidentType] = useState<IncidentCategory>('Attendance & Punctuality');
  const [incidentDate, setIncidentDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 2);
    return d.toISOString().split('T')[0];
  });
  const [reviewDate, setReviewDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [subject, setSubject] = useState('First Written Warning: Habitual Tardiness and Unscheduled Absences');
  const [incidentDescription, setIncidentDescription] = useState(
    'This notice is issued regarding repeated instances of unexcused absences and unpunctuality over the past 30 days. You have accumulated multiple unauthorized absences and failed to adhere to the designated core business hours without providing prior notice or medical certification.'
  );
  const [correctiveAction, setCorrectiveAction] = useState(
    '1. Maintain strict adherence to scheduled work timings and core attendance policies.\n2. Submit all leave applications through the HR portal at least 48 hours in advance for planned leaves, and notify your direct reporting manager by 09:00 AM on the day of any emergency absence.\n3. Achieve 100% punctuality over the next 30-day review period.'
  );
  const [consequences, setConsequences] = useState(
    'Failure to show immediate and sustained improvement in attendance and punctuality will result in subsequent disciplinary action, up to and including a Final Written Warning or termination of employment.'
  );
  const [issuedBy, setIssuedBy] = useState('Priya Patel');
  const [issuedByRole, setIssuedByRole] = useState('Head of People & Culture');
  const [autoArchive, setAutoArchive] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('TPL-01');

  if (!isOpen) return null;

  const currentEmp = employees.find(e => e.id === selectedEmpId) || employees[0];

  const handleApplyTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const template = WARNING_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setWarningLevel(template.warningLevel);
      setIncidentType(template.incidentType);
      setSubject(template.subject);
      setIncidentDescription(template.incidentDescription);
      setCorrectiveAction(template.correctiveAction);
      setConsequences(template.consequences);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !incidentDescription.trim()) return;

    const formattedIncidentDate = new Date(incidentDate).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
    const formattedReviewDate = new Date(reviewDate).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });
    const todayFormatted = new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    });

    const newLetter: WarningLetter = {
      id: `WL-${Date.now().toString().slice(-4)}`,
      letterNumber: `WL-2026-${Math.floor(100 + Math.random() * 900)}`,
      employeeId: currentEmp.id,
      employeeName: currentEmp.name,
      employeeDesignation: currentEmp.designation || 'Staff Member',
      department: currentEmp.dept,
      warningLevel,
      incidentType,
      incidentDate: formattedIncidentDate,
      issueDate: todayFormatted,
      reviewDate: formattedReviewDate,
      status: 'Issued',
      subject: subject.trim(),
      incidentDescription: incidentDescription.trim(),
      correctiveAction: correctiveAction.trim(),
      consequences: consequences.trim(),
      issuedBy: issuedBy.trim() || 'HR Department',
      issuedByRole: issuedByRole.trim() || 'People Operations'
    };

    onIssue(newLetter, autoArchive);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3.5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Issue Formal Disciplinary Warning Letter</h2>
              <p className="text-xs text-slate-500">Draft, assign, and cryptographically log a formal employee warning notice.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick HR Template Selector */}
        <div className="bg-gradient-to-r from-amber-50/70 to-orange-50/50 p-4 rounded-xl border border-amber-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Quick Disciplinary Templates
            </span>
            <span className="text-[10px] text-amber-700 font-medium">Click to auto-populate fields</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {WARNING_TEMPLATES.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tpl.id)}
                className={cn(
                  "px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer border",
                  selectedTemplateId === tpl.id
                    ? "bg-amber-600 text-white border-amber-600 shadow-xs"
                    : "bg-white text-slate-700 border-slate-200 hover:border-amber-300 hover:bg-amber-50/50"
                )}
              >
                {tpl.name}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Employee & Warning Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Target Employee *
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} ({emp.id}) &bull; {emp.dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Warning Escalation Level *
              </label>
              <select
                value={warningLevel}
                onChange={(e) => setWarningLevel(e.target.value as WarningLevel)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Verbal Warning Record">Verbal Warning Record</option>
                <option value="First Written Warning">First Written Warning</option>
                <option value="Second Written Warning">Second Written Warning</option>
                <option value="Final Warning">Final Warning (Pre-Termination)</option>
                <option value="Show Cause Notice">Show Cause Notice</option>
              </select>
            </div>
          </div>

          {/* Incident Category & Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Incident Category *
              </label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value as IncidentCategory)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="Attendance & Punctuality">Attendance & Punctuality</option>
                <option value="Performance & Deliverables">Performance & Deliverables</option>
                <option value="Code of Conduct">Code of Conduct</option>
                <option value="Policy & Security Breach">Policy & Security Breach</option>
                <option value="Insubordination">Insubordination</option>
                <option value="Safety Violation">Safety Violation</option>
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Incident Date *
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                Corrective Review Due *
              </label>
              <input
                type="date"
                value={reviewDate}
                onChange={(e) => setReviewDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Notice Subject Line *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. First Written Warning: Habitual Tardiness"
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          {/* Incident Description */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Detailed Statement of Infraction / Factual Summary *
            </label>
            <textarea
              rows={3}
              value={incidentDescription}
              onChange={(e) => setIncidentDescription(e.target.value)}
              placeholder="Detail the specific dates, instances, or behaviors observed..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
              required
            ></textarea>
          </div>

          {/* Corrective Action & Plan */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Mandatory Corrective Measures & Performance Expectations *
            </label>
            <textarea
              rows={2}
              value={correctiveAction}
              onChange={(e) => setCorrectiveAction(e.target.value)}
              placeholder="Specify required actions, attendance rules, or KPI targets..."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs leading-relaxed focus:ring-2 focus:ring-amber-500 focus:outline-none resize-none"
              required
            ></textarea>
          </div>

          {/* Consequences */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Consequences of Continued Non-Compliance *
            </label>
            <input
              type="text"
              value={consequences}
              onChange={(e) => setConsequences(e.target.value)}
              placeholder="e.g. Failure to improve will result in a Final Warning or termination."
              className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              required
            />
          </div>

          {/* Issuing Authority & Sync option */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Issued By (Signatory)
              </label>
              <input
                type="text"
                value={issuedBy}
                onChange={(e) => setIssuedBy(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                Signatory Official Role
              </label>
              <input
                type="text"
                value={issuedByRole}
                onChange={(e) => setIssuedByRole(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="autoArchiveCheck"
              checked={autoArchive}
              onChange={(e) => setAutoArchive(e.target.checked)}
              className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
            />
            <label htmlFor="autoArchiveCheck" className="text-xs text-slate-700 font-medium cursor-pointer">
              Automatically create and archive a secure PDF record in the employee's document vault
            </label>
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-sm shadow-amber-200 flex items-center gap-2 cursor-pointer transition-all"
            >
              <FileText className="w-4 h-4" /> Issue Warning Letter
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

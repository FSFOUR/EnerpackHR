import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';
import { EmployeeMasterRecord } from '../../types/employeeMaster';

interface DeleteEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeMasterRecord | null;
  onConfirmDelete: (employee: EmployeeMasterRecord) => Promise<void>;
}

export const DeleteEmployeeModal: React.FC<DeleteEmployeeModalProps> = ({
  isOpen,
  onClose,
  employee,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !employee) return null;

  const handleDelete = async () => {
    setIsDeleting(true);
    setError(null);
    try {
      await onConfirmDelete(employee);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to permanently delete employee record. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
      >
        {/* Header Banner */}
        <div className="px-6 py-4.5 bg-rose-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-xl">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 id="delete-dialog-title" className="font-extrabold text-base leading-tight">
                Remove Employee Permanently
              </h3>
              <p className="text-[11px] text-rose-100 font-medium">Irreversible database deletion</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Warning Message */}
          <div className="flex items-start gap-3 p-3.5 bg-rose-50/80 border border-rose-200 rounded-xl text-xs text-rose-900">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Are you sure you want to permanently delete this employee?</p>
              <p className="text-rose-700 leading-relaxed text-[11px]">
                This will permanently remove the employee record from Cloud Firestore and the Enerpack Master workforce database.
                This action <strong className="font-extrabold">cannot be undone</strong>.
              </p>
            </div>
          </div>

          {/* Target Employee Summary Card */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employee Information</span>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-mono font-bold text-xs rounded border border-blue-200">
                {employee.id}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center shrink-0 text-base">
                {employee.photo || (employee.name ? employee.name.charAt(0).toUpperCase() : 'E')}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-slate-900 truncate">{employee.name}</h4>
                <p className="text-xs text-slate-500 truncate">
                  {employee.occupation} &bull; {employee.department || 'Operations'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-600">
              <div><span className="text-slate-400">Join Date:</span> {employee.joinDate || 'N/A'}</div>
              <div><span className="text-slate-400">Basic Salary:</span> ₹{employee.basicSalary?.toLocaleString() || '0'}</div>
              <div><span className="text-slate-400">Mobile:</span> {employee.mobile || 'N/A'}</div>
              <div><span className="text-slate-400">Status:</span> <span className="font-semibold text-slate-800">{employee.status}</span></div>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2.5 border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer min-h-[42px] disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 cursor-pointer min-h-[42px] disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Removing Permanently...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete Employee</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

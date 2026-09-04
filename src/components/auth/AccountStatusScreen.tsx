import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  ShieldAlert, 
  Clock, 
  UserX, 
  LogOut, 
  RefreshCw, 
  Building2, 
  Mail, 
  BadgeCheck, 
  CheckCircle2 
} from 'lucide-react';

interface AccountStatusScreenProps {
  status: 'pending' | 'suspended' | 'inactive';
}

export const AccountStatusScreen: React.FC<AccountStatusScreenProps> = ({ status }) => {
  const { user, userProfile, logout, refreshProfile } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedMsg, setRefreshedMsg] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshProfile();
    setRefreshedMsg(true);
    setTimeout(() => setRefreshedMsg(false), 3000);
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-slate-900">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8 text-center relative overflow-hidden">
        
        {/* Brand Banner */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs">
            <Building2 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="font-extrabold text-base tracking-tight text-slate-900 block leading-tight">
              ENERPACK <span className="text-blue-600">HR</span>
            </span>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Enterprise Suite
            </span>
          </div>
        </div>

        {/* Status Icon & Main Title */}
        {status === 'pending' && (
          <div>
            <div className="w-16 h-16 bg-amber-100 border border-amber-200 rounded-2xl flex items-center justify-center text-amber-600 mx-auto mb-4">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Pending Administrator Approval
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto mb-6">
              This account is waiting for Enerpack administrator approval. An authorized HR administrator must activate your access before you can view protected company modules.
            </p>
          </div>
        )}

        {status === 'suspended' && (
          <div>
            <div className="w-16 h-16 bg-rose-100 border border-rose-200 rounded-2xl flex items-center justify-center text-rose-600 mx-auto mb-4">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-rose-900 mb-2">
              Account Suspended
            </h2>
            <p className="text-xs text-rose-700 leading-relaxed max-w-md mx-auto mb-6">
              Your account has been suspended. Please contact HR or your system administrator for assistance.
            </p>
          </div>
        )}

        {status === 'inactive' && (
          <div>
            <div className="w-16 h-16 bg-slate-100 border border-slate-300 rounded-2xl flex items-center justify-center text-slate-600 mx-auto mb-4">
              <UserX className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Account Inactive
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto mb-6">
              This account is currently marked as inactive. Please contact your department manager or HR admin.
            </p>
          </div>
        )}

        {/* User Account Snapshot */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left mb-6 space-y-2.5">
          <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-400 uppercase text-[10px]">User Profile</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              status === 'pending' ? 'bg-amber-100 text-amber-800' :
              status === 'suspended' ? 'bg-rose-100 text-rose-800' : 'bg-slate-200 text-slate-700'
            }`}>
              Status: {status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-slate-400 text-[11px] block">Full Name</span>
              <span className="font-bold text-slate-800 truncate block">
                {userProfile?.displayName || user?.displayName || 'User'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Email</span>
              <span className="font-medium text-slate-700 truncate block">
                {userProfile?.email || user?.email}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Role Assigned</span>
              <span className="font-bold text-slate-800 font-mono text-[11px]">
                {userProfile?.role || 'EMPLOYEE'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 text-[11px] block">Employee ID</span>
              <span className="font-mono text-slate-600 text-[11px]">
                {userProfile?.employeeId || 'Not Linked Yet'}
              </span>
            </div>
          </div>
        </div>

        {refreshedMsg && (
          <div className="mb-4 text-xs font-semibold text-emerald-600 flex items-center justify-center gap-1.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Profile status checked and up to date</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 min-h-[44px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Check Approval Status</span>
          </button>

          <button
            type="button"
            onClick={logout}
            className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>

      </div>
    </div>
  );
};

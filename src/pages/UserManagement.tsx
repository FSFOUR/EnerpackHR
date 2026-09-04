import React, { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth, UserProfile, UserRole, UserStatus } from '../context/AuthContext';
import { logAuditEvent, AuditLogData } from '../lib/auditLogger';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  Shield, 
  Search, 
  Filter, 
  Link as LinkIcon, 
  CheckCircle2, 
  AlertTriangle, 
  Edit2, 
  Key, 
  RefreshCw,
  History,
  Building2,
  ChevronDown
} from 'lucide-react';
import { cn } from '../lib/utils';

// Standard Enerpack directory employees for linking
const defaultEmployeesList = [
  { id: 'EMP-001', name: 'Arjun Sharma', department: 'Engineering', designation: 'Senior Developer' },
  { id: 'EMP-002', name: 'Priya Patel', department: 'Human Resources', designation: 'HR Manager' },
  { id: 'EMP-003', name: 'Vikram Singh', department: 'Sales', designation: 'Account Executive' },
  { id: 'EMP-004', name: 'Ananya Desai', department: 'Marketing', designation: 'Marketing Specialist' },
  { id: 'EMP-005', name: 'Rohan Mehta', department: 'Finance', designation: 'Accountant' },
  { id: 'ENP-EMP-00125', name: 'Kavita Iyer', department: 'Operations', designation: 'Operations Specialist' },
  { id: 'ENP-EMP-00128', name: 'Suresh Raina', department: 'Fleet & Logistics', designation: 'Fleet Driver' },
  { id: 'ENP-EMP-00130', name: 'Amit Verma', department: 'Production', designation: 'Production Supervisor' },
];

const ALL_ROLES: { role: UserRole; label: string; desc: string }[] = [
  { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full unrestricted application access' },
  { role: 'ADMIN', label: 'Admin', desc: 'HR, employees, attendance, leave, payroll & admin modules' },
  { role: 'HR_MANAGER', label: 'HR Manager', desc: 'Employee records, contracts, recruitment, attendance & leave' },
  { role: 'ACCOUNTANT', label: 'Accountant', desc: 'Payroll, salary slips, overtime & financial expenses' },
  { role: 'PRODUCTION_MANAGER', label: 'Production Manager', desc: 'Production employees & operational records' },
  { role: 'SUPERVISOR', label: 'Supervisor', desc: 'Assigned employee attendance, shifts & performance' },
  { role: 'EMPLOYEE', label: 'Employee', desc: 'Permitted personal records only' },
  { role: 'DRIVER', label: 'Driver', desc: 'Vehicle tracker & assigned vehicle records only' },
];

export const UserManagement: React.FC = () => {
  const { userProfile: currentUserProfile } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('users');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [roleModalUser, setRoleModalUser] = useState<UserProfile | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<UserRole>('EMPLOYEE');

  const [linkModalUser, setLinkModalUser] = useState<UserProfile | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [customEmployeeId, setCustomEmployeeId] = useState<string>('');
  const [departmentInput, setDepartmentInput] = useState<string>('');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Real-time subscription to users collection
  useEffect(() => {
    const usersQuery = query(collection(db, 'users'));
    const unsubscribeUsers = onSnapshot(usersQuery, (snapshot) => {
      const usersList: UserProfile[] = [];
      snapshot.forEach((docSnap) => {
        usersList.push(docSnap.data() as UserProfile);
      });
      // Sort: pending first, then by lastLoginAt desc
      usersList.sort((a, b) => {
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (b.status === 'pending' && a.status !== 'pending') return 1;
        return new Date(b.lastLoginAt || 0).getTime() - new Date(a.lastLoginAt || 0).getTime();
      });
      setUsers(usersList);
      setLoading(false);
    }, (error) => {
      console.warn('Could not load users list in real-time:', error);
      setLoading(false);
    });

    // Real-time subscription to auditLogs
    const auditQuery = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'));
    const unsubscribeAudit = onSnapshot(auditQuery, (snapshot) => {
      const logsList: any[] = [];
      snapshot.forEach((docSnap) => {
        logsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAuditLogs(logsList);
    }, (error) => {
      console.warn('Could not load audit logs:', error);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeAudit();
    };
  }, []);

  // Update Status action (Approve, Suspend, Activate)
  const handleUpdateStatus = async (targetUser: UserProfile, newStatus: UserStatus) => {
    try {
      const userRef = doc(db, 'users', targetUser.uid);
      const actionName = 
        newStatus === 'active' && targetUser.status === 'pending' ? 'Account Approved' :
        newStatus === 'active' ? 'Account Activated' :
        newStatus === 'suspended' ? 'Account Suspended' : 'Status Changed';

      await updateDoc(userRef, {
        status: newStatus,
        approvedBy: newStatus === 'active' ? currentUserProfile?.uid : targetUser.approvedBy,
        approvedAt: newStatus === 'active' ? new Date().toISOString() : targetUser.approvedAt,
      });

      // Requirement 10: Log audit event
      await logAuditEvent({
        action: actionName,
        module: 'Users',
        recordId: targetUser.uid,
        previousValue: targetUser.status,
        newValue: newStatus,
        metadata: { targetUserEmail: targetUser.email, targetUserName: targetUser.displayName }
      });

      showToast(`User ${targetUser.displayName} marked as ${newStatus}.`);
    } catch (err) {
      console.error('Failed to update user status:', err);
      showToast('Error updating user status. Please check permissions.');
    }
  };

  // Change Role action
  const handleSaveRole = async () => {
    if (!roleModalUser) return;
    try {
      const userRef = doc(db, 'users', roleModalUser.uid);
      await updateDoc(userRef, {
        role: selectedNewRole
      });

      // Requirement 10: Log audit event
      await logAuditEvent({
        action: 'Role Changed',
        module: 'Users',
        recordId: roleModalUser.uid,
        previousValue: roleModalUser.role,
        newValue: selectedNewRole,
        metadata: { targetUserEmail: roleModalUser.email }
      });

      showToast(`Role for ${roleModalUser.displayName} changed to ${selectedNewRole}.`);
      setRoleModalUser(null);
    } catch (err) {
      console.error('Failed to update user role:', err);
      showToast('Error updating role.');
    }
  };

  // Link Employee ID action (Requirement 8)
  const handleSaveEmployeeLink = async () => {
    if (!linkModalUser) return;
    const finalEmpId = (customEmployeeId.trim() || selectedEmployeeId).trim();
    if (!finalEmpId) {
      showToast('Please select or input an Employee ID.');
      return;
    }

    try {
      const userRef = doc(db, 'users', linkModalUser.uid);
      await updateDoc(userRef, {
        employeeId: finalEmpId,
        department: departmentInput.trim() || linkModalUser.department || 'Operations'
      });

      // Requirement 10: Log audit event
      await logAuditEvent({
        action: 'Employee Linked',
        module: 'Employees',
        recordId: linkModalUser.uid,
        previousValue: linkModalUser.employeeId || 'none',
        newValue: finalEmpId,
        metadata: { targetUserEmail: linkModalUser.email }
      });

      showToast(`Linked ${linkModalUser.displayName} to Employee ${finalEmpId}.`);
      setLinkModalUser(null);
      setCustomEmployeeId('');
      setSelectedEmployeeId('');
    } catch (err) {
      console.error('Failed to link employee:', err);
      showToast('Error linking employee.');
    }
  };

  // Reset Access action
  const handleResetAccess = async (targetUser: UserProfile) => {
    try {
      const userRef = doc(db, 'users', targetUser.uid);
      await updateDoc(userRef, {
        status: 'pending',
        role: 'EMPLOYEE'
      });

      await logAuditEvent({
        action: 'Access Reset',
        module: 'Users',
        recordId: targetUser.uid,
        previousValue: JSON.stringify({ status: targetUser.status, role: targetUser.role }),
        newValue: JSON.stringify({ status: 'pending', role: 'EMPLOYEE' }),
      });

      showToast(`Access reset for ${targetUser.displayName}.`);
    } catch (err) {
      console.error('Failed to reset access:', err);
      showToast('Error resetting access.');
    }
  };

  // Filtered users list
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.employeeId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.department || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  const pendingCount = users.filter(u => u.status === 'pending').length;
  const activeCount = users.filter(u => u.status === 'active').length;
  const suspendedCount = users.filter(u => u.status === 'suspended').length;

  return (
    <div className="space-y-6 max-w-full mx-auto pb-10">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 leading-tight">
            User Management & Access Control
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Authorize accounts, assign role permissions, link employee records, and review compliance audits.
          </p>
        </div>

        {/* Tab switcher: Users vs Audit Log */}
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === 'users' ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <Users className="w-4 h-4" />
            <span>Users Directory ({users.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={cn(
              "px-4 py-2 rounded-lg transition-all cursor-pointer flex items-center gap-2",
              activeTab === 'audit' ? "bg-white text-blue-700 shadow-xs" : "text-slate-600 hover:text-slate-900"
            )}
          >
            <History className="w-4 h-4" />
            <span>Audit Trail ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Users</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-black text-slate-900 mt-2">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-amber-200/80 bg-amber-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800">Pending Approval</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-700 mt-2">{pendingCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800">Active Accounts</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-black text-emerald-700 mt-2">{activeCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 bg-rose-50/20 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800">Suspended / Inactive</span>
            <UserX className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-700 mt-2">{suspendedCount}</p>
        </div>
      </div>

      {activeTab === 'users' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-50/50">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search name, email, or employee ID..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="ALL">All Roles</option>
                  {ALL_ROLES.map(r => (
                    <option key={r.role} value={r.role}>{r.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none"
                >
                  <option value="ALL">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Employee ID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No matching user accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isSelf = u.uid === currentUserProfile?.uid;
                    return (
                      <tr key={u.uid} className="hover:bg-slate-50/60 transition-colors">
                        {/* Name & Email */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs uppercase border border-blue-200">
                              {u.displayName?.charAt(0) || u.email?.charAt(0) || 'U'}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate flex items-center gap-1.5">
                                <span>{u.displayName || 'Unnamed User'}</span>
                                {isSelf && (
                                  <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-1.5 py-0.2 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 truncate block">
                                {u.email}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Employee ID */}
                        <td className="py-3 px-4">
                          {u.employeeId ? (
                            <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                              {u.employeeId}
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setLinkModalUser(u);
                                setSelectedEmployeeId('');
                                setCustomEmployeeId('');
                                setDepartmentInput(u.department || '');
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
                            >
                              <LinkIcon className="w-3 h-3" /> Link ID
                            </button>
                          )}
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase font-mono",
                            u.role === 'SUPER_ADMIN' ? "bg-purple-100 text-purple-700 border border-purple-200" :
                            u.role === 'ADMIN' ? "bg-blue-100 text-blue-700 border border-blue-200" :
                            u.role === 'HR_MANAGER' ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                            u.role === 'ACCOUNTANT' ? "bg-amber-100 text-amber-700 border border-amber-200" :
                            u.role === 'DRIVER' ? "bg-cyan-100 text-cyan-700 border border-cyan-200" :
                            "bg-slate-100 text-slate-700 border border-slate-200"
                          )}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>

                        {/* Department */}
                        <td className="py-3 px-4 text-slate-600 font-medium">
                          {u.department || 'General'}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase",
                            u.status === 'active' ? "bg-emerald-100 text-emerald-800" :
                            u.status === 'pending' ? "bg-amber-100 text-amber-800 animate-pulse" :
                            u.status === 'suspended' ? "bg-rose-100 text-rose-800" :
                            "bg-slate-200 text-slate-600"
                          )}>
                            {u.status}
                          </span>
                        </td>

                        {/* Last Login */}
                        <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                          {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* APPROVE if pending */}
                            {u.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateStatus(u, 'active')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Approve
                              </button>
                            )}

                            {/* ACTIVATE if suspended */}
                            {u.status === 'suspended' && (
                              <button
                                onClick={() => handleUpdateStatus(u, 'active')}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors cursor-pointer"
                              >
                                Activate
                              </button>
                            )}

                            {/* SUSPEND if active */}
                            {u.status === 'active' && !isSelf && (
                              <button
                                onClick={() => handleUpdateStatus(u, 'suspended')}
                                className="px-2 py-1 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                              >
                                Suspend
                              </button>
                            )}

                            {/* CHANGE ROLE */}
                            <button
                              onClick={() => {
                                setRoleModalUser(u);
                                setSelectedNewRole(u.role);
                              }}
                              title="Change Role"
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-semibold text-[11px] transition-colors cursor-pointer"
                            >
                              Role
                            </button>

                            {/* LINK EMPLOYEE */}
                            <button
                              onClick={() => {
                                setLinkModalUser(u);
                                setSelectedEmployeeId(u.employeeId || '');
                                setCustomEmployeeId(u.employeeId || '');
                                setDepartmentInput(u.department || '');
                              }}
                              title="Link / Update Employee ID"
                              className="p-1 text-slate-400 hover:text-slate-700 rounded cursor-pointer"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                            </button>

                            {/* RESET ACCESS */}
                            {!isSelf && (
                              <button
                                onClick={() => handleResetAccess(u)}
                                title="Reset Access to Default"
                                className="p-1 text-slate-400 hover:text-amber-600 rounded cursor-pointer"
                              >
                                <RefreshCw className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* AUDIT TRAIL TAB (Requirement 10) */
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security & Activity Audit Trail</h3>
              <p className="text-xs text-slate-500">Immutable Firestore records of logins, approvals, role modifications, and records.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Module</th>
                  <th className="py-3 px-4">Record / Target ID</th>
                  <th className="py-3 px-4">Change Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {auditLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No audit events recorded yet.
                    </td>
                  </tr>
                ) : (
                  auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60">
                      <td className="py-3 px-4 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          log.action?.includes('Approve') ? "bg-emerald-100 text-emerald-800" :
                          log.action?.includes('Suspend') ? "bg-rose-100 text-rose-800" :
                          log.action?.includes('Role') ? "bg-purple-100 text-purple-800" :
                          log.action === 'Login' ? "bg-blue-50 text-blue-700" :
                          "bg-slate-100 text-slate-700"
                        )}>
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-800">
                        {log.userName || log.userId}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-600">
                        {log.module}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 truncate max-w-[140px]">
                        {log.recordId || '-'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {log.previousValue && log.newValue ? (
                          <span>{log.previousValue} → <strong className="text-slate-900">{log.newValue}</strong></span>
                        ) : log.newValue ? (
                          <span>Set to: <strong className="text-slate-900">{log.newValue}</strong></span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CHANGE ROLE MODAL */}
      {roleModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Change Role for {roleModalUser.displayName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Select the appropriate RBAC access tier for this user.
            </p>

            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1 mb-6">
              {ALL_ROLES.map((r) => (
                <label
                  key={r.role}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    selectedNewRole === r.role
                      ? "border-blue-500 bg-blue-50/50"
                      : "border-slate-200 hover:bg-slate-50"
                  )}
                >
                  <input
                    type="radio"
                    name="role"
                    checked={selectedNewRole === r.role}
                    onChange={() => setSelectedNewRole(r.role)}
                    className="mt-0.5 accent-blue-600"
                  />
                  <div>
                    <span className="font-bold text-xs text-slate-900 block">{r.label}</span>
                    <span className="text-[11px] text-slate-500 leading-tight block mt-0.5">{r.desc}</span>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setRoleModalUser(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRole}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs shadow-blue-200 cursor-pointer"
              >
                Save Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LINK EMPLOYEE MODAL (Requirement 8) */}
      {linkModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <LinkIcon className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">
                Link Enerpack Employee Record
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Securely associate authenticated Firebase user UID <code className="bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">{linkModalUser.uid.substring(0, 10)}...</code> with an Enerpack employee ID. No duplicate records are created.
            </p>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Select Existing Employee
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => {
                    setSelectedEmployeeId(e.target.value);
                    const found = defaultEmployeesList.find(emp => emp.id === e.target.value);
                    if (found) setDepartmentInput(found.department);
                  }}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">-- Choose from Directory --</option>
                  {defaultEmployeesList.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.id} - {emp.name} ({emp.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Or Enter Custom Employee ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. ENP-EMP-00125"
                  value={customEmployeeId}
                  onChange={(e) => setCustomEmployeeId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  placeholder="e.g. Engineering, Fleet, HR"
                  value={departmentInput}
                  onChange={(e) => setDepartmentInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setLinkModalUser(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEmployeeLink}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-xs shadow-blue-200 cursor-pointer"
              >
                Confirm Link
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

export interface AuditLogData {
  userId: string;
  userName: string;
  action: 
    | 'Login'
    | 'Logout'
    | 'Account Created'
    | 'Account Approved'
    | 'Account Suspended'
    | 'Account Activated'
    | 'Role Changed'
    | 'Access Reset'
    | 'Employee Linked'
    | 'Employee Record Created'
    | 'Employee Record Updated'
    | 'Salary Record Updated'
    | 'Attendance Modified'
    | 'Leave Approved'
    | 'Expense Approved'
    | 'Vehicle Record Modified'
    | string;
  module: 'Auth' | 'Users' | 'Employees' | 'Payroll' | 'Attendance' | 'Leave' | 'Fleet' | 'System';
  recordId?: string;
  previousValue?: string | null;
  newValue?: string | null;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export async function logAuditEvent(entry: Omit<AuditLogData, 'timestamp' | 'userId' | 'userName'> & {
  userId?: string;
  userName?: string;
}) {
  try {
    const currentUid = entry.userId || auth.currentUser?.uid || 'system';
    const currentName = entry.userName || auth.currentUser?.displayName || auth.currentUser?.email || 'System User';
    
    const logPayload = {
      userId: currentUid,
      userName: currentName,
      action: entry.action,
      module: entry.module,
      recordId: entry.recordId || '',
      previousValue: entry.previousValue || null,
      newValue: entry.newValue || null,
      timestamp: new Date().toISOString(),
      createdAtServer: serverTimestamp(),
      ...(entry.metadata ? { metadata: entry.metadata } : {})
    };

    const docRef = await addDoc(collection(db, 'auditLogs'), logPayload);
    return docRef.id;
  } catch (error) {
    console.warn('Could not write audit log to Firestore:', error);
    return null;
  }
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { EmployeeMasterRecord } from '../types/employeeMaster';
import { ENERPACK_EMPLOYEE_MASTER } from '../data/enerpackEmployeeMaster';
import { logAuditEvent } from '../lib/auditLogger';

interface EmployeeContextType {
  employees: EmployeeMasterRecord[];
  loading: boolean;
  error: string | null;
  addEmployee: (employee: EmployeeMasterRecord) => Promise<void>;
  updateEmployee: (id: string, updates: Partial<EmployeeMasterRecord>) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
  getEmployeeById: (id: string) => EmployeeMasterRecord | undefined;
}

const EmployeeContext = createContext<EmployeeContextType>({
  employees: [],
  loading: true,
  error: null,
  addEmployee: async () => {},
  updateEmployee: async () => {},
  deleteEmployee: async () => {},
  getEmployeeById: () => undefined,
});

export const useEmployees = () => useContext(EmployeeContext);

export const EmployeeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<EmployeeMasterRecord[]>(ENERPACK_EMPLOYEE_MASTER);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Clear obsolete localStorage mock cache
  useEffect(() => {
    try {
      localStorage.removeItem('enerpack_employees_master');
    } catch {
      // ignore
    }
  }, []);

  // Subscribe to real-time updates from Firestore 'employees' collection
  useEffect(() => {
    if (!user) {
      setEmployees(ENERPACK_EMPLOYEE_MASTER);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'employees'));
    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          // If Firestore employees collection is empty, display master records and seed to Firestore in background
          setEmployees(ENERPACK_EMPLOYEE_MASTER);
          setLoading(false);
          setError(null);
          try {
            for (const emp of ENERPACK_EMPLOYEE_MASTER) {
              const empDocRef = doc(db, 'employees', emp.id);
              await setDoc(empDocRef, emp, { merge: true });
            }
          } catch (seedErr) {
            console.warn('Could not auto-seed master records to Firestore:', seedErr);
          }
          return;
        }

        const loadedEmployees: EmployeeMasterRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Partial<EmployeeMasterRecord>;
          const empName = String(data.name || 'Unnamed Employee');
          loadedEmployees.push({
            id: String(data.id || docSnap.id || ''),
            name: empName,
            joinDate: String(data.joinDate || ''),
            age: data.age !== undefined && data.age !== null ? Number(data.age) : null,
            state: String(data.state || 'Kerala'),
            country: String(data.country || 'India'),
            occupation: String(data.occupation || 'Employee'),
            mobile: String(data.mobile || ''),
            aadhaar: String(data.aadhaar || ''),
            basicSalary: Number(data.basicSalary || 0),
            accountNo: String(data.accountNo || ''),
            bankName: String(data.bankName || ''),
            ifsc: String(data.ifsc || ''),
            status: (data.status as any) || 'Live',
            remarks: String(data.remarks || ''),
            otEligibility: (data.otEligibility as any) || 'OT Employee',
            allowanceEligibility: (data.allowanceEligibility as any) || 'Non-Allowance Employee',
            allowanceType: data.allowanceType || 'Allowance',
            allowanceAmount: Number(data.allowanceAmount || 0),
            department: String(data.department || 'Operations'),
            email: String(data.email || ''),
            photo: data.photo || (empName ? empName.charAt(0).toUpperCase() : 'E'),
          });
        });

        // Merge with master records so default workforce is never wiped out when only partial updates exist in Firestore
        const masterMap = new Map<string, EmployeeMasterRecord>();
        for (const emp of ENERPACK_EMPLOYEE_MASTER) {
          masterMap.set(emp.id, emp);
        }
        for (const emp of loadedEmployees) {
          if (emp.id) {
            masterMap.set(emp.id, { ...(masterMap.get(emp.id) || {}), ...emp });
          }
        }
        const mergedList = Array.from(masterMap.values()).sort((a, b) => (a.id || '').localeCompare(b.id || ''));

        setEmployees(mergedList);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching employees from Firestore:', err);
        setError(err.message);
        setLoading(false);
        // Fall back gracefully to master so screen never goes blank
        setEmployees(prev => prev.length > 0 ? prev : ENERPACK_EMPLOYEE_MASTER);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addEmployee = async (newEmp: EmployeeMasterRecord) => {
    const empId = newEmp.id.trim();
    if (!empId) throw new Error('Employee ID is required');

    // Optimistic local state update
    setEmployees(prev => {
      const idx = prev.findIndex(e => e.id === empId);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newEmp;
        return copy;
      }
      return [...prev, newEmp].sort((a, b) => (a.id || '').localeCompare(b.id || ''));
    });

    try {
      const empDocRef = doc(db, 'employees', empId);
      await setDoc(empDocRef, newEmp, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore setDoc failed, retained in memory:', fsErr);
    }

    try {
      await logAuditEvent({
        action: 'Employee Record Created',
        module: 'Employees',
        recordId: empId,
        newValue: `${newEmp.name} (${newEmp.occupation || 'Employee'}, ${newEmp.department || 'Operations'})`
      });
    } catch {
      // ignore audit log error
    }
  };

  const updateEmployee = async (id: string, updates: Partial<EmployeeMasterRecord>) => {
    if (!id) return;

    // Optimistic local state update to prevent UI flickers or blank renders
    setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ...updates } : e)));

    try {
      const empDocRef = doc(db, 'employees', id);
      // Use setDoc with merge: true so it never throws "No document to update"
      await setDoc(empDocRef, updates, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore setDoc update failed, retained in local state:', fsErr);
    }

    try {
      await logAuditEvent({
        action: 'Employee Record Updated',
        module: 'Employees',
        recordId: id,
        newValue: JSON.stringify(updates)
      });
    } catch {
      // ignore audit log error
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!id) return;
    const target = employees.find(e => e.id === id);
    setEmployees(prev => prev.filter(e => e.id !== id));

    const empDocRef = doc(db, 'employees', id);
    await deleteDoc(empDocRef);

    try {
      await logAuditEvent({
        action: 'Employee Record Deleted',
        module: 'Employees',
        recordId: id,
        previousValue: target ? `${target.name} (${target.id})` : id,
        newValue: 'Deleted from Firestore'
      });
    } catch {
      // ignore audit log error
    }
  };

  const getEmployeeById = (id: string) => {
    return employees.find(e => e.id === id);
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        loading,
        error,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        getEmployeeById,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
};

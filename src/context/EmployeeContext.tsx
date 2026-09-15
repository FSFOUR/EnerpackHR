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
  const [employees, setEmployees] = useState<EmployeeMasterRecord[]>([]);
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
      setEmployees([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, 'employees'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loadedEmployees: EmployeeMasterRecord[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as EmployeeMasterRecord;
          loadedEmployees.push({
            ...data,
            id: data.id || docSnap.id
          });
        });
        // Sort employees by Staff No or Name
        loadedEmployees.sort((a, b) => a.id.localeCompare(b.id));
        setEmployees(loadedEmployees);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching employees from Firestore:', err);
        setError(err.message);
        setLoading(false);
        // Do NOT use fallback mock data. Keep real database state.
        setEmployees([]);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const addEmployee = async (newEmp: EmployeeMasterRecord) => {
    const empId = newEmp.id.trim();
    if (!empId) throw new Error('Employee ID is required');

    const empDocRef = doc(db, 'employees', empId);
    await setDoc(empDocRef, newEmp);

    await logAuditEvent({
      action: 'Employee Record Created',
      module: 'Employees',
      recordId: empId,
      newValue: `${newEmp.name} (${newEmp.occupation || 'Employee'}, ${newEmp.department || 'Operations'})`
    });
  };

  const updateEmployee = async (id: string, updates: Partial<EmployeeMasterRecord>) => {
    const empDocRef = doc(db, 'employees', id);
    await updateDoc(empDocRef, updates);

    await logAuditEvent({
      action: 'Employee Record Updated',
      module: 'Employees',
      recordId: id,
      newValue: JSON.stringify(updates)
    });
  };

  const deleteEmployee = async (id: string) => {
    const empDocRef = doc(db, 'employees', id);
    const target = employees.find(e => e.id === id);
    await deleteDoc(empDocRef);

    await logAuditEvent({
      action: 'Employee Record Deleted',
      module: 'Employees',
      recordId: id,
      previousValue: target ? `${target.name} (${target.id})` : id,
      newValue: 'Deleted from Firestore'
    });
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

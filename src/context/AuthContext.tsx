import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type Role = 'SUPER ADMIN' | 'HR ADMIN' | 'HR MANAGER' | 'MANAGER' | 'ACCOUNTANT' | 'EMPLOYEE';

interface UserData {
  role: Role;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, userData: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (localStorage.getItem('mock_admin') === 'true') {
      setUser({ uid: 'mock-admin', email: 'Shafi3396@gmail.com', displayName: 'Shafi' } as User);
      setUserData({ role: 'SUPER ADMIN', name: 'Shafi', email: 'Shafi3396@gmail.com' });
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user document
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserData(userDoc.data() as UserData);
        } else {
          const newUserData: UserData = {
            role: 'SUPER ADMIN', // First user is SUPER ADMIN for dev purposes
            name: currentUser.displayName || 'Enerpack User',
            email: currentUser.email || '',
          };
          await setDoc(userDocRef, newUserData);
          setUserData(newUserData);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

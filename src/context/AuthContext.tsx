import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

export type Role = 'SUPER ADMIN' | 'HR ADMIN' | 'HR MANAGER' | 'MANAGER' | 'ACCOUNTANT' | 'EMPLOYEE';

export interface UserData {
  role: Role;
  name: string;
  email: string;
  staffNo?: string;
}

export type AuthUser = User | {
  uid: string;
  email: string | null;
  displayName: string | null;
};

interface AuthContextType {
  user: AuthUser | null;
  userData: UserData | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginWithLocalSession: (data: UserData, customUid?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userData: null, 
  loading: true,
  logout: async () => {},
  loginWithLocalSession: async () => {}
});

export const useAuth = () => useContext(AuthContext);

const LOCAL_SESSION_KEY = 'enerpack_auth_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const loginWithLocalSession = async (data: UserData, customUid?: string) => {
    const uid = customUid || `local_${data.email.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const fallbackUser: AuthUser = {
      uid,
      email: data.email,
      displayName: data.name,
    };

    localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({
      uid,
      userData: data,
    }));

    setUser(fallbackUser);
    setUserData(data);

    try {
      const userDocRef = doc(db, 'users', uid);
      await setDoc(userDocRef, data, { merge: true }).catch(() => {});
    } catch {
      // ignore
    }
  };

  const logout = async () => {
    localStorage.removeItem(LOCAL_SESSION_KEY);
    setUser(null);
    setUserData(null);
    try {
      await signOut(auth);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;
    
    // Check saved local session first for instantaneous loading
    const savedSessionRaw = localStorage.getItem(LOCAL_SESSION_KEY);
    if (savedSessionRaw) {
      try {
        const savedSession = JSON.parse(savedSessionRaw);
        if (savedSession?.uid && savedSession?.userData) {
          setUser({
            uid: savedSession.uid,
            email: savedSession.userData.email,
            displayName: savedSession.userData.name,
          });
          setUserData(savedSession.userData);
          setLoading(false);
        }
      } catch (e) {
        console.warn("Could not parse saved session:", e);
      }
    }
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Clear previous snapshot subscription if any
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }

        setLoading(true);
        const defaultName = currentUser.displayName || currentUser.email?.split('@')[0] || 'User';
        const defaultUserData: UserData = {
          role: 'SUPER ADMIN',
          name: defaultName,
          email: currentUser.email || '',
        };
        
        // Immediate optimistic profile fallback
        setUserData(defaultUserData);

        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          
          // Initial check and creation if missing
          const userDoc = await getDoc(userDocRef).catch((e) => {
            console.warn("Could not fetch user document, proceeding with auth profile:", e);
            return null;
          });

          if (userDoc && !userDoc.exists()) {
            await setDoc(userDocRef, defaultUserData, { merge: true }).catch((e) => {
              console.warn("Could not save initial user doc:", e);
            });
          } else if (userDoc && userDoc.exists()) {
            const data = userDoc.data() as UserData;
            setUserData({
              role: data.role || 'SUPER ADMIN',
              name: data.name || defaultName,
              email: data.email || currentUser.email || '',
              staffNo: data.staffNo || '',
            });
          }

          // Real-time updates listener with robust error handling
          unsubscribeSnapshot = onSnapshot(
            userDocRef, 
            (docSnap) => {
              if (docSnap.exists()) {
                const data = docSnap.data() as UserData;
                setUserData({
                  role: data.role || 'SUPER ADMIN',
                  name: data.name || defaultName,
                  email: data.email || currentUser.email || '',
                  staffNo: data.staffNo || '',
                });
              }
              setLoading(false);
            }, 
            (err) => {
              console.warn("Firestore snapshot listener notification (continuing with cached profile):", err);
              setLoading(false);
            }
          );
        } catch (error) {
          console.warn("Error initializing user data:", error);
          setLoading(false);
        }
      } else {
        // If not in Firebase Auth, check if local storage session exists
        const localRaw = localStorage.getItem(LOCAL_SESSION_KEY);
        if (!localRaw) {
          setUser(null);
          setUserData(null);
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, logout, loginWithLocalSession }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

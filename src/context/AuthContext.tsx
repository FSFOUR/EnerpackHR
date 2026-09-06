import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { logAuditEvent } from '../lib/auditLogger';

export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ADMIN' 
  | 'HR_MANAGER' 
  | 'ACCOUNTANT' 
  | 'PRODUCTION_MANAGER' 
  | 'SUPERVISOR' 
  | 'EMPLOYEE' 
  | 'DRIVER';

export type UserStatus = 'pending' | 'active' | 'suspended' | 'inactive';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  department?: string;
  employeeId?: string;
  status: UserStatus;
  createdAt: string;
  lastLoginAt: string;
  approvedBy?: string;
  approvedAt?: string;
}

// Backward compatibility helper
export interface UserData {
  role: UserRole | string;
  name: string;
  email: string;
  staffNo?: string;
}

export type AuthUser = User;

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  userData: UserData | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string, displayName: string, employeeId?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({ 
  user: null, 
  userProfile: null,
  userData: null, 
  loading: true,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  signUpWithEmail: async () => {},
  resetPassword: async () => {},
  logout: async () => {},
  refreshProfile: async () => {}
});

export const useAuth = () => useContext(AuthContext);

// System administrator bootstrap list
const BOOTSTRAP_ADMIN_EMAILS = [
  'shafi3396@gmail.com',
  'admin@enerpack.com',
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync profile document with Firestore
  const syncOrCreateUserProfile = async (firebaseUser: User): Promise<UserProfile> => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const userDocSnap = await getDoc(userDocRef).catch((err) => {
      console.warn('Could not read user profile from Firestore:', err);
      return null;
    });

    const isBootstrap = BOOTSTRAP_ADMIN_EMAILS.includes((firebaseUser.email || '').toLowerCase().trim());
    const nowIso = new Date().toISOString();

    if (!userDocSnap || !userDocSnap.exists()) {
      // New User Profile
      const initialProfile: UserProfile = {
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
        phoneNumber: firebaseUser.phoneNumber || '',
        // Requirement 6: New users are status="pending", role="EMPLOYEE", unless bootstrap admin
        role: isBootstrap ? 'SUPER_ADMIN' : 'EMPLOYEE',
        department: isBootstrap ? 'Executive Management' : 'Operations',
        employeeId: '',
        status: isBootstrap ? 'active' : 'pending',
        createdAt: nowIso,
        lastLoginAt: nowIso,
        approvedBy: isBootstrap ? 'system_bootstrap' : undefined,
        approvedAt: isBootstrap ? nowIso : undefined,
      };

      await setDoc(userDocRef, initialProfile, { merge: true }).catch((err) => {
        console.warn('Error saving initial user profile:', err);
      });

      // Audit Log: Account Created
      await logAuditEvent({
        userId: firebaseUser.uid,
        userName: initialProfile.displayName,
        action: 'Account Created',
        module: 'Auth',
        recordId: firebaseUser.uid,
        newValue: JSON.stringify({ role: initialProfile.role, status: initialProfile.status })
      });

      return initialProfile;
    } else {
      // Existing User Profile
      const existingData = userDocSnap.data() as UserProfile;
      
      // Auto-grant SUPER_ADMIN if bootstrap admin email
      let updatedRole = existingData.role;
      let updatedStatus = existingData.status;

      if (isBootstrap && (existingData.role !== 'SUPER_ADMIN' || existingData.status !== 'active')) {
        updatedRole = 'SUPER_ADMIN';
        updatedStatus = 'active';
      }

      const updatedProfile: UserProfile = {
        ...existingData,
        displayName: existingData.displayName || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
        email: firebaseUser.email || existingData.email,
        photoURL: firebaseUser.photoURL || existingData.photoURL || '',
        role: updatedRole || 'EMPLOYEE',
        status: updatedStatus || 'pending',
        lastLoginAt: nowIso,
      };

      await updateDoc(userDocRef, {
        lastLoginAt: nowIso,
        role: updatedProfile.role,
        status: updatedProfile.status,
        displayName: updatedProfile.displayName,
        photoURL: updatedProfile.photoURL,
      }).catch((err) => {
        console.warn('Error updating lastLoginAt:', err);
      });

      // Audit Log: Login
      await logAuditEvent({
        userId: firebaseUser.uid,
        userName: updatedProfile.displayName,
        action: 'Login',
        module: 'Auth',
        recordId: firebaseUser.uid,
      });

      return updatedProfile;
    }
  };

  useEffect(() => {
    let unsubscribeSnapshot: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const profile = await syncOrCreateUserProfile(firebaseUser);
          setUserProfile(profile);

          // Listen for real-time changes to user profile (e.g. status approval, role change)
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          unsubscribeSnapshot = onSnapshot(
            userDocRef,
            (snap) => {
              if (snap.exists()) {
                const liveData = snap.data() as UserProfile;
                setUserProfile(liveData);
              }
            },
            (err) => {
              console.warn('Profile snapshot error (using cached profile):', err);
            }
          );
        } catch (error) {
          console.error('Error synchronizing user profile:', error);
        } finally {
          setLoading(false);
        }
      } else {
        if (unsubscribeSnapshot) {
          unsubscribeSnapshot();
          unsubscribeSnapshot = null;
        }
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeSnapshot) unsubscribeSnapshot();
    };
  }, []);

  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithEmail = async (emailInput: string, passInput: string) => {
    setLoading(true);
    const cleanEmail = emailInput.trim();
    try {
      await signInWithEmailAndPassword(auth, cleanEmail, passInput);
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const signUpWithEmail = async (emailInput: string, passInput: string, displayNameInput: string, employeeIdInput?: string) => {
    setLoading(true);
    const cleanEmail = emailInput.trim();
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, passInput);
      const nowIso = new Date().toISOString();
      const isBootstrap = BOOTSTRAP_ADMIN_EMAILS.includes(cleanEmail.toLowerCase());

      const initialProfile: UserProfile = {
        uid: cred.user.uid,
        displayName: displayNameInput.trim() || cleanEmail.split('@')[0],
        email: cred.user.email || cleanEmail,
        photoURL: '',
        phoneNumber: '',
        role: isBootstrap ? 'SUPER_ADMIN' : 'EMPLOYEE',
        department: isBootstrap ? 'Executive Management' : 'Operations',
        employeeId: employeeIdInput?.trim() || (isBootstrap ? 'ENP-EMP-001' : ''),
        status: isBootstrap ? 'active' : 'pending',
        createdAt: nowIso,
        lastLoginAt: nowIso,
        approvedBy: isBootstrap ? 'system_bootstrap' : undefined,
        approvedAt: isBootstrap ? nowIso : undefined,
      };

      const userDocRef = doc(db, 'users', cred.user.uid);
      await setDoc(userDocRef, initialProfile, { merge: true }).catch((err) => {
        console.warn('Error saving initial user profile in Firestore:', err);
      });
      setUserProfile(initialProfile);

      await logAuditEvent({
        userId: cred.user.uid,
        userName: initialProfile.displayName,
        action: 'Account Created',
        module: 'Auth',
        recordId: cred.user.uid,
        newValue: JSON.stringify({ role: initialProfile.role, status: initialProfile.status })
      }).catch((err) => console.warn('Audit log error on register:', err));
    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  };

  const resetPassword = async (emailInput: string) => {
    await sendPasswordResetEmail(auth, emailInput.trim());
  };

  const logout = async () => {
    if (user && userProfile) {
      await logAuditEvent({
        userId: user.uid,
        userName: userProfile.displayName,
        action: 'Logout',
        module: 'Auth',
        recordId: user.uid,
      });
    }
    await firebaseSignOut(auth);
    setUser(null);
    setUserProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        setUserProfile(snap.data() as UserProfile);
      }
    }
  };

  // Backward compatibility object
  const userData: UserData | null = userProfile ? {
    role: userProfile.role,
    name: userProfile.displayName,
    email: userProfile.email,
    staffNo: userProfile.employeeId
  } : null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      userData, 
      loading, 
      loginWithGoogle, 
      loginWithEmail, 
      signUpWithEmail, 
      resetPassword, 
      logout,
      refreshProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

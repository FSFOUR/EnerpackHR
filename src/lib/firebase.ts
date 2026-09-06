import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfigJson from "../../firebase-applet-config.json";

// Merge JSON config with optional VITE_ environment variable overrides for Cloudflare Pages / CI / CD
const rawApiKey = (import.meta.env.VITE_FIREBASE_API_KEY || "").trim();
const rawAuthDomain = (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "").trim();
const rawProjectId = (import.meta.env.VITE_FIREBASE_PROJECT_ID || "").trim();
const rawStorageBucket = (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "").trim();
const rawMessagingSenderId = (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "").trim();
const rawAppId = (import.meta.env.VITE_FIREBASE_APP_ID || "").trim();
const rawDbId = (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || "").trim();

export const firebaseConfig = {
  apiKey: rawApiKey || firebaseConfigJson?.apiKey || "",
  authDomain: rawAuthDomain || firebaseConfigJson?.authDomain || "",
  projectId: rawProjectId || firebaseConfigJson?.projectId || "",
  storageBucket: rawStorageBucket || firebaseConfigJson?.storageBucket || "",
  messagingSenderId: rawMessagingSenderId || firebaseConfigJson?.messagingSenderId || "",
  appId: rawAppId || firebaseConfigJson?.appId || "",
  firestoreDatabaseId: rawDbId || firebaseConfigJson?.firestoreDatabaseId || undefined,
};

// Task 9: Administrator Debug Information (Development Mode Only)
// Logs non-sensitive configuration for diagnosis without exposing secrets/tokens
if (import.meta.env.DEV) {
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'N/A';
  const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'N/A';
  console.groupCollapsed('🛠️ [ENERPACK HR] Firebase Debug Info (Dev Mode Only)');
  console.log('Firebase Project ID:', firebaseConfig.projectId);
  console.log('Firebase Auth Domain:', firebaseConfig.authDomain);
  console.log('Current Origin:', currentOrigin);
  console.log('Current Hostname:', currentHost);
  console.log('Authentication Providers Status:', {
    googleAuth: 'Configured (GoogleAuthProvider)',
    emailPasswordAuth: 'Configured (signInWithEmailAndPassword / createUserWithEmailAndPassword)',
  });
  console.log('Firestore Database ID:', firebaseConfig.firestoreDatabaseId || '(default)');
  console.groupEnd();
}

// Initialize Firebase App safely (avoid duplicate app initialization)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth & Firestore with specific database ID
export const auth = getAuth(app);
export const db = firebaseConfig.firestoreDatabaseId 
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Diagnostic connection test
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, '_connection_test', 'ping'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore client appears offline. Check network configuration.");
    }
  }
}

// Error handling standard conforming to FirestoreErrorInfo
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

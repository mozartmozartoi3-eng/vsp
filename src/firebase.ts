import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocFromServer } from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  User,
} from 'firebase/auth';
import appletFirebaseConfig from '../firebase-applet-config.json';

export const ADMIN_EMAIL = 'mozartmozartoi3@gmail.com';

export const firebaseConfig = appletFirebaseConfig;

// Initialize Firebase safely with provisioned databaseId
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

const verifiedAdminUids = new Set<string>();

export function clearVerifiedAdminCache(): void {
  verifiedAdminUids.clear();
}

export function isAuthorizedAdminUser(user: User | null | undefined): boolean {
  if (!user || !user.email || user.emailVerified !== true) return false;
  const emailLower = user.email.trim().toLowerCase();
  if (emailLower === ADMIN_EMAIL) return true;
  return verifiedAdminUids.has(user.uid);
}

export async function verifyAdminAuthorization(
  user: User | null | undefined
): Promise<boolean> {
  if (!user || !user.email || user.emailVerified !== true) {
    return false;
  }
  const emailLower = user.email.trim().toLowerCase();
  if (emailLower === ADMIN_EMAIL) {
    return true;
  }
  if (verifiedAdminUids.has(user.uid)) {
    return true;
  }

  try {
    const uidSnap = await getDoc(doc(db, 'admins', user.uid));
    if (uidSnap.exists()) {
      verifiedAdminUids.add(user.uid);
      return true;
    }
  } catch (err) {
    console.warn('Vérification /admins/{uid} ignorée:', err);
  }

  return false;
}

export async function signInWithSharedCredentials(
  email: string,
  password: string
): Promise<{ firebaseAuthenticated: boolean; user?: User }> {
  try {
    const res = await signInWithEmailAndPassword(auth, email.trim(), password);
    const authorized = await verifyAdminAuthorization(res.user);
    return { firebaseAuthenticated: authorized, user: res.user };
  } catch {
    return { firebaseAuthenticated: false };
  }
}

export async function signInAdminWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, googleProvider);
  const authorized = await verifyAdminAuthorization(result.user);
  if (!authorized) {
    const email = result.user?.email || 'inconnu';
    await signOut(auth).catch(() => {});
    throw new Error(
      `Le compte "${email}" ne correspond pas à l'accès partagé (${ADMIN_EMAIL}). Veuillez sélectionner le compte commun ${ADMIN_EMAIL}.`
    );
  }
  return result.user;
}

export async function signOutFirebaseAdmin(): Promise<void> {
  clearVerifiedAdminCache();
  await signOut(auth);
}

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
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function buildFirestoreErrorInfo(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  return {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo = buildFirestoreErrorInfo(error, operationType, path);
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface FirebaseConnectionStatus {
  connected: boolean;
  testing: boolean;
  latencyMs?: number;
  lastChecked?: Date;
  error?: string;
  projectId: string;
  authDomain: string;
  databaseId?: string;
}

// Startup connection validation required by Firebase SDK setup
export async function testConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();

// Live diagnostic check for admin header and diagnostic screen
export async function testFirebaseConnection(): Promise<{
  success: boolean;
  latencyMs: number;
  error?: string;
}> {
  const startTime = Date.now();
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    const latencyMs = Date.now() - startTime;
    return { success: true, latencyMs };
  } catch (error: any) {
    const latencyMs = Date.now() - startTime;
    const msg = error?.message || 'Erreur inconnue de connexion Firebase';
    console.error('Firebase connection test error:', error);
    return { success: false, latencyMs, error: msg };
  }
}

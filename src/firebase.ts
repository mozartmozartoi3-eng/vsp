import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, getDocFromServer } from 'firebase/firestore';
import {
  getAuth,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  User,
} from 'firebase/auth';
import appletFirebaseConfig from '../firebase-applet-config.json';

export const SHARED_ADMIN_EMAIL = 'mozartmozartoi3@gmail.com';
export const ADMIN_EMAIL = SHARED_ADMIN_EMAIL;
export const AUTHORIZED_ADMIN_EMAILS = [
  'mozartmozartoi3@gmail.com',
  'amautosanspermis@gmail.com',
] as const;

export const firebaseConfig = appletFirebaseConfig;

// Initialize Firebase safely with provisioned databaseId
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const verifiedAdminUids = new Set<string>();

export function clearVerifiedAdminCache(): void {
  verifiedAdminUids.clear();
}

export function isAuthorizedAdminUser(user: User | null | undefined): boolean {
  if (!user || !user.email || user.emailVerified !== true) return false;
  const emailLower = user.email.trim().toLowerCase();
  if ((AUTHORIZED_ADMIN_EMAILS as readonly string[]).includes(emailLower)) return true;
  return verifiedAdminUids.has(user.uid);
}

export async function verifyAdminAuthorization(
  user: User | null | undefined
): Promise<boolean> {
  if (!user || !user.email || user.emailVerified !== true) {
    return false;
  }
  const emailLower = user.email.trim().toLowerCase();
  if ((AUTHORIZED_ADMIN_EMAILS as readonly string[]).includes(emailLower)) {
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

export interface SharedCredentialsAuthResult {
  firebaseAuthenticated: boolean;
  reason:
    | 'ok'
    | 'email_not_verified'
    | 'operation_not_allowed'
    | 'user_not_found'
    | 'invalid_credential'
    | 'unauthorized_email'
    | 'error';
  verificationSent?: boolean;
  errorMessage?: string;
  user?: User;
}

export async function signInWithSharedCredentials(
  email: string,
  password: string
): Promise<SharedCredentialsAuthResult> {
  const cleanEmail = email.trim();
  if (!cleanEmail || !password) {
    return {
      firebaseAuthenticated: false,
      reason: 'invalid_credential',
      errorMessage: 'Veuillez saisir votre adresse e-mail et votre mot de passe.',
    };
  }

  try {
    const res = await signInWithEmailAndPassword(auth, cleanEmail, password);

    if (res.user.emailVerified !== true) {
      let verificationSent = false;
      try {
        await sendEmailVerification(res.user);
        verificationSent = true;
      } catch (verifyErr) {
        console.warn('Envoi lien de vérification ignoré:', verifyErr);
      }
      await signOut(auth).catch(() => {});
      return {
        firebaseAuthenticated: false,
        reason: 'email_not_verified',
        verificationSent,
        errorMessage: verificationSent
          ? `Première connexion : un lien de validation vient d'être envoyé à ${cleanEmail}. Ouvrez votre boîte mail (vérifiez aussi les spams), cliquez une seule fois sur ce lien puis reconnectez-vous.`
          : `Cette adresse e-mail doit d'abord être validée via le lien reçu par e-mail (vérifiez aussi les spams) avant de vous connecter.`,
      };
    }

    const authorized = await verifyAdminAuthorization(res.user);
    if (!authorized) {
      await signOut(auth).catch(() => {});
      return {
        firebaseAuthenticated: false,
        reason: 'unauthorized_email',
        errorMessage: `L'adresse ${res.user.email} n'est pas autorisée à accéder au backoffice.`,
      };
    }

    return { firebaseAuthenticated: true, reason: 'ok', user: res.user };
  } catch (err: any) {
    const code = String(err?.code || '');
    if (code === 'auth/operation-not-allowed') {
      return {
        firebaseAuthenticated: false,
        reason: 'operation_not_allowed',
        errorMessage:
          `La connexion par E-mail / Mot de passe n'est pas encore activée dans Firebase Authentication (Sign-in method). Activez-la une seule fois dans la console Firebase.`,
      };
    }
    if (code === 'auth/user-not-found') {
      return {
        firebaseAuthenticated: false,
        reason: 'user_not_found',
        errorMessage:
          `Aucun accès trouvé pour ${cleanEmail}. Vérifiez l'adresse e-mail ou créez ce compte dans Firebase Authentication > Users.`,
      };
    }
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password') {
      return {
        firebaseAuthenticated: false,
        reason: 'invalid_credential',
        errorMessage: `Identifiant ou mot de passe incorrect.`,
      };
    }
    if (code === 'auth/invalid-email') {
      return {
        firebaseAuthenticated: false,
        reason: 'invalid_credential',
        errorMessage: `L'adresse e-mail saisie n'est pas valide.`,
      };
    }
    if (code === 'auth/too-many-requests') {
      return {
        firebaseAuthenticated: false,
        reason: 'error',
        errorMessage: `Trop de tentatives récentes. Patientez quelques instants avant de réessayer.`,
      };
    }
    return {
      firebaseAuthenticated: false,
      reason: 'error',
      errorMessage: err?.message || 'Connexion impossible pour le moment.',
    };
  }
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

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
  Auth
} from 'firebase/auth';
import defaultConfig from '../../firebase-applet-config.json';

export interface FirebaseAppConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  storageBucket: string;
  messagingSenderId: string;
  oAuthClientId?: string;
  measurementId?: string;
}

const CUSTOM_CONFIG_KEY = 'al_tracker_custom_firebase_config';

export function getActiveFirebaseConfig(): FirebaseAppConfig {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(CUSTOM_CONFIG_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.projectId && parsed.apiKey) {
          return {
            ...defaultConfig,
            ...parsed,
          };
        }
      }
    } catch {
      // Fallback if JSON parse fails
    }
  }

  // Fallback to environment variables or packaged config
  return {
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
    appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
    oAuthClientId: import.meta.env.VITE_FIREBASE_OAUTH_CLIENT_ID || defaultConfig.oAuthClientId,
    measurementId: defaultConfig.measurementId || '',
  };
}

export function saveCustomFirebaseConfig(config: Partial<FirebaseAppConfig>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CUSTOM_CONFIG_KEY, JSON.stringify(config));
    window.location.reload();
  }
}

export function resetCustomFirebaseConfig() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CUSTOM_CONFIG_KEY);
    window.location.reload();
  }
}

let app: FirebaseApp = getApps().length === 0 ? initializeApp(getActiveFirebaseConfig()) : getApps()[0];
export let auth: Auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
// Required Google Drive scope
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

// In-memory token cache (never stored in localStorage as per security policy)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

export interface EnhancedAuthError extends Error {
  code?: string;
  isUnauthorizedDomain?: boolean;
  domain?: string;
  projectId?: string;
  consoleUrl?: string;
}

export const googleSignIn = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Google Sign-in did not return an access token.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-in failed:', error);
    const activeCfg = getActiveFirebaseConfig();
    const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
    
    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      const enhanced: EnhancedAuthError = new Error(
        `Firebase Error: The domain '${currentHost}' is not authorized in Firebase project '${activeCfg.projectId}'.`
      );
      enhanced.code = 'auth/unauthorized-domain';
      enhanced.isUnauthorizedDomain = true;
      enhanced.domain = currentHost;
      enhanced.projectId = activeCfg.projectId;
      enhanced.consoleUrl = `https://console.firebase.google.com/project/${activeCfg.projectId}/authentication/settings`;
      throw enhanced;
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const setAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

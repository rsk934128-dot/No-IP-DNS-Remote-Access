import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App instance
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Authentication instance
export const auth = getAuth(app);

// Firestore instance targeting the provisioned database ID with robust connection settings
const dbInstance = (() => {
  const dbId = firebaseConfig.firestoreDatabaseId || '(default)';
  try {
    return initializeFirestore(app, {
      experimentalForceLongPolling: true,
    }, dbId);
  } catch {
    return getFirestore(app, dbId);
  }
})();

export const db = dbInstance;

export default app;


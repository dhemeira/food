import { getApps, initializeApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import type { FirebaseConfig } from './config';

export interface FirebaseServices {
  auth: Auth;
  firestore: Firestore;
}

export function initFirebase(config: FirebaseConfig): FirebaseServices {
  const existingApp = getApps()[0];
  const app = existingApp ?? initializeApp(config);

  const auth = getAuth(app);
  const firestore = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  });

  return { auth, firestore };
}

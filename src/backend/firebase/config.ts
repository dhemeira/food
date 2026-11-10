export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

function envValue(key: string): string {
  const value: unknown = import.meta.env[key];

  return typeof value === 'string' ? value : '';
}

function requiredEnv(key: string): string {
  const value = envValue(key);

  if (value === '') {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
}

export const firebaseConfig: FirebaseConfig = {
  apiKey: requiredEnv('VITE_FIREBASE_API_KEY'),
  authDomain: requiredEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: requiredEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: requiredEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: requiredEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: requiredEnv('VITE_FIREBASE_APP_ID'),
};

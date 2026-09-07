import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut as fbSignOut,
  type Auth,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Firestore,
} from 'firebase/firestore';
import type { AuthApi, Backend, ImagesApi, RecipesApi, Unsubscribe, UsersApi } from '../Backend';
import type { User } from '../types';
import { recipeFromFirestore, recipeToFields } from './converters';

const RECIPES = 'recipes';
const USERS = 'users';

export class FirebaseBackend implements Backend {
  readonly auth: AuthApi;
  readonly recipes: RecipesApi;
  readonly users: UsersApi;
  readonly images: ImagesApi;

  constructor(firebaseAuth: Auth, firestore: Firestore, imageApiUrl: string) {
    this.auth = createAuthApi(firebaseAuth);
    this.recipes = createRecipesApi(firebaseAuth, firestore);
    this.users = createUsersApi(firestore);
    this.images = createImagesApi(firebaseAuth, imageApiUrl);
  }
}

function toUser(user: FirebaseUser | null): User | null {
  if (!user) return null;
  return { id: user.uid, email: user.email, displayName: user.displayName, role: null };
}

function createAuthApi(auth: Auth): AuthApi {
  const googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });

  return {
    currentUser() {
      return Promise.resolve(toUser(auth.currentUser));
    },

    onAuthChange(callback) {
      return onAuthStateChanged(auth, (user) => {
        callback(toUser(user));
      });
    },

    async signInWithGoogle() {
      const result = await signInWithPopup(auth, googleProvider);
      const user = toUser(result.user);
      if (!user) throw new Error('Google sign-in failed');
      return user;
    },

    async signOut() {
      await fbSignOut(auth);
    },
  };
}

function createRecipesApi(auth: Auth, firestore: Firestore): RecipesApi {
  const recipes = collection(firestore, RECIPES);
  const ordered = query(recipes, orderBy('updatedAt', 'desc'));

  return {
    async list() {
      const snapshot = await getDocs(ordered);
      return snapshot.docs.map((d) => recipeFromFirestore(d.id, d.data()));
    },

    watch(callback) {
      return onSnapshot(ordered, (snapshot) => {
        callback(snapshot.docs.map((d) => recipeFromFirestore(d.id, d.data())));
      });
    },

    async get(id) {
      const snapshot = await getDoc(doc(recipes, id));
      return snapshot.exists() ? recipeFromFirestore(snapshot.id, snapshot.data()) : null;
    },

    async create(input) {
      const uid = auth.currentUser?.uid ?? null;
      const ref = doc(recipes);

      await setDoc(ref, {
        ...recipeToFields(input),
        createdBy: uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const created = await getDoc(ref);
      const data = created.data();
      if (!data) throw new Error('Failed to read created recipe');
      return recipeFromFirestore(ref.id, data);
    },

    async update(id, input) {
      await updateDoc(doc(recipes, id), {
        ...recipeToFields(input),
        updatedAt: serverTimestamp(),
      });
    },

    async remove(id) {
      await deleteDoc(doc(recipes, id));
    },
  };
}

function createUsersApi(firestore: Firestore): UsersApi {
  const users = collection(firestore, USERS);

  return {
    watchRole(uid, callback): Unsubscribe {
      return onSnapshot(doc(users, uid), (snapshot) => {
        if (!snapshot.exists()) {
          callback(null);
          return;
        }
        const role = snapshot.data().role as unknown;
        callback(role === 'admin' || role === 'family' ? role : null);
      });
    },
  };
}

function createImagesApi(auth: Auth, baseUrl: string): ImagesApi {
  async function getToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');
    return user.getIdToken();
  }

  return {
    async upload(recipeId, file) {
      const token = await getToken();
      const body = new FormData();
      body.append('file', file);

      const response = await fetch(`${baseUrl}/upload/${encodeURIComponent(recipeId)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body,
      });

      if (!response.ok) {
        throw new Error(`Image upload failed (${String(response.status)})`);
      }

      const data = (await response.json()) as { url?: unknown };
      if (typeof data.url !== 'string') {
        throw new Error('Image upload response missing URL');
      }
      return data.url;
    },

    async remove(recipeId) {
      const token = await getToken();
      const response = await fetch(`${baseUrl}/upload/${encodeURIComponent(recipeId)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error(`Image delete failed (${String(response.status)})`);
      }
    },
  };
}

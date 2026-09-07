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
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type Firestore,
} from 'firebase/firestore';
import type { AuthApi, Backend, ImagesApi, RecipesApi, Unsubscribe, UsersApi } from '../Backend';
import type { User } from '../types';
import { recipeFromFirestore, recipeToFields } from './converters';

const RECIPES = 'recipes';
const RECIPE_IMAGES = 'recipeImages';
const USERS = 'users';

export class FirebaseBackend implements Backend {
  readonly auth: AuthApi;
  readonly recipes: RecipesApi;
  readonly users: UsersApi;
  readonly images: ImagesApi;

  constructor(firebaseAuth: Auth, firestore: Firestore) {
    this.auth = createAuthApi(firebaseAuth);
    this.recipes = createRecipesApi(firebaseAuth, firestore);
    this.users = createUsersApi(firestore);
    this.images = createImagesApi(firestore);
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
  const images = collection(firestore, RECIPE_IMAGES);
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
        hasImage: false,
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
      const batch = writeBatch(firestore);
      batch.delete(doc(recipes, id));
      batch.delete(doc(images, id));
      await batch.commit();
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

function createImagesApi(firestore: Firestore): ImagesApi {
  const images = collection(firestore, RECIPE_IMAGES);
  const recipes = collection(firestore, RECIPES);

  return {
    async set(recipeId, image) {
      const batch = writeBatch(firestore);
      batch.set(doc(images, recipeId), {
        full: image.full,
        updatedAt: serverTimestamp(),
      });
      batch.update(doc(recipes, recipeId), { thumb: image.thumb, hasImage: true });
      await batch.commit();
    },

    async get(recipeId) {
      const snapshot = await getDoc(doc(images, recipeId));
      if (!snapshot.exists()) {
        return null;
      }
      const full = snapshot.data().full as unknown;
      return typeof full === 'string' ? full : null;
    },

    async remove(recipeId) {
      const batch = writeBatch(firestore);
      batch.delete(doc(images, recipeId));
      batch.update(doc(recipes, recipeId), { thumb: null, hasImage: false });
      await batch.commit();
    },
  };
}

import type { Backend } from './Backend';
import { initFirebase } from './firebase/app';
import { firebaseConfig } from './firebase/config';
import { FirebaseBackend } from './firebase/FirebaseBackend';

export type { AuthApi, Backend, ImagesApi, RecipesApi, Unsubscribe, UsersApi } from './Backend';
export type {
  CalorieUnit,
  Ingredient,
  Recipe,
  RecipeImage,
  RecipeInput,
  Role,
  Step,
  User,
} from './types';
export { CALORIE_UNITS } from './types';

const { auth, firestore } = initFirebase(firebaseConfig);

export const backend: Backend = new FirebaseBackend(auth, firestore);

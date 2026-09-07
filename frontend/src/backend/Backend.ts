import type { Recipe, RecipeInput, Role, User } from './types';

export type Unsubscribe = () => void;

export interface AuthApi {
  currentUser(): Promise<User | null>;
  onAuthChange(callback: (user: User | null) => void): Unsubscribe;
  signInWithGoogle(): Promise<User>;
  signOut(): Promise<void>;
}

export interface RecipesApi {
  list(): Promise<Recipe[]>;
  watch(callback: (recipes: Recipe[]) => void): Unsubscribe;
  get(id: string): Promise<Recipe | null>;
  create(input: RecipeInput): Promise<Recipe>;
  update(id: string, input: RecipeInput): Promise<void>;
  remove(id: string): Promise<void>;
}

export interface UsersApi {
  watchRole(uid: string, callback: (role: Role | null) => void): Unsubscribe;
}

export interface ImagesApi {
  upload(recipeId: string, file: File): Promise<string>;
  remove(recipeId: string): Promise<void>;
}

export interface Backend {
  readonly auth: AuthApi;
  readonly recipes: RecipesApi;
  readonly users: UsersApi;
  readonly images: ImagesApi;
}

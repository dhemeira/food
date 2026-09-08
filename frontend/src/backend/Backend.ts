import type { Recipe, RecipeImage, RecipeInput, Role, User } from './types';

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
  watchProfile(uid: string, callback: (profile: UserProfile | null) => void): Unsubscribe;
  setDisplayName(uid: string, displayName: string | null): Promise<void>;
}

export interface UserProfile {
  role: Role | null;
  displayName: string | null;
}

export interface ImagesApi {
  set(recipeId: string, image: RecipeImage): Promise<void>;
  get(recipeId: string): Promise<string | null>;
  remove(recipeId: string): Promise<void>;
}

export interface Backend {
  readonly auth: AuthApi;
  readonly recipes: RecipesApi;
  readonly users: UsersApi;
  readonly images: ImagesApi;
}

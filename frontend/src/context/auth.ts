import { createContext, use } from 'react';
import type { User } from '~/backend';

export interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  /** Whether the signed-in user's email is in `settings/config.allowedEmails`. */
  isAllowed: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = use(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export function username(user: User): string {
  return user.displayName ?? user.email ?? user.id;
}

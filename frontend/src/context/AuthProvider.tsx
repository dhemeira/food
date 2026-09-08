import { useEffect, useRef, useState, type ReactNode } from 'react';
import { backend, type Unsubscribe, type User } from '~/backend';
import { AuthContext, type AuthContextValue } from '~/context/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const roleUnsubscribeRef = useRef<Unsubscribe | null>(null);

  useEffect(() => {
    const unsubscribeAuth = backend.auth.onAuthChange((authUser) => {
      roleUnsubscribeRef.current?.();
      roleUnsubscribeRef.current = null;

      if (authUser === null) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      roleUnsubscribeRef.current = backend.users.watchProfile(authUser.id, (profile) => {
        setUser({
          id: authUser.id,
          email: authUser.email,
          displayName: profile?.displayName ?? authUser.displayName,
          role: profile?.role ?? null,
        });
        setIsLoading(false);
      });
    });

    return () => {
      unsubscribeAuth();
      roleUnsubscribeRef.current?.();
    };
  }, []);

  async function signIn(): Promise<void> {
    await backend.auth.signInWithGoogle();
  }

  async function signOut(): Promise<void> {
    await backend.auth.signOut();
  }

  const value: AuthContextValue = {
    user,
    isAdmin: user?.role === 'admin',
    isLoading,
    signIn,
    signOut,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

import { useEffect, useState, type ReactNode } from 'react';
import { getMe, login as apiLogin, logout as apiLogout } from '~/api/auth';
import type { User } from '~/types';
import { AuthContext, type AuthContextValue } from '~/context/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    void getMe()
      .then((current) => {
        if (!controller.signal.aborted) {
          setUser(current);
        }
      })
      .catch(() => {
        /* offline or unauthenticated: stay signed out */
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, []);

  async function login(username: string, password: string): Promise<void> {
    setUser(await apiLogin(username, password));
  }

  async function logout(): Promise<void> {
    await apiLogout();
    setUser(null);
  }

  const value: AuthContextValue = {
    user,
    isAdmin: user?.role === 'admin',
    isLoading,
    login,
    logout,
  };

  return <AuthContext value={value}>{children}</AuthContext>;
}

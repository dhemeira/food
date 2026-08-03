import { useEffect, useState, type ReactNode } from 'react';
import { getMe, login as apiLogin, logout as apiLogout, type User } from '~/api/auth';
import { AuthContext, type AuthContextValue } from '~/context/auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    void getMe()
      .then((current) => {
        if (!cancelled) {
          setUser(current);
        }
      })
      .catch(() => {
        /* offline or unauthenticated: stay signed out */
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
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

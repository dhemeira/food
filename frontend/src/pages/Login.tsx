import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import Layout from '~/components/Layout';
import { Button, Input } from '~/components/ui';
import { useAuth } from '~/context/auth';

interface LocationState {
  from?: string;
}

function Login() {
  const { user, isLoading, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = (location.state as LocationState | null)?.from ?? '/';

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <h1 className="text-text text-3xl font-semibold">Bejelentkezés</h1>
        </div>
      </Layout>
    );
  }

  if (user) {
    return <Navigate to={redirectTo} replace />;
  }

  function handleSubmit() {
    setError(null);

    if (username.trim() === '' || password === '') {
      setError('Add meg a felhasználónevet és a jelszót!');
      return;
    }

    setSubmitting(true);
    void login(username.trim(), password)
      .then(() => {
        void navigate(redirectTo, { replace: true });
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'A bejelentkezés sikertelen.');
      })
      .finally(() => {
        setSubmitting(false);
      });
  }

  return (
    <Layout>
      <div className="mx-auto flex max-w-sm flex-col gap-6 py-20">
        <div className="text-center">
          <h1 className="text-text text-3xl font-semibold">Bejelentkezés</h1>
          <p className="text-text-muted mt-1 text-sm">Jelentkezz be, hogy elérd a recepteket.</p>
        </div>

        <form
          className="bg-surface border-border flex flex-col gap-4 rounded-xl border p-6"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}>
          <Input
            label="Felhasználónév"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
            autoComplete="username"
            autoFocus
            required
          />
          <Input
            type="password"
            label="Jelszó"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            autoComplete="current-password"
            required
          />
          {error && <p className="text-accent text-sm">{error}</p>}
          <Button type="submit" loading={submitting}>
            Bejelentkezés
          </Button>
        </form>
      </div>
    </Layout>
  );
}

export default Login;

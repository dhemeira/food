import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { changePassword, listUsers } from '~/api/admin';
import type { User } from '~/api/auth';

function Admin() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<User | null>(null);

  useEffect(() => {
    let cancelled = false;

    void listUsers()
      .then((data) => {
        if (!cancelled) {
          setUsers(data);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'A felhasználók betöltése sikertelen.');
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  function reload() {
    setError(null);
    setLoading(true);
    void listUsers()
      .then((data) => {
        setUsers(data);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'A felhasználók betöltése sikertelen.');
      })
      .finally(() => {
        setLoading(false);
      });
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-title text-text text-3xl font-semibold">Admin</h1>
        <Link className="text-accent text-sm font-medium hover:underline" to="/">
          ← Vissza a receptekhez
        </Link>
      </div>

      {loading ? (
        <div className="text-text-muted p-10 text-center">Betöltés...</div>
      ) : error ? (
        <div className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="text-accent">{error}</p>
          <button
            type="button"
            className="border-border hover:bg-surface rounded-xl border px-4 py-2 text-sm font-medium"
            onClick={reload}>
            Újra
          </button>
        </div>
      ) : (
        <div className="bg-surface border-border overflow-hidden rounded-xl border">
          {users.map((user) => (
            <div
              key={user.id}
              className="border-border flex items-center justify-between border-b px-4 py-3 last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="text-text font-medium">{user.username}</span>
                <span className="bg-accent/10 text-accent rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {user.role === 'admin' ? 'Admin' : 'Családtag'}
                </span>
              </div>
              <button
                type="button"
                className="border-border hover:bg-background rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors"
                onClick={() => {
                  setSelected(user);
                }}>
                Jelszó módosítása
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <PasswordModal
          user={selected}
          onClose={() => {
            setSelected(null);
          }}
        />
      )}
    </main>
  );
}

interface PasswordModalProps {
  user: User;
  onClose: () => void;
}

function PasswordModal({ user, onClose }: PasswordModalProps) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  function handleSubmit() {
    setError(null);

    if (password.length < 8) {
      setError('A jelszónak legalább 8 karakternek kell lennie.');
      return;
    }

    if (password !== confirm) {
      setError('A két jelszó nem egyezik.');
      return;
    }

    setSaving(true);
    void changePassword(user.id, password)
      .then(() => {
        setDone(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'A jelszó módosítása sikertelen.');
      })
      .finally(() => {
        setSaving(false);
      });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}>
      <div
        className="bg-surface w-full max-w-sm rounded-2xl p-6 shadow-lg"
        onClick={(event) => {
          event.stopPropagation();
        }}>
        <h2 className="font-title text-text text-xl font-semibold">Jelszó módosítása</h2>
        <p className="text-text-muted mt-1 text-sm">
          Felhasználó: <span className="text-text font-medium">{user.username}</span>
        </p>

        {done ? (
          <div className="mt-4 flex flex-col gap-4">
            <p className="text-success">A jelszó sikeresen módosítva.</p>
            <button
              type="button"
              className="bg-accent text-surface rounded-xl px-4 py-2.5 font-medium"
              onClick={onClose}>
              Kész
            </button>
          </div>
        ) : (
          <form
            className="mt-4 flex flex-col gap-3"
            onSubmit={(event) => {
              event.preventDefault();
              handleSubmit();
            }}>
            <label className="flex flex-col gap-1">
              <span className="text-text text-sm">Új jelszó</span>
              <input
                type="password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                }}
                className="border-border bg-background rounded-xl border px-3 py-2 focus:outline-none"
                autoFocus
                required
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-text text-sm">Jelszó megerősítése</span>
              <input
                type="password"
                value={confirm}
                onChange={(event) => {
                  setConfirm(event.target.value);
                }}
                className="border-border bg-background rounded-xl border px-3 py-2 focus:outline-none"
                required
              />
            </label>
            {error && <p className="text-accent text-sm">{error}</p>}
            <div className="mt-2 flex justify-end gap-3">
              <button
                type="button"
                className="border-border hover:bg-background rounded-xl border px-4 py-2 text-sm font-medium transition-colors"
                onClick={onClose}>
                Mégse
              </button>
              <button
                type="submit"
                className="bg-accent text-surface rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50"
                disabled={saving}>
                {saving ? 'Mentés...' : 'Mentés'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default Admin;

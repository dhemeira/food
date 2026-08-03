import { useState } from 'react';
import { createUser, deleteUser, listUsers, type CreateUserInput } from '~/api/admin';
import { useAuth } from '~/context/auth';
import { useApi } from '~/hooks/useApi';
import { LoadingState, ErrorState, Button, Modal, Input } from '~/components/ui';
import EditUserModal from '~/components/EditUserModal';
import Layout from '~/components/Layout';
import type { User } from '~/types';

function Admin() {
  const { data: users, loading, error, reload } = useApi(() => listUsers());
  const { user: currentUser } = useAuth();

  if (loading) {
    return (
      <Layout>
        <LoadingState />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorState message={error} onRetry={reload} />
      </Layout>
    );
  }

  return <AdminView users={users ?? []} onUsersChanged={reload} currentUser={currentUser} />;
}

interface AdminViewProps {
  users: User[];
  onUsersChanged: () => void;
  currentUser: User | null;
}

function AdminView({ users, onUsersChanged, currentUser }: AdminViewProps) {
  const [selected, setSelected] = useState<User | null>(null);
  const [adding, setAdding] = useState(false);
  const { refreshUser } = useAuth();

  function handleEditClose() {
    const edited = selected;
    setSelected(null);
    onUsersChanged();
    if (edited !== null && currentUser?.id === edited.id) {
      void refreshUser();
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-text text-3xl font-semibold">Admin</h1>
        <Button
          onClick={() => {
            setAdding(true);
          }}>
          Új felhasználó
        </Button>
      </div>

      <div className="bg-surface border-border overflow-hidden rounded-xl border">
        {users.length === 0 ? (
          <p className="text-text-muted p-6 text-center">Nincsenek felhasználók.</p>
        ) : (
          users.map((user) => (
            <div
              key={user.id}
              className="border-border flex items-center justify-between border-b px-4 py-3 last:border-b-0">
              <div className="flex items-center gap-3">
                <span className="text-text font-medium">{user.username}</span>
                {currentUser?.id === user.id && (
                  <span className="text-text-muted text-xs">(te)</span>
                )}
                <span className="bg-accent/10 text-accent rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {user.role === 'admin' ? 'Admin' : 'Családtag'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setSelected(user);
                  }}>
                  Szerkesztés
                </Button>
                {currentUser?.id !== user.id && (
                  <DeleteUserButton user={user} onDeleted={onUsersChanged} />
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selected && (
        <EditUserModal
          user={selected}
          onClose={() => {
            handleEditClose();
          }}
        />
      )}

      {adding && (
        <AddUserModal
          onClose={() => {
            setAdding(false);
          }}
          onCreated={() => {
            setAdding(false);
            onUsersChanged();
          }}
        />
      )}
    </Layout>
  );
}

function DeleteUserButton({ user, onDeleted }: { user: User; onDeleted: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  if (!confirming) {
    return (
      <Button
        variant="danger"
        onClick={() => {
          setConfirming(true);
        }}>
        Törlés
      </Button>
    );
  }

  function handleDelete() {
    setError(null);
    setDeleting(true);
    void deleteUser(user.id)
      .then(() => {
        setConfirming(false);
        onDeleted();
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'A felhasználó törlése sikertelen.');
        setDeleting(false);
      });
  }

  return (
    <span className="flex items-center gap-2">
      <span className="text-text-muted text-sm">Biztosan?</span>
      <Button variant="danger" onClick={handleDelete} loading={deleting}>
        Igen
      </Button>
      <Button
        variant="secondary"
        disabled={deleting}
        onClick={() => {
          setConfirming(false);
          setError(null);
        }}>
        Mégse
      </Button>
      {error && <span className="text-accent text-sm">{error}</span>}
    </span>
  );
}

function AddUserModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [form, setForm] = useState<CreateUserInput>({ username: '', password: '', role: 'family' });
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [createdUser, setCreatedUser] = useState<User | null>(null);

  function update<K extends keyof CreateUserInput>(key: K, value: CreateUserInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const trimmedUsername = form.username.trim();
  const usernameValid = /^[a-z]{3,}$/.test(trimmedUsername);

  function handleSubmit() {
    setError(null);

    if (!usernameValid) {
      return;
    }

    if (form.password.length < 5) {
      return;
    }

    if (form.password !== confirm) {
      return;
    }

    setSaving(true);
    void createUser({ ...form, username: trimmedUsername })
      .then((user) => {
        setCreatedUser(user);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'A felhasználó létrehozása sikertelen.');
      })
      .finally(() => {
        setSaving(false);
      });
  }

  return (
    <Modal open onClose={onClose} title="Új felhasználó">
      {createdUser ? (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-success">
            {createdUser.username} létrehozva. A jelszót add át neki biztonságos módon.
          </p>
          <Button
            onClick={() => {
              onClose();
              onCreated();
            }}>
            Kész
          </Button>
        </div>
      ) : (
        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}>
          <Input
            label="Felhasználónév"
            value={form.username}
            onChange={(event) => {
              update('username', event.target.value);
            }}
            autoFocus
            required
            autoComplete="off"
            placeholder="pl. istvan"
            hint="Legalább 3 karakter, csak kisbetű (a–z), szóköz nélkül."
            hintError={trimmedUsername !== '' && !usernameValid}
          />
          <Input
            type="password"
            label="Jelszó"
            value={form.password}
            onChange={(event) => {
              update('password', event.target.value);
            }}
            required
            autoComplete="new-password"
            placeholder="Add meg a jelszót"
            hint="Legalább 5 karakter."
            hintError={form.password !== '' && form.password.length < 5}
          />
          <Input
            type="password"
            label="Jelszó megerősítése"
            value={confirm}
            onChange={(event) => {
              setConfirm(event.target.value);
            }}
            required
            autoComplete="new-password"
            placeholder="Add meg újra a jelszót"
            hint="Egyezzen a jelszóval."
            hintError={form.password !== '' && form.password !== confirm}
          />
          <label htmlFor="user-role" className="flex flex-col gap-1">
            <span className="text-text text-sm">Szerepkör</span>
            <select
              id="user-role"
              className="border-border bg-background rounded-xl border px-3 py-2 focus:outline-none"
              value={form.role}
              onChange={(event) => {
                update('role', event.target.value as User['role']);
              }}>
              <option value="family">Családtag</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          {error && <p className="text-accent text-sm">{error}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={onClose}>
              Mégse
            </Button>
            <Button type="submit" loading={saving}>
              Létrehozás
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default Admin;

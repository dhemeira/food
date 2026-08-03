import { useState } from 'react';
import { listUsers } from '~/api/admin';
import { useAuth } from '~/context/auth';
import { useApi } from '~/hooks/useApi';
import { LoadingState, ErrorState, Button } from '~/components/ui';
import PasswordModal from '~/components/PasswordModal';
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

  return (
    <AdminView
      users={users ?? []}
      onPasswordChanged={reload}
      onClose={() => {
        /* handled by state */
      }}
      currentUser={currentUser}
    />
  );
}

interface AdminViewProps {
  users: User[];
  onPasswordChanged: () => void;
  onClose: () => void;
  currentUser: User | null;
}

function AdminView({ users, onPasswordChanged, currentUser }: AdminViewProps) {
  const [selected, setSelected] = useState<User | null>(null);

  return (
    <Layout>
      <h1 className="text-text mb-6 text-3xl font-semibold">Admin</h1>

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
                <span className="bg-accent/10 text-accent rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {user.role === 'admin' ? 'Admin' : 'Családtag'}
                </span>
                {currentUser?.id === user.id && (
                  <span className="text-text-muted text-xs">(te)</span>
                )}
              </div>
              <Button
                variant="secondary"
                onClick={() => {
                  setSelected(user);
                }}>
                Jelszó módosítása
              </Button>
            </div>
          ))
        )}
      </div>

      {selected && (
        <PasswordModal
          user={selected}
          onClose={() => {
            setSelected(null);
            onPasswordChanged();
          }}
        />
      )}
    </Layout>
  );
}

export default Admin;

import { useState } from 'react';
import type { User } from '~/types';
import { changePassword } from '~/api/admin';
import { Button, Input, Modal } from '~/components/ui';

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
    <Modal open onClose={onClose} title="Jelszó módosítása">
      <p className="text-text-muted mt-1 text-sm">
        Felhasználó: <span className="text-text font-medium">{user.username}</span>
      </p>

      {done ? (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-success">A jelszó sikeresen módosítva.</p>
          <Button onClick={onClose}>Kész</Button>
        </div>
      ) : (
        <form
          className="mt-4 flex flex-col gap-3"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}>
          <Input
            type="password"
            label="Új jelszó"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            autoFocus
            required
          />
          <Input
            type="password"
            label="Jelszó megerősítése"
            value={confirm}
            onChange={(event) => {
              setConfirm(event.target.value);
            }}
            required
          />
          {error && <p className="text-accent text-sm">{error}</p>}
          <div className="mt-2 flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={onClose}>
              Mégse
            </Button>
            <Button type="submit" loading={saving}>
              Mentés
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

export default PasswordModal;

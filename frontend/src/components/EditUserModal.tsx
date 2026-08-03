import { useState } from 'react';
import type { User } from '~/types';
import { changePassword, changeUsername } from '~/api/admin';
import { Button, Input, Modal } from '~/components/ui';

interface EditUserModalProps {
  user: User;
  onClose: () => void;
}

function EditUserModal({ user, onClose }: EditUserModalProps) {
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const trimmedUsername = username.trim();
  const usernameChanged = trimmedUsername !== user.username;
  const usernameValid = /^[a-z]{3,}$/.test(trimmedUsername);
  const passwordChanged = password !== '';

  function handleSubmit() {
    setError(null);

    if (usernameChanged && !usernameValid) {
      return;
    }

    if ((passwordChanged || confirm !== '') && password.length < 5) {
      return;
    }

    if ((passwordChanged || confirm !== '') && password !== confirm) {
      return;
    }

    if (!usernameChanged && !passwordChanged) {
      setError('Nincs módosítandó adat.');
      return;
    }

    setSaving(true);

    const operations: Promise<unknown>[] = [];
    if (usernameChanged) {
      operations.push(changeUsername(user.id, trimmedUsername));
    }
    if (passwordChanged) {
      operations.push(changePassword(user.id, password));
    }

    void Promise.all(operations)
      .then(() => {
        setDone(true);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'A mentés sikertelen.');
      })
      .finally(() => {
        setSaving(false);
      });
  }

  return (
    <Modal open onClose={onClose} title="Felhasználó szerkesztése">
      {done ? (
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-success">A felhasználó adatai sikeresen mentve.</p>
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
            label="Felhasználónév"
            value={username}
            onChange={(event) => {
              setUsername(event.target.value);
            }}
            autoFocus
            required
            autoComplete="off"
            placeholder="pl. istvan"
            hint="Legalább 3 karakter, csak kisbetű (a–z), szóköz nélkül."
            hintError={usernameChanged && !usernameValid}
          />
          <Input
            type="password"
            label="Új jelszó"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
            }}
            placeholder="Hagyd üresen, ha nem módosítod"
            autoComplete="new-password"
            hint="Legalább 5 karakter."
            hintError={(passwordChanged || confirm !== '') && password.length < 5}
          />
          <Input
            type="password"
            label="Jelszó megerősítése"
            value={confirm}
            onChange={(event) => {
              setConfirm(event.target.value);
            }}
            autoComplete="new-password"
            placeholder="Hagyd üresen, ha nem módosítod"
            hint="Egyezzen a jelszóval."
            hintError={(passwordChanged || confirm !== '') && password !== confirm}
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

export default EditUserModal;

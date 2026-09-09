import { useState } from 'react';
import { backend } from '~/backend';
import { Button, Input } from '@dhemeira/ui';
import { useAuth } from '~/context/auth';

function Profile() {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!user) {
    return null;
  }

  const userId = user.id;

  async function handleSubmit(): Promise<void> {
    const name = displayName.trim();
    setSaving(true);
    setError(null);
    try {
      await backend.users.setDisplayName(userId, name === '' ? null : name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Mentés közben hiba történt.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <h1>Profil</h1>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSubmit();
        }}>
        <Input
          label="Megjelenített név"
          value={displayName}
          hint="Üresen hagyva a Google név jelenik meg."
          onChange={(event) => {
            setDisplayName(event.target.value);
          }}
        />
        {error ? <p>{error}</p> : null}
        <Button type="submit" loading={saving}>
          Mentés
        </Button>
      </form>
    </div>
  );
}

export default Profile;

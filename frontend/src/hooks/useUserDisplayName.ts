import { useEffect, useState } from 'react';
import { backend } from '~/backend';

export function useUserDisplayName(uid: string | null | undefined): string | null {
  const [displayName, setDisplayName] = useState<string | null>(null);

  const [previousUid, setPreviousUid] = useState(uid);
  if (previousUid !== uid) {
    setPreviousUid(uid);
    setDisplayName(null);
  }

  useEffect(() => {
    if (!uid) return;

    return backend.users.watchProfile(uid, (profile) => {
      setDisplayName(profile?.displayName ?? null);
    });
  }, [uid]);

  return displayName;
}

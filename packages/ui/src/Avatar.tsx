import type { CSSProperties } from 'react';

interface AvatarProps {
  username: string;
  popoverTarget?: string;
  style?: CSSProperties;
}

/**
 * Avatar shows a circular badge with the initials derived from `username`.
 *
 * ```tsx
 * <Avatar username={user.displayName} />
 * <Avatar username={user.displayName} popoverTarget="account-menu" />
 * ```
 */
function Avatar({ username, popoverTarget, style }: AvatarProps) {
  const initials = username
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join('');
  const HUES = [0, 225, 210, 15, 240, 250, 260, 275, 290, 330, 350];
  const hue = HUES[initials.charCodeAt(0) % HUES.length];

  return (
    <button
      popoverTarget={popoverTarget}
      style={{ ...style, backgroundColor: `hsl(${String(hue)}, 60%, 40%)` }}
      title={username}
      className="bg-ui-surface text-ui-text border-ui-text aspect-square h-9 rounded-full border-2 text-center font-bold hover:brightness-110">
      {initials}
    </button>
  );
}

export default Avatar;

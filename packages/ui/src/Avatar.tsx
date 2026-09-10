import type { CSSProperties } from "react";

interface AvatarProps {
  username: string;
  /**
   * Value the background color is derived from. Defaults to `username`, so the
   * color is stable for a given name — pass a stable id (e.g. the user id) if
   * the name can change.
   */
  seed?: string;
  className?: string;
  style?: CSSProperties;
}

const HUES = [0, 225, 210, 15, 240, 250, 260, 275, 290, 330, 350];
const HASH_SEED = 7;

function hashSeed(seed: string): number {
  let hash = HASH_SEED;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Avatar shows a circular badge with the initials derived from `username`.
 * It is presentational only; wrap it in a `<button>` or `<a>` to make it
 * interactive.
 *
 * ```tsx
 * <Avatar username={user.displayName} />
 * <Avatar username={user.displayName} seed={user.id} className="h-8" />
 * ```
 */
function Avatar({ username, seed = username, className, style }: AvatarProps) {
  const initials = username
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("");
  const hue = HUES[hashSeed(seed) % HUES.length] ?? 0;

  return (
    <span
      style={{ ...style, backgroundColor: `hsl(${String(hue)}, 60%, 40%)` }}
      title={username}
      className={`bg-ui-surface text-ui-text border-ui-text inline-flex aspect-square items-center justify-center rounded-full border-2 font-bold ${
        className ?? "h-9"
      }`}
    >
      {initials}
    </span>
  );
}

export default Avatar;

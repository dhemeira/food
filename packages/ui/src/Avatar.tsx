import type { CSSProperties } from "react";

interface AvatarProps {
  username: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Avatar shows a circular badge with the initials derived from `username`.
 * It is presentational only; wrap it in a `<button>` or `<a>` to make it
 * interactive.
 *
 * ```tsx
 * <Avatar username={user.displayName} />
 * <Avatar username={user.displayName} className="h-8" />
 * ```
 */
function Avatar({ username, className, style }: AvatarProps) {
  const initials = username
    .trim()
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("");
  const HUES = [0, 225, 210, 15, 240, 250, 260, 275, 290, 330, 350];
  const hue = HUES[initials.charCodeAt(0) % HUES.length] ?? 0;

  return (
    <span
      style={{ ...style, backgroundColor: `hsl(${String(hue)}, 60%, 40%)` }}
      title={username}
      className={`bg-ui-surface text-ui-text inline-flex border-ui-text aspect-square rounded-full border-2 items-center justify-center font-bold ${
        className ?? "h-9"
      }`}
    >
      {initials}
    </span>
  );
}

export default Avatar;

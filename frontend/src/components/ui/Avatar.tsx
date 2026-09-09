interface Props {
  username: string;
  popoverTarget?: string;
  style?: React.CSSProperties;
}

function Avatar({ username, popoverTarget, style }: Props) {
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
      className="bg-surface text-text border-text aspect-square h-9 rounded-full border-2 text-center font-bold hover:brightness-110">
      {initials}
    </button>
  );
}

export default Avatar;

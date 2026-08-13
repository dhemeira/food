interface Props {
  username: string;
  popoverTarget: string;
  style?: React.CSSProperties;
}

function Avatar({ username, popoverTarget, style }: Props) {
  const initial = username.charAt(0);
  const HUES = [0, 225, 210, 15, 240, 250, 260, 275, 290, 330, 350];
  const hue = HUES[initial.charCodeAt(0) % HUES.length];

  return (
    <button
      popoverTarget={popoverTarget}
      style={{ ...style, backgroundColor: `hsl(${String(hue)}, 60%, 40%)` }}
      className="bg-surface border-border text-text aspect-square w-9 rounded-full border text-center font-bold hover:brightness-110">
      {initial}
    </button>
  );
}

export default Avatar;

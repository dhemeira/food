interface Props {
  username: string;
  popoverTarget?: string;
  style?: React.CSSProperties;
  offline?: boolean;
}

function Avatar({ username, popoverTarget, style, offline = false }: Props) {
  const initial = username.charAt(0);
  const HUES = [0, 225, 210, 15, 240, 250, 260, 275, 290, 330, 350];
  let hue = HUES[9];
  if (!offline) {
    hue = HUES[initial.charCodeAt(0) % HUES.length];
  }

  return (
    <button
      popoverTarget={popoverTarget}
      style={{ ...style, backgroundColor: `hsl(${String(hue)}, 60%, 40%)` }}
      title={username}
      className={
        (offline ? 'cursor-default px-3 ' : 'aspect-square hover:brightness-110 ') +
        'bg-surface text-text border-text flex h-9 items-center justify-center rounded-full border-2 font-bold'
      }>
      {offline ? 'Guest' : initial}
    </button>
  );
}

export default Avatar;

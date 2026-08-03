interface Props {
  isVisible: boolean;
}

function OfflineBanner({ isVisible }: Props) {
  if (!isVisible) return null;

  return (
    <div className="bg-warning-bg text-warning border-warning-border sticky top-0 z-10 border-b px-4 py-2 text-center text-sm">
      Offline &mdash; a gyorsítótárazott verziót látod
    </div>
  );
}

export default OfflineBanner;

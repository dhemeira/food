function DevBanner() {
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="bg-warning-bg text-warning border-warning-border sticky top-0 right-5.5 z-50 flex h-8 items-center justify-center border-b text-center text-sm font-medium">
      Fejlesztői verzió
    </div>
  );
}

export default DevBanner;

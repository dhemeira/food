function DevBanner() {
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="bg-warning-bg text-warning border-warning-border flex h-8 items-center justify-center border-b text-center text-sm font-medium">
      Fejlesztői verzió
    </div>
  );
}

export default DevBanner;

function DevBanner() {
  if (import.meta.env.PROD) {
    return null;
  }

  return <div>Fejlesztői verzió</div>;
}

export default DevBanner;

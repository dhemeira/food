import { useServiceWorkerUpdate } from '~/pwa/useServiceWorkerUpdate';

function UpdateBanner() {
  const { updateAvailable, reload } = useServiceWorkerUpdate();

  if (!updateAvailable) return null;

  return (
    <div className="bg-accent text-surface fixed top-0 right-0 left-0 z-50 flex items-center justify-between gap-3 px-4 py-2.5 text-sm shadow-md">
      <span>Új verzió érhető el.</span>
      <button
        className="rounded-lg bg-white/20 px-3 py-1 font-medium transition-colors hover:bg-white/30"
        onClick={() => void reload()}>
        Frissítés
      </button>
    </div>
  );
}

export default UpdateBanner;

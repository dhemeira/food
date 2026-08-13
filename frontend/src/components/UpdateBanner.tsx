import { useServiceWorkerUpdate } from '~/pwa/useServiceWorkerUpdate';

function UpdateBanner() {
  const { updateAvailable, reload } = useServiceWorkerUpdate();

  if (!updateAvailable) return null;

  return (
    <div className="bg-surface text-text border-accent fixed right-2 bottom-22 z-50 rounded-xl border text-sm sm:bottom-2">
      <div className="bg-accent-soft flex items-center justify-between gap-3 px-3 py-2">
        <span>Új verzió érhető el.</span>
        <button
          className="bg-accent text-surface rounded-lg px-3 py-1 font-medium brightness-100 transition-colors hover:brightness-80"
          onClick={() => void reload()}>
          Frissítés
        </button>
      </div>
    </div>
  );
}

export default UpdateBanner;

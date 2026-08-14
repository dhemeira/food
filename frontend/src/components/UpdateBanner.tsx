import { useServiceWorkerUpdate } from '~/pwa/useServiceWorkerUpdate';

function UpdateBanner() {
  const { updateAvailable, reload } = useServiceWorkerUpdate();

  if (!updateAvailable) return null;

  return (
    <div className="bg-surface text-text border-accent fixed right-5.5 bottom-23 left-5.5 z-50 h-15 overflow-hidden rounded-full border text-sm font-medium sm:bottom-5.5 sm:left-auto sm:w-72">
      <div className="bg-accent-soft flex h-full w-full items-center justify-between gap-6 pr-2 pl-4">
        <span>Új verzió érhető el.</span>
        <button
          className="bg-accent text-surface rounded-full px-6 py-3 font-medium brightness-100 transition-colors hover:brightness-80"
          onClick={() => void reload()}>
          Frissítés
        </button>
      </div>
    </div>
  );
}

export default UpdateBanner;

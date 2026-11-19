import { WrenchIcon } from '@heroicons/react/24/outline';
import { GlassSurface } from '@dhemeira/ui';

function DevBanner() {
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <GlassSurface
      className="text-warning bg-warning-bg/90 fixed bottom-26 left-5.5 flex aspect-square w-fit items-center justify-center rounded-full border p-2 text-center text-sm font-medium sm:bottom-5.5"
      title="Fejlesztői verzió">
      <WrenchIcon className="size-6" />
    </GlassSurface>
  );
}

export default DevBanner;

import { WrenchIcon } from '@heroicons/react/24/outline';
import { GlassSurface } from '@dhemeira/ui';

function DevBanner() {
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <GlassSurface
      className="bg-warning/20! text-warning fixed right-5.5 bottom-26 flex aspect-square w-fit items-center justify-center rounded-full border p-2 text-center text-sm font-medium sm:bottom-5.5"
      title="Fejlesztői verzió">
      <WrenchIcon className="size-6" />
    </GlassSurface>
  );
}

export default DevBanner;

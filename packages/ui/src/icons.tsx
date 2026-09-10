import type { SVGProps } from 'react';
import { XMarkIcon as XMarkHeroIcon } from '@heroicons/react/24/outline';

/**
 * Internal icons. Imported from `@heroicons/react` and bundled as inline SVG,
 * so the published package carries the icon without exposing a heroicons
 * dependency (or the icons themselves) to consumers.
 */
export function XMarkIcon(props: SVGProps<SVGSVGElement>) {
  return <XMarkHeroIcon {...props} />;
}

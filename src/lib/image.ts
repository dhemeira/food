import type { RecipeImage } from '~/backend';

const FULL_WIDTH = 1000;
const FULL_HEIGHT = 400;
const THUMB_WIDTH = 400;
const THUMB_HEIGHT = 200;
// Firestore caps a document at 1 MiB; keep the two data URIs comfortably under it.
const MAX_COMBINED_LENGTH = 900_000;

const CARD_RATIO = THUMB_WIDTH / THUMB_HEIGHT;
const DETAIL_RATIO = FULL_WIDTH / FULL_HEIGHT;

export interface CropRegion {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SourceSize {
  width: number;
  height: number;
}

export interface CropRegions {
  card: CropRegion;
  detail: CropRegion;
}

function clamp(value: number, max: number): number {
  return Math.min(max, Math.max(0, value));
}

export function defaultCardCrop(size: SourceSize): CropRegion {
  const sourceRatio = size.width / size.height;

  if (sourceRatio > CARD_RATIO) {
    const width = CARD_RATIO / sourceRatio;
    return { x: (1 - width) / 2, y: 0, width, height: 1 };
  }

  const height = sourceRatio / CARD_RATIO;
  return { x: 0, y: (1 - height) / 2, width: 1, height };
}

/**
 * Builds the 2:1 card crop and the 5:2 detail crop from the card region.
 * The detail crop keeps the card's vertical extent and widens it, so it
 * always shows at least as much of the source as the card does.
 */
export function deriveCropRegions(card: CropRegion, size: SourceSize): CropRegions {
  const cardHeightPx = card.height * size.height;
  let detailHeightPx = cardHeightPx;
  let detailWidthPx = detailHeightPx * DETAIL_RATIO;

  if (detailWidthPx > size.width) {
    detailWidthPx = size.width;
    detailHeightPx = detailWidthPx / DETAIL_RATIO;
  }

  const centerX = (card.x + card.width / 2) * size.width;
  const centerY = (card.y + card.height / 2) * size.height;
  const x = clamp(centerX - detailWidthPx / 2, size.width - detailWidthPx);
  const y = clamp(centerY - detailHeightPx / 2, size.height - detailHeightPx);

  return {
    card,
    detail: {
      x: x / size.width,
      y: y / size.height,
      width: detailWidthPx / size.width,
      height: detailHeightPx / size.height,
    },
  };
}

function cropToDataUrl(
  file: File,
  width: number,
  height: number,
  quality: number,
  region: CropRegion
): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Canvas is not supported');

        const srcWidth = image.naturalWidth;
        const srcHeight = image.naturalHeight;
        const sx = clamp(Math.round(region.x * srcWidth), srcWidth - 1);
        const sy = clamp(Math.round(region.y * srcHeight), srcHeight - 1);
        const sw = Math.max(1, clamp(Math.round(region.width * srcWidth), srcWidth - sx));
        const sh = Math.max(1, clamp(Math.round(region.height * srcHeight), srcHeight - sy));

        context.drawImage(image, sx, sy, sw, sh, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      } catch (error) {
        reject(error instanceof Error ? error : new Error('Image processing failed'));
      } finally {
        URL.revokeObjectURL(url);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('A kép nem érvényes.'));
    };

    image.src = url;
  });
}

export async function processRecipeImage(
  file: File,
  card: CropRegion,
  size: SourceSize
): Promise<RecipeImage> {
  const regions = deriveCropRegions(card, size);
  const full = await cropToDataUrl(file, FULL_WIDTH, FULL_HEIGHT, 0.82, regions.detail);
  const thumb = await cropToDataUrl(file, THUMB_WIDTH, THUMB_HEIGHT, 0.7, regions.card);

  if (full.length + thumb.length > MAX_COMBINED_LENGTH) {
    throw new Error('A kép túl nagy a tároláshoz.');
  }

  return { full, thumb };
}

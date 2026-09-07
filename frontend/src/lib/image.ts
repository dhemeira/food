import type { RecipeImage } from '~/backend';

const FULL_WIDTH = 1000;
const FULL_HEIGHT = 400;
const THUMB_WIDTH = 400;
const THUMB_HEIGHT = 160;
const MAX_COMBINED_LENGTH = 900_000;

interface SourceRect {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

function coverRect(
  srcWidth: number,
  srcHeight: number,
  dstWidth: number,
  dstHeight: number
): SourceRect {
  const srcRatio = srcWidth / srcHeight;
  const dstRatio = dstWidth / dstHeight;

  if (srcRatio > dstRatio) {
    const sw = srcHeight * dstRatio;
    return { sx: (srcWidth - sw) / 2, sy: 0, sw, sh: srcHeight };
  }

  const sh = srcWidth / dstRatio;
  return { sx: 0, sy: (srcHeight - sh) / 2, sw: srcWidth, sh };
}

function cropToDataUrl(
  file: File,
  width: number,
  height: number,
  quality: number
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

        const source = coverRect(image.naturalWidth, image.naturalHeight, width, height);
        context.drawImage(image, source.sx, source.sy, source.sw, source.sh, 0, 0, width, height);

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

export async function processRecipeImage(file: File): Promise<RecipeImage> {
  const full = await cropToDataUrl(file, FULL_WIDTH, FULL_HEIGHT, 0.82);
  const thumb = await cropToDataUrl(file, THUMB_WIDTH, THUMB_HEIGHT, 0.7);

  if (full.length + thumb.length > MAX_COMBINED_LENGTH) {
    throw new Error('A kép túl nagy a tároláshoz.');
  }

  return { full, thumb };
}

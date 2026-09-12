import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const rounded = readFileSync(resolve(root, 'public/icon.svg'), 'utf8');

// A full-bleed version (square background, glyph in the safe zone) for the
// maskable mask and the iOS touch icon. Falls back to the rounded icon.
let full = null;
try {
  full = readFileSync(resolve(root, 'public/icon-maskable.svg'), 'utf8');
} catch {
  full = null;
}

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  return [
    Number.parseInt(h.slice(0, 2), 16),
    Number.parseInt(h.slice(2, 4), 16),
    Number.parseInt(h.slice(4, 6), 16),
  ];
}

/** The two gradient stops (top-left → bottom-right). */
function parseGradient(svgText) {
  const stops = [...svgText.matchAll(/stop-color="(#[0-9a-fA-F]{6})"/g)].map((m) => m[1]);
  return [stops[0] ?? '#000000', stops[1] ?? '#000000'];
}

function parseRadius(svgText) {
  const match = svgText.match(/<rect width="512" height="512" rx="(\d+)"/);
  return match ? Number(match[1]) : 0;
}

/** The icon without its gradient background rect (just the glyph). */
function stripBackground(svgText) {
  return svgText.replace(/<rect\b[^>]*fill="url\(#g\)"[^>]*\/>/, '');
}

/**
 * Renders the diagonal gradient with Floyd–Steinberg error diffusion. librsvg
 * (via sharp) quantises gradients to 8-bit without dithering, which bands on
 * dark icons; doing it ourselves keeps the gradient smooth.
 */
function ditherGradient(size, fromHex, toHex) {
  const from = hexToRgb(fromHex);
  const to = hexToRgb(toHex);
  const buffer = Buffer.alloc(size * size * 4);
  const error = [
    new Float32Array(size * size),
    new Float32Array(size * size),
    new Float32Array(size * size),
  ];

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const index = y * size + x;
      const t = (x + y) / (2 * (size - 1));
      for (let c = 0; c < 3; c += 1) {
        const target = from[c] + (to[c] - from[c]) * t + error[c][index];
        const clamped = Math.max(0, Math.min(255, target));
        const quantised = Math.round(clamped);
        const err = clamped - quantised;
        buffer[index * 4 + c] = quantised;
        if (x + 1 < size) error[c][index + 1] += (err * 7) / 16;
        if (y + 1 < size) {
          if (x > 0) error[c][index + size - 1] += (err * 3) / 16;
          error[c][index + size] += (err * 5) / 16;
          if (x + 1 < size) error[c][index + size + 1] += (err * 1) / 16;
        }
      }
      buffer[index * 4 + 3] = 255;
    }
  }
  return buffer;
}

async function makeIcon(svgText, size, out, opaque) {
  const [fromHex, toHex] = parseGradient(svgText);
  const radius = opaque ? 0 : parseRadius(svgText);

  const gradient = ditherGradient(size, fromHex, toHex);
  const maskSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${(radius * size) / 512}" fill="#ffffff" /></svg>`;
  const mask = await sharp(Buffer.from(maskSvg)).png().toBuffer();

  const masked = await sharp(gradient, { raw: { width: size, height: size, channels: 4 } })
    .composite([{ input: mask, blend: 'dest-in' }])
    .png()
    .toBuffer();

  const glyph = await sharp(Buffer.from(stripBackground(svgText)))
    .resize(size, size, { kernel: 'lanczos3' })
    .png()
    .toBuffer();

  await sharp(masked)
    .composite([{ input: glyph }])
    .png()
    .toFile(resolve(root, 'public', out));
}

await makeIcon(rounded, 192, 'icon-192.png', false);
await makeIcon(rounded, 512, 'icon-512.png', false);
await makeIcon(full ?? rounded, 512, 'icon-maskable-512.png', true);
await makeIcon(full ?? rounded, 180, 'apple-touch-icon.png', true);

console.log('PWA icons generated.');

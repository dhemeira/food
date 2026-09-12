import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const rounded = readFileSync(resolve(root, 'public/icon.svg'));
const full = readFileSync(resolve(root, 'public/icon-maskable.svg'));

async function generate(svg, size, out) {
  await sharp(svg).resize(size, size).png().toFile(resolve(root, 'public', out));
}

// Rounded corners for the manifest "any" icons.
await generate(rounded, 192, 'icon-192.png');
await generate(rounded, 512, 'icon-512.png');
// Full-bleed (no transparency) for the maskable mask and the iOS touch icon.
await generate(full, 512, 'icon-maskable-512.png');
await generate(full, 180, 'apple-touch-icon.png');

console.log('PWA icons generated.');

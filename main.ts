// Copies the entry image next to this script into the output directory.
import { copyFile, mkdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const source = fileURLToPath(new URL('./entry.png', import.meta.url));
const targetDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const destination = path.join(targetDir, 'entry.png');

try {
  const info = await stat(source);
  if (!info.isFile()) throw new Error('not a regular file');
} catch {
  console.error(`main.ts: source image not found at ${source}`);
  process.exit(1);
}

await mkdir(targetDir, { recursive: true });
await copyFile(source, destination);
console.log(`copied ${source} -> ${destination}`);

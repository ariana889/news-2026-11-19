// Copies entry.png next to this script into the output directory.
import { copyFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const source = fileURLToPath(new URL('./entry.png', import.meta.url));
const targetDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const destination = path.join(targetDir, 'entry.png');

function fail(message: string): void {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

try {
  await mkdir(targetDir, { recursive: true });
  await copyFile(source, destination);
} catch (error) {
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  if (code === 'ENOENT') fail(`source image not found at ${source}`);
  fail(`could not copy to ${destination}: ${message ?? String(error)}`);
}

console.log(`copied ${source} -> ${destination}`);

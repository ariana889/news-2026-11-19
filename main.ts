// Copies the entry image next to this script into the output directory.
import { copyFile, mkdir, open, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const MAX_BYTES = 1048576;
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const JPEG = Buffer.from([0xff, 0xd8, 0xff]);

const source = fileURLToPath(new URL('./entry.png', import.meta.url));
const targetDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
const destination = path.join(targetDir, 'entry.png');

function fail(message: string): void {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

try {
  const info = await stat(source);
  if (!info.isFile()) fail('not a regular file');
  if (info.size > MAX_BYTES) {
    fail(`source image is ${info.size} bytes, over the ${MAX_BYTES}-byte limit`);
  }
} catch (error) {
  if ((error as { code?: string })?.code === 'ENOENT') {
    fail(`source image not found at ${source}`);
  }
}

const handle = await open(source, 'r');
const head = Buffer.alloc(8);
try {
  const { bytesRead } = await handle.read(head, 0, head.length, 0);
  const isPng = head.subarray(0, 8).equals(PNG);
  const isJpeg = bytesRead >= 3 && head.subarray(0, 3).equals(JPEG);
  if (!isPng && !isJpeg) {
    fail(`source image is neither PNG nor JPEG (first bytes: ${head.subarray(0, bytesRead).toString('hex')})`);
  }
} finally {
  await handle.close();
}

await mkdir(targetDir, { recursive: true });
await copyFile(source, destination);
console.log(`copied ${source} -> ${destination}`);

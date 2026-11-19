// Copies entry.png next to this script into the output directory.
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

// Refuse anything that is not really a PNG or JPEG, and anything over 1 MiB.
async function checkSource(): Promise<void> {
  const info = await stat(source).catch(() => null);
  if (!info || !info.isFile()) fail(`source image not found at ${source}`);
  if (info.size > MAX_BYTES) {
    fail(`source image is ${info.size} bytes, over the ${MAX_BYTES}-byte limit`);
  }

  const handle = await open(source, 'r');
  const head = Buffer.alloc(PNG.length);
  try {
    const { bytesRead } = await handle.read(head, 0, head.length, 0);
    const isPng = bytesRead >= PNG.length && head.equals(PNG);
    const isJpeg = bytesRead >= JPEG.length && head.subarray(0, JPEG.length).equals(JPEG);
    if (!isPng && !isJpeg) {
      const seen = head.subarray(0, bytesRead).toString('hex');
      fail(`source image is neither PNG nor JPEG (first bytes: ${seen})`);
    }
  } finally {
    await handle.close();
  }
}

await checkSource();

try {
  await mkdir(targetDir, { recursive: true });
  await copyFile(source, destination);
} catch (error) {
  const { code, message } = (error ?? {}) as { code?: string; message?: string };
  if (code === 'ENOENT') fail(`source image not found at ${source}`);
  fail(`could not copy to ${destination}: ${message ?? String(error)}`);
}

console.log(`copied ${source} -> ${destination}`);

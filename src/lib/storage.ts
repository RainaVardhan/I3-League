import { mkdir, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// Local-disk stand-in for Cloudflare R2 — see CLAUDE.md tech stack, R2 setup
// is deliberately deferred until later. Every call site should only ever
// call this function, never touch the filesystem directly, so swapping to
// R2 later is a one-file change.
export async function saveUploadedFile(file: File, subdir: string): Promise<string | null> {
  if (file.size === 0) return null;
  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  const extension = EXTENSION_BY_TYPE[file.type];
  if (!ALLOWED_TYPES.has(file.type) || !extension) {
    throw new Error("FILE_TYPE_NOT_ALLOWED");
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subdir}/${filename}`;
}

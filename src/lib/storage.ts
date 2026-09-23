import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_BYTES = 5 * 1024 * 1024;

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// On Cloudflare the files live in an R2 bucket (the UPLOADS binding in
// wrangler.jsonc, one bucket per environment). When there is no such binding
// (local development on your own computer), files go to ./private-uploads
// instead. Callers never need to know which one is in use.
type R2Like = {
  put(key: string, value: ArrayBuffer, options?: { httpMetadata?: { contentType?: string } }): Promise<unknown>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
};

function uploadsBucket(): R2Like | null {
  try {
    const env = getCloudflareContext().env as { UPLOADS?: R2Like };
    return env.UPLOADS ?? null;
  } catch {
    return null; // not running on Cloudflare
  }
}

// Reads a stored file back (used by the authenticated /uploads route).
export async function readUploadedFile(subdir: string, filename: string): Promise<Uint8Array | null> {
  const bucket = uploadsBucket();
  if (bucket) {
    const object = await bucket.get(`${subdir}/${filename}`);
    return object ? new Uint8Array(await object.arrayBuffer()) : null;
  }
  try {
    return new Uint8Array(await readFile(path.join(PRIVATE_UPLOAD_ROOT, subdir, filename)));
  } catch {
    return null;
  }
}

// Local-disk stand-in for Cloudflare R2 — see CLAUDE.md tech stack, R2 setup
// is deliberately deferred until later. Every call site should only ever
// call this function, never touch the filesystem directly, so swapping to
// R2 later is a one-file change.
//
// Files are written to ./private-uploads, NOT ./public, because anything in
// public/ is served to anyone with the URL. The returned "/uploads/..." string
// is what gets stored in the database and rendered in pages; it is served by
// the route handler at src/app/uploads/[...path]/route.ts, which checks who is
// asking before sending the file.
export const PRIVATE_UPLOAD_ROOT = path.join(process.cwd(), "private-uploads");
export const UPLOAD_SUBDIRS = ["payment-screenshots", "insight-photos", "journal"] as const;
export async function saveUploadedFile(file: File, subdir: string): Promise<string | null> {
  if (!(UPLOAD_SUBDIRS as readonly string[]).includes(subdir)) throw new Error("UPLOAD_SUBDIR_NOT_ALLOWED");
  if (file.size === 0) return null;
  if (file.size > MAX_BYTES) {
    throw new Error("FILE_TOO_LARGE");
  }
  const extension = EXTENSION_BY_TYPE[file.type];
  if (!ALLOWED_TYPES.has(file.type) || !extension) {
    throw new Error("FILE_TYPE_NOT_ALLOWED");
  }

  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${extension}`;
  const bytes = await file.arrayBuffer();
  const bucket = uploadsBucket();
  if (bucket) {
    await bucket.put(`${subdir}/${filename}`, bytes, { httpMetadata: { contentType: file.type } });
  } else {
    const dir = path.join(PRIVATE_UPLOAD_ROOT, subdir);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), Buffer.from(bytes));
  }

  return `/uploads/${subdir}/${filename}`;
}

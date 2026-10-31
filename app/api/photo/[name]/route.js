import fs from "node:fs";
import path from "node:path";
import { INBOX_DIR } from "@/lib/paths";

export const dynamic = "force-dynamic";

const TYPES = {
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png",
  ".webp": "image/webp", ".gif": "image/gif", ".heic": "image/heic",
  ".pdf": "application/pdf",
};

export async function GET(_request, { params }) {
  const { name } = await params;
  // Never let a request escape the inbox directory.
  const safe = path.basename(name);
  const file = path.join(INBOX_DIR, safe);
  if (!file.startsWith(INBOX_DIR) || !fs.existsSync(file)) {
    return new Response("not found", { status: 404 });
  }
  const ext = path.extname(safe).toLowerCase();
  return new Response(fs.readFileSync(file), {
    headers: { "content-type": TYPES[ext] ?? "application/octet-stream", "cache-control": "no-store" },
  });
}
